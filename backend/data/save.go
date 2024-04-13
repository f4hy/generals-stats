package data

import (
	"fmt"
	pb "github.com/f4hy/generals-stats/backend/proto"
	s3 "github.com/f4hy/generals-stats/backend/s3"
	log "github.com/golang/glog"
	"google.golang.org/protobuf/proto"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

var (
	matchDetails     string = "match-details"
	matchInfo        string = "parsed-matches"
	matchDetailsPath        = filepath.Join(".", "cache", "matchDetails")
	// cachedDetail map[int64]*pb.MatchDetails
	cachedMatch map[string]*pb.MatchInfo
	mutex       = &sync.Mutex{}
)

func init() {
	isdev := os.Getenv("DEV")
	if isdev != "" {
		matchDetails = "dev/match-details"
		matchInfo = "dev/parsed-matches"
	}
	cachedMatch = make(map[string]*pb.MatchInfo)
	err := os.MkdirAll(matchDetailsPath, os.ModePerm)
	if err != nil {
		panic("could not make dir")
	}

}

func detailsPath(id int64) string {
	return fmt.Sprintf("%s/%d.proto", matchDetails, id)
}

func matchPath(id int64) string {
	return fmt.Sprintf("%s/%d.proto", matchInfo, id)
}

func SaveDetails(details *pb.MatchDetails) error {
	path := detailsPath(details.MatchId)
	dataToSave, err := proto.Marshal(details)
	if err != nil {
		return err
	}
	err = s3.AddDataToS3(path, dataToSave)
	return err
}

func SaveMatch(match *pb.MatchInfo) error {
	path := matchPath(match.Id)
	dataToSave, err := proto.Marshal(match)
	if err != nil {
		return err
	}
	err = s3.AddDataToS3(path, dataToSave)
	return err
}

func getMatch(c chan *pb.MatchInfo, matchpath string) {
	m, prs := cachedMatch[matchpath]
	if prs {
		log.Infof("match %s is cached", matchpath)
		c <- m
		return
	}
	log.Infof("fetching match %s", matchpath)
	matchdata, _ := s3.GetS3Data(matchpath)
	match := &pb.MatchInfo{}
	proto.Unmarshal(matchdata, match)
	mutex.Lock()
	cachedMatch[matchpath] = match
	mutex.Unlock()
	c <- match
}

func GetMatches() (*pb.Matches, error) {
	listing, err := s3.List(matchInfo)
	log.Infof("Found %d matchs", len(listing))
	if err != nil {
		return nil, err
	}
	start := time.Now()
	var matches []*pb.MatchInfo
	c := make(chan *pb.MatchInfo)
	for _, matchpath := range listing {
		// go routines are nice!
		go getMatch(c, matchpath)
	}
	for i := range listing {
		log.V(2).Infof("recieving match %d", i)
		match := <-c
		matches = append(matches, match)
	}
	log.Infof("Getting matches took %v", time.Since(start))
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].Timestamp.AsTime().After(matches[j].Timestamp.AsTime())
	})
	return &pb.Matches{
		Matches: matches,
	}, nil
}

func detailCachePath(match_id int64) string {
	filename := fmt.Sprintf("details_%d.proto", match_id)
	return filepath.Join(matchDetailsPath, filename)
}

func GetDetails(match_id int64) (*pb.MatchDetails, error) {
	cachepath := detailCachePath(match_id)
	details := &pb.MatchDetails{}
	_, err := os.Stat(cachepath)
	if err == nil {
		log.Infof("reading from cache %s", cachepath)
		data, err := os.ReadFile(cachepath)
		if err != nil {
			return details, err
		}
		err = proto.Unmarshal(data, details)
	} else {
		path := detailsPath(match_id)
		log.Infof("fetching match %s", path)
		data, err := s3.GetS3Data(path)
		if err != nil {
			return details, err
		}
		err = proto.Unmarshal(data, details)
		if err == nil {
			mutex.Lock()
			err := os.WriteFile(cachepath, data, 0644)
			if err != nil {
				return details, err
			}
			mutex.Unlock()
		}
	}
	return details, err
}

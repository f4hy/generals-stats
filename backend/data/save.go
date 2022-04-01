package data

import (
	"fmt"

	pb "github.com/f4hy/generals-stats/backend/proto"
	s3 "github.com/f4hy/generals-stats/backend/s3"
	log "github.com/golang/glog"
	"github.com/golang/protobuf/proto"
)

func SaveMatch(match *pb.MatchInfo) error {
	path := fmt.Sprintf("matches/%d.json", match.GetId())
	dataToSave, err := proto.Marshal(match)
	if err != nil {
		return err
	}
	log.Infof("Saving match to %s", path)
	err = s3.AddDataToS3(path, dataToSave)
	return err
}

func getMatch(c chan *pb.MatchInfo, matchpath string) {
	log.Infof("fetching match %s", matchpath)
	matchdata, _ := s3.GetS3Data(matchpath)
	match := &pb.MatchInfo{}
	proto.Unmarshal(matchdata, match)
	c <- match
}

func GetMatches() (*pb.Matches, error) {
	listing, err := s3.List("matches/")
	log.Infof("Found %d matchs", len(listing))
	if err != nil {
		return nil, err
	}
	var matches []*pb.MatchInfo
	c := make(chan *pb.MatchInfo)
	for _, matchpath := range listing {
		// go routines are nice!
		go getMatch(c, matchpath)
	}
	for i := range listing {
		log.Infof("recieving match %d", i)
		match := <-c
		matches = append(matches, match)
	}
	return &pb.Matches{
		Matches: matches,
	}, nil
}

package data

import (
	"fmt"

	pb "github.com/f4hy/generals-stats/backend/proto"
	s3 "github.com/f4hy/generals-stats/backend/s3"
	"github.com/golang/protobuf/proto"
	log "github.com/golang/glog"
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


func GetMatches() (*pb.Matches, error) {
	listing, err :=s3.List("matches/")
	log.Infof("Found %d matchs", len(listing))
	if err!=nil{
		return nil, err
	}
	var matches  []*pb.MatchInfo
	for _, matchpath := range listing {
		log.Infof("fetching match %s", matchpath)
		matchdata, err := s3.GetS3Data(matchpath)
		if err!=nil{
			return nil,err
		}
		match :=&pb.MatchInfo{};
		proto.Unmarshal(matchdata, match)
		matches = append(matches, match)		
	}
	return &pb.Matches{
		Matches: matches,
	}, nil
}

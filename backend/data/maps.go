package data

import (
	"sort"
	s3 "github.com/f4hy/generals-stats/backend/s3"
	log "github.com/golang/glog"

)

func ListMaps() ([]string, error) {
	results, err := s3.List("maps/")
	sort.Slice(results, func(i, j int) bool {
		return results[i] < results[j]
	})
	return results, err
}

func GetMap(mapname string) (string, error) {
	log.Infof("Getting map: %s", mapname)
	result, err := s3.GetPresignedUrl("maps/" + mapname)
	return result, err
}

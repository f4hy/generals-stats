package data

import (
        log "github.com/golang/glog"

        pb "github.com/f4hy/generals-stats/backend/proto"
        "github.com/samber/lo"
)

func Bayes(matches *pb.Matches)  {

        N := len(matches.Matches)
	log.V(1).Infof("Computing results for %v matches", N)
        grouped:= lo.GroupBy(matches.Matches, func(m pb.MatchInfo) pb.Team {
                return m.WinningTeam
        })
        teamWins := make(map[pb.Team]int64)
        teamRates := make(map[pb.Team]float64)
	log.V(1).Infof("Wins %v and Rates %v ", teamWins, teamRates)
        for t, ms := range grouped {
                teamWins[t] = len(ms)
                teamRates[t] = float64(len(ms)) / float64(N)

	}
	likelycounts := make(map[pb.BaysCondition]int64)
	for t, ms := range grouped{
		for _, m := range ms{
			cond := pb.BaysCondition{
				Team: t,
				MapOrPlayer: isBaysCondition_MapOrPlayer{m.Map},
			}
		}
	}
	
}

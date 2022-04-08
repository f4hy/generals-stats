package data

import (
	pb "github.com/f4hy/generals-stats/backend/proto"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	"math/rand"
)

func ExamplePlayers() []*pb.Player {
	var players []*pb.Player
	players = append(players, &pb.Player{
		Name:    "Bill",
		General: pb.General(rand.Intn(12)),
		Team:    pb.Team_THREE,
	})
	players = append(players, &pb.Player{
		Name:    "Sean",
		General: pb.General(rand.Intn(12)),
		Team:    pb.Team_THREE,
	})
	players = append(players, &pb.Player{
		Name:    "Brendan",
		General: pb.General(rand.Intn(12)),
		Team:    pb.Team_ONE,
	})
	players = append(players, &pb.Player{
		Name:    "Jared",
		General: pb.General(rand.Intn(12)),
		Team:    pb.Team_ONE,
	})
	return players
}

func ExampleMatches() pb.Matches {
	// Just provide a list of example matches for now
	timestamp := timestamppb.Now()
	var matches []*pb.MatchInfo
	for i := 1; i < 10; i++ {
		var winner pb.Team
		if rand.Intn(2) == 0 {
			winner = pb.Team_ONE
		} else {
			winner = pb.Team_THREE
		}

		matches = append(matches, &pb.MatchInfo{
			Id:          1,
			Timestamp:   timestamp,
			Map:         "some map",
			WinningTeam: winner,
			Players:     ExamplePlayers(),
		})
	}
	return pb.Matches{
		Matches: matches,
	}

}

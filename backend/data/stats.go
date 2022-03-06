package data

import (
        pb "github.com/f4hy/generals-stats/backend/proto"
)

func PlayerStats() pb.PlayerStats {
        var playerstats pb.PlayerStats;

        matches := ExampleMatches() // get real matches later
        player_stat_map := make(map[string]map[pb.General]*pb.WinLoss)

        for _, m := range matches.Matches {
                for _, p := range m.Players {
                        _, prs := player_stat_map[p.Name]
                        if(!prs){
                                player_stat_map[p.Name] = make(map[pb.General]*pb.WinLoss)
                        }
                        _, exists := player_stat_map[p.Name][p.General];
                        if(!exists){
                                player_stat_map[p.Name][p.General] = &pb.WinLoss{}
                        }
                        if(m.WinningTeam == p.Team){
                                player_stat_map[p.Name][p.General].Wins += 1;
                        }else{
                                player_stat_map[p.Name][p.General].Losses += 1;
                        }
                }
        }

	for player, g_wl := range player_stat_map {
		var generalWL []*pb.PlayerStat_GeneralWL;
		for general, winloss := range g_wl{
			generalWL = append(generalWL, &pb.PlayerStat_GeneralWL{
				General: general,
				WinLoss: winloss,
			})
		}
		playerstat := pb.PlayerStat{
			PlayerName: player,
			Stats: generalWL,
		}
		playerstats.PlayerStats = append(playerstats.PlayerStats, &playerstat)
	}
	
        return playerstats
}

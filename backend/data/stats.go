package data

import (
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
)

func PlayerStats() *pb.PlayerStats {
	var playerstats pb.PlayerStats

	matches, _ := GetMatches()
	player_stat_map := make(map[string]map[pb.General]*pb.WinLoss)

	for _, m := range matches.Matches {
		for _, p := range m.Players {
			_, prs := player_stat_map[p.Name]
			if !prs {
				player_stat_map[p.Name] = make(map[pb.General]*pb.WinLoss)
			}
			_, exists := player_stat_map[p.Name][p.General]
			if !exists {
				player_stat_map[p.Name][p.General] = &pb.WinLoss{}
			}
			if m.WinningTeam == p.Team {
				player_stat_map[p.Name][p.General].Wins += 1
			} else {
				player_stat_map[p.Name][p.General].Losses += 1
			}
		}
	}

	for player, g_wl := range player_stat_map {
		var generalWL []*pb.PlayerStat_GeneralWL
		for general, winloss := range g_wl {
			generalWL = append(generalWL, &pb.PlayerStat_GeneralWL{
				General: general,
				WinLoss: winloss,
			})
		}
		playerstat := pb.PlayerStat{
			PlayerName: player,
			Stats:      generalWL,
		}
		playerstats.PlayerStats = append(playerstats.PlayerStats, &playerstat)
	}

	return &playerstats
}

func GeneralStats() *pb.GeneralStats {
	var generalstats pb.GeneralStats

	matches, _ := GetMatches()
	general_stat_map := make(map[pb.General]map[string]*pb.WinLoss)
	overall := make(map[pb.General]*pb.WinLoss)
	for _, m := range matches.Matches {
		for _, p := range m.Players {
			_, prs := general_stat_map[p.General]
			if !prs {
				general_stat_map[p.General] = make(map[string]*pb.WinLoss)
			}
			_, exists := general_stat_map[p.General][p.Name]
			if !exists {
				general_stat_map[p.General][p.Name] = &pb.WinLoss{}
			}
			_, oex := overall[p.General]
			if !oex {
				overall[p.General] = &pb.WinLoss{}
			}
			if m.WinningTeam == p.Team {
				general_stat_map[p.General][p.Name].Wins += 1
				overall[p.General].Wins += 1
			} else {
				general_stat_map[p.General][p.Name].Losses += 1
				overall[p.General].Losses += 1
			}

		}
	}

	for general, p_wl := range general_stat_map {
		var playerWL []*pb.GeneralStat_PlayerWL
		for player, winloss := range p_wl {
			playerWL = append(playerWL, &pb.GeneralStat_PlayerWL{
				PlayerName: player,
				WinLoss:    winloss,
			})
		}
		playerstat := pb.GeneralStat{
			General: general,
			Stats:   playerWL,
			Total:   overall[general],
		}
		generalstats.GeneralStats = append(generalstats.GeneralStats, &playerstat)
	}

	return &generalstats
}

func getTeams(match *pb.MatchInfo) []pb.Team {
	teams := lo.Map(match.Players, func(p *pb.Player, _ int) pb.Team {
		return p.Team
	})
	return lo.Uniq(teams)
}

func TeamStats() *pb.TeamStats {
	var teamstats pb.TeamStats

	matches, _ := GetMatches()
	for _, m := range matches.Matches {
		winner := m.GetWinningTeam()
		date := m.Timestamp.AsTime()
		pbdate := pb.Date{Year: int32(date.Year()), Month: int32(date.Month()), Day: int32(date.Day())}
		match, exists := lo.Find(teamstats.TeamStats, func(p *pb.TeamStat) bool {
			dateEq := (pbdate.Year == p.Date.Year && pbdate.Month == p.Date.Month && pbdate.Day == p.Date.Day)
			return p.Team == winner && dateEq
		})
		if exists {
			match.Wins += 1
		} else {
			for _, t := range getTeams(m) {
				ts := pb.TeamStat{
					Date: &pbdate,
					Team: t,
					Wins: 0,
				}
				if t == winner {
					ts.Wins = 1
				}
				teamstats.TeamStats = append(teamstats.TeamStats, &ts)
			}
		}
	}
	return &teamstats
}

package data

import (
	"log"
	"sort"

	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
)

func getFaction(general pb.General) pb.Faction {
	if general == pb.General_AIR || general == pb.General_LASER || general == pb.General_SUPER || general == pb.General_USA {
		return pb.Faction_ANYUSA
	}
	if general == pb.General_INFANTRY || general == pb.General_NUKE || general == pb.General_TANK || general == pb.General_CHINA {
		return pb.Faction_ANYCHINA
	}
	return pb.Faction_ANYGLA
}

func PlayerStats(matches *pb.Matches) *pb.PlayerStats {
	var playerstats pb.PlayerStats

	player_stat_map := make(map[string]map[pb.General]*pb.WinLoss)
	player_faction_stat_map := make(map[string]map[pb.Faction]*pb.WinLoss)

	for _, m := range matches.Matches {
		for _, p := range m.Players {
			faction := getFaction(p.General)
			_, prs := player_stat_map[p.Name]
			if !prs {
				player_stat_map[p.Name] = make(map[pb.General]*pb.WinLoss)
			}
			_, exists := player_stat_map[p.Name][p.General]
			if !exists {
				player_stat_map[p.Name][p.General] = &pb.WinLoss{}
			}
			_, fprs := player_faction_stat_map[p.Name]
			if !fprs {
				player_faction_stat_map[p.Name] = make(map[pb.Faction]*pb.WinLoss)
			}
			_, fexists := player_faction_stat_map[p.Name][faction]
			if !fexists {
				player_faction_stat_map[p.Name][faction] = &pb.WinLoss{}
			}

			if m.WinningTeam == p.Team {
				player_stat_map[p.Name][p.General].Wins += 1
				player_faction_stat_map[p.Name][faction].Wins += 1
			} else {
				player_stat_map[p.Name][p.General].Losses += 1
				player_faction_stat_map[p.Name][faction].Losses += 1
			}
		}
	}

	for player, g_wl := range player_stat_map {
		var generalWL []*pb.GeneralWL
		var factionWL []*pb.PlayerStat_FactionWL
		for general, winloss := range g_wl {
			generalWL = append(generalWL, &pb.GeneralWL{
				General: general,
				WinLoss: winloss,
			})
			faction := getFaction(general)
			f_wl := player_faction_stat_map[player][faction]
			_, prs := lo.Find(factionWL, func(ps *pb.PlayerStat_FactionWL) bool {
				return ps.Faction == faction
			})
			if !prs {
				factionWL = append(factionWL, &pb.PlayerStat_FactionWL{
					Faction: faction,
					WinLoss: f_wl,
				})
			}
		}
		playerstat := pb.PlayerStat{
			PlayerName:   player,
			Stats:        generalWL,
			FactionStats: factionWL,
		}
		playerstats.PlayerStats = append(playerstats.PlayerStats, &playerstat)
	}
	sort.Slice(playerstats.PlayerStats, func(i, j int) bool {
		return playerstats.PlayerStats[i].PlayerName < playerstats.PlayerStats[j].PlayerName
	})
	return &playerstats
}

func GeneralStats(matches *pb.Matches) *pb.GeneralStats {
	var generalstats pb.GeneralStats

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

func TeamStats(matches *pb.Matches) *pb.TeamStats {
	var teamstats pb.TeamStats

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
	sort.Slice(teamstats.TeamStats, func(i, j int) bool {
		di := teamstats.TeamStats[i].Date
		dj := teamstats.TeamStats[j].Date
		return (di.Year*1000 + di.Month*100 + di.Day) < (dj.Year*1000 + dj.Month*100 + dj.Day)
	})
	return &teamstats
}

type team_and_map struct {
	team       pb.Team
	played_map string
}

func MapStats(matches *pb.Matches) *pb.MapStats {
	var teamstats pb.MapStats
	team_map_map := make(map[team_and_map]int)

	for _, m := range matches.Matches {
		tam := team_and_map{team: m.WinningTeam, played_map: m.Map}
		team_map_map[tam] += 1
	}
	for t_and_m, wins := range team_map_map {
		mapstats := &pb.MapStat{
			Map:  t_and_m.played_map,
			Team: t_and_m.team,
			Wins: int32(wins),
		}
		teamstats.MapStats = append(teamstats.MapStats, mapstats)
	}
	return &teamstats
}

type genpair struct {
	gen1 pb.General
	gen2 pb.General
}

type pairResult struct {
	team pb.Team
	pair genpair
	won  bool
}

func getPairs(match *pb.MatchInfo) []pairResult {
	winning := lo.Filter(match.Players, func(p *pb.Player, _ int) bool {
		return p.Team == match.WinningTeam
	})
	sort.Slice(winning, func(i, j int) bool {
		return winning[i].General.Number() < winning[j].General.Number()
	})
	losing := lo.Filter(match.Players, func(p *pb.Player, _ int) bool {
		return p.Team != match.WinningTeam
	})
	sort.Slice(losing, func(i, j int) bool {
		return losing[i].General.Number() < losing[j].General.Number()
	})
	p1 := pairResult{
		team: winning[0].Team,
		pair: genpair{
			gen1: winning[0].General,
			gen2: winning[1].General,
		},
		won: true,
	}
	p2 := pairResult{
		team: losing[0].Team,
		pair: genpair{
			gen1: losing[0].General,
			gen2: losing[1].General,
		},
		won: false,
	}
	return []pairResult{p1, p2}

}

func PairStats(matches *pb.Matches) *pb.TeamPairs {
	var pairstats pb.TeamPairs
	pairstats.TeamPairs = make(map[string]*pb.PairsWinLosses)
	teamMap := make(map[pb.Team]map[genpair]*pb.WinLoss)

	for _, m := range matches.Matches {
		for _, p := range getPairs(m) {
			gmap, prs := teamMap[p.team]
			if !prs {
				teamMap[p.team] = make(map[genpair]*pb.WinLoss)
			}
			gmap = teamMap[p.team]
			wl, prs := gmap[p.pair]
			if !prs {
				gmap[p.pair] = &pb.WinLoss{}
			}
			wl = gmap[p.pair]
			if p.won {
				wl.Wins += 1
			} else {
				wl.Losses += 1
			}
		}
	}
	for team, pairmap := range teamMap {
		pairwinlosses := pb.PairsWinLosses{}
		for pair, wl := range pairmap {
			pairwinlosses.Pairwl = append(pairwinlosses.Pairwl, &pb.PairWinLoss{
				General1: pair.gen1,
				General2: pair.gen2,
				Winloss:  wl,
			})
		}
		log.Print("Team??", team)
		log.Print("Team str??", team.String())
		teamstr := team.String()
		pairstats.TeamPairs[teamstr] = &pairwinlosses
	}
	return &pairstats
}

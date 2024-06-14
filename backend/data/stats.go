package data

import (
	"sort"
	"time"

	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
)

func getFaction(general pb.General) pb.Faction {
	switch general {
	case pb.General_AIR, pb.General_LASER, pb.General_SUPER, pb.General_USA:
		return pb.Faction_ANYUSA
	case pb.General_INFANTRY, pb.General_NUKE, pb.General_TANK, pb.General_CHINA:
		return pb.Faction_ANYCHINA
	default:
		return pb.Faction_ANYGLA
	}
}

func timeToDate(date time.Time) pb.Date {
	return pb.Date{Year: int32(date.Year()), Month: int32(date.Month()), Day: int32(date.Day())}
}

func PlayerStats(matches *pb.Matches) *pb.PlayerStats {
	var playerstats pb.PlayerStats

	playerStatMap := make(map[string]map[pb.General]*pb.WinLoss)
	playerFactionStatMap := make(map[string]map[pb.Faction]*pb.WinLoss)
	overTime := make(map[string]map[pb.General][]*pb.PlayerRateOverTime)

	sort.Slice(matches.Matches, func(i, j int) bool {
		return matches.Matches[i].Timestamp.Seconds < matches.Matches[j].Timestamp.Seconds
	})

	for _, m := range matches.Matches {
		for _, p := range m.Players {
			faction := getFaction(p.General)
			if _, exists := playerStatMap[p.Name]; !exists {
				playerStatMap[p.Name] = make(map[pb.General]*pb.WinLoss)
			}
			if _, exists := playerStatMap[p.Name][p.General]; !exists {
				playerStatMap[p.Name][p.General] = &pb.WinLoss{}
			}
			if _, exists := playerFactionStatMap[p.Name]; !exists {
				playerFactionStatMap[p.Name] = make(map[pb.Faction]*pb.WinLoss)
			}
			if _, exists := playerFactionStatMap[p.Name][faction]; !exists {
				playerFactionStatMap[p.Name][faction] = &pb.WinLoss{}
			}

			if m.WinningTeam == p.Team {
				playerStatMap[p.Name][p.General].Wins++
				playerFactionStatMap[p.Name][faction].Wins++
			} else {
				playerStatMap[p.Name][p.General].Losses++
				playerFactionStatMap[p.Name][faction].Losses++
			}

			if _, exists := overTime[p.Name]; !exists {
				overTime[p.Name] = make(map[pb.General][]*pb.PlayerRateOverTime)
			}
			date := m.Timestamp.AsTime()
			pbdate := timeToDate(date)
			ot := overTime[p.Name][p.General]

			var prev *pb.PlayerRateOverTime
			if len(ot) > 0 {
				prev = ot[len(ot)-1]
			} else {
				prev = &pb.PlayerRateOverTime{
					Wl: &pb.GeneralWL{
						General: p.General,
						WinLoss: &pb.WinLoss{},
					},
				}
			}

			if prev.Date != nil && prev.Date.Year == pbdate.Year && prev.Date.Month == pbdate.Month && prev.Date.Day == pbdate.Day {
				if m.WinningTeam == p.Team {
					prev.Wl.WinLoss.Wins++
				} else {
					prev.Wl.WinLoss.Losses++
				}
			} else {
				next := &pb.PlayerRateOverTime{
					Date: &pbdate,
					Wl: &pb.GeneralWL{
						General: p.General,
						WinLoss: &pb.WinLoss{
							Wins:   prev.Wl.WinLoss.Wins,
							Losses: prev.Wl.WinLoss.Losses,
						},
					},
				}
				if m.WinningTeam == p.Team {
					next.Wl.WinLoss.Wins++
				} else {
					next.Wl.WinLoss.Losses++
				}
				ot = append(ot, next)
			}
			overTime[p.Name][p.General] = ot
		}
	}

	for player, g_wl := range playerStatMap {
		var generalWL []*pb.GeneralWL
		var factionWL []*pb.PlayerStat_FactionWL

		for general, winloss := range g_wl {
			generalWL = append(generalWL, &pb.GeneralWL{
				General: general,
				WinLoss: winloss,
			})

			faction := getFaction(general)
			f_wl := playerFactionStatMap[player][faction]
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

		var overTimeList []*pb.PlayerRateOverTime
		for _, ot := range overTime[player] {
			overTimeList = append(overTimeList, ot...)
		}

		playerstat := pb.PlayerStat{
			PlayerName:   player,
			Stats:        generalWL,
			FactionStats: factionWL,
			OverTime:     overTimeList,
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

	generalStatMap := make(map[pb.General]map[string]*pb.WinLoss)
	overall := make(map[pb.General]*pb.WinLoss)

	for _, m := range matches.Matches {
		for _, p := range m.Players {
			if _, exists := generalStatMap[p.General]; !exists {
				generalStatMap[p.General] = make(map[string]*pb.WinLoss)
			}
			if _, exists := generalStatMap[p.General][p.Name]; !exists {
				generalStatMap[p.General][p.Name] = &pb.WinLoss{}
			}
			if _, exists := overall[p.General]; !exists {
				overall[p.General] = &pb.WinLoss{}
			}
			if m.WinningTeam == p.Team {
				generalStatMap[p.General][p.Name].Wins++
				overall[p.General].Wins++
			} else {
				generalStatMap[p.General][p.Name].Losses++
				overall[p.General].Losses++
			}
		}
	}

	for general, p_wl := range generalStatMap {
		var playerWL []*pb.GeneralStat_PlayerWL
		for player, winloss := range p_wl {
			playerWL = append(playerWL, &pb.GeneralStat_PlayerWL{
				PlayerName: player,
				WinLoss:    winloss,
			})
		}
		generalstat := pb.GeneralStat{
			General: general,
			Stats:   playerWL,
			Total:   overall[general],
		}
		generalstats.GeneralStats = append(generalstats.GeneralStats, &generalstat)
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
		pbdate := timeToDate(date)

		match, exists := lo.Find(teamstats.TeamStats, func(p *pb.TeamStat) bool {
			return p.Team == winner && p.Date.Year == pbdate.Year && p.Date.Month == pbdate.Month && p.Date.Day == pbdate.Day
		})

		if exists {
			match.Wins++
		} else {
			for _, t := range getTeams(m) {
				ts := &pb.TeamStat{
					Date: &pbdate,
					Team: t,
					Wins: 0,
				}
				if t == winner {
					ts.Wins = 1
				}
				teamstats.TeamStats = append(teamstats.TeamStats, ts)
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

type PlayerGeneral struct {
	gen    pb.General
	player string
}

type TeamStatFilter struct {
	Playedmap string
	Players   map[string]*pb.Faction
}


func TeamStatsFiltered(matches *pb.Matches, filters *TeamStatFilter) *pb.TeamStats {
	var teamstats pb.TeamStats

	filtered := lo.Filter(matches.Matches, func(match *pb.MatchInfo, _ int) bool {
		if filters.Playedmap != "" && filters.Playedmap != match.Map {
			return false
		}
		for filterPlayerName, filterGen := range filters.Players {
			for _, player := range match.Players {
				if player.Name == filterPlayerName && getFaction(player.General) != *filterGen {
					return false
				}
			}
		}
		return true
	})

	for _, m := range filtered {
		winner := m.GetWinningTeam()
		date := m.Timestamp.AsTime()
		pbdate := timeToDate(date)

		match, exists := lo.Find(teamstats.TeamStats, func(p *pb.TeamStat) bool {
			return p.Team == winner && p.Date.Year == pbdate.Year && p.Date.Month == pbdate.Month && p.Date.Day == pbdate.Day
		})

		if exists {
			match.Wins++
		} else {
			for _, t := range getTeams(m) {
				ts := &pb.TeamStat{
					Date: &pbdate,
					Team: t,
					Wins: 0,
				}
				if t == winner {
					ts.Wins = 1
				}
				teamstats.TeamStats = append(teamstats.TeamStats, ts)
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
	overTime := make(map[string]*pb.MapResults)
	teamMapMap := make(map[team_and_map]int)

	for _, m := range matches.Matches {
		tam := team_and_map{team: m.WinningTeam, played_map: m.Map}
		teamMapMap[tam]++
		if _, exists := overTime[m.Map]; !exists {
			overTime[m.Map] = &pb.MapResults{
				Results: make([]*pb.MapResult, 0, 1),
			}
		}
		date := timeToDate(m.Timestamp.AsTime())
		next := &pb.MapResult{
			Map:    m.Map,
			Date:   &date,
			Winner: m.WinningTeam,
		}
		overTime[m.Map].Results = append(overTime[m.Map].Results, next)
	}

	for t_and_m, wins := range teamMapMap {
		mapstats := &pb.MapStat{
			Map:  t_and_m.played_map,
			Team: t_and_m.team,
			Wins: int32(wins),
		}
		teamstats.MapStats = append(teamstats.MapStats, mapstats)
	}
	teamstats.OverTime = overTime

	return &teamstats
}

type genpair struct {
	gen1 pb.General
	gen2 pb.General
}

type factionpair struct {
	fac1 pb.Faction
	fac2 pb.Faction
}

type pairResult struct {
	team pb.Team
	pair genpair
	won  bool
}

type pairFactionResult struct {
	team pb.Team
	pair factionpair
	won  bool
}

func pairToFpair(p pairResult) pairFactionResult {
	return pairFactionResult{
		team: p.team,
		pair: factionpair{
			fac1: getFaction(p.pair.gen1),
			fac2: getFaction(p.pair.gen2),
		},
		won: p.won,
	}
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
	return []pairResult{
		{
			team: winning[0].Team,
			pair: genpair{
				gen1: winning[0].General,
				gen2: winning[1].General,
			},
			won: true,
		},
		{
			team: losing[0].Team,
			pair: genpair{
				gen1: losing[0].General,
				gen2: losing[1].General,
			},
			won: false,
		},
	}
}

func PairStats(matches *pb.Matches) *pb.TeamPairs {
	var pairstats pb.TeamPairs
	pairstats.TeamPairs = make(map[string]*pb.PairsWinLosses)
	pairstats.FactionPairs = make(map[string]*pb.PairFactionWinLosses)

	teamMap := make(map[pb.Team]map[genpair]*pb.WinLoss)
	factionMap := make(map[pb.Team]map[factionpair]*pb.WinLoss)

	for _, m := range matches.Matches {
		for _, p := range getPairs(m) {
			if _, exists := teamMap[p.team]; !exists {
				teamMap[p.team] = make(map[genpair]*pb.WinLoss)
			}
			if _, exists := teamMap[p.team][p.pair]; !exists {
				teamMap[p.team][p.pair] = &pb.WinLoss{}
			}
			wl := teamMap[p.team][p.pair]
			if p.won {
				wl.Wins++
			} else {
				wl.Losses++
			}

			fpair := pairToFpair(p)
			if _, exists := factionMap[fpair.team]; !exists {
				factionMap[fpair.team] = make(map[factionpair]*pb.WinLoss)
			}
			if _, exists := factionMap[fpair.team][fpair.pair]; !exists {
				factionMap[fpair.team][fpair.pair] = &pb.WinLoss{}
			}
			fwl := factionMap[fpair.team][fpair.pair]
			if fpair.won {
				fwl.Wins++
			} else {
				fwl.Losses++
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
		pairstats.TeamPairs[team.String()] = &pairwinlosses
	}

	for team, pairmap := range factionMap {
		pairwinlosses := pb.PairFactionWinLosses{}
		for pair, wl := range pairmap {
			pairwinlosses.Pairwl = append(pairwinlosses.Pairwl, &pb.PairFactionWinLoss{
				Faction1: pair.fac1,
				Faction2: pair.fac2,
				Winloss:  wl,
			})
		}
		pairstats.FactionPairs[team.String()] = &pairwinlosses
	}

	return &pairstats
}

func winRate(wl *pb.WinLoss) float64 {
	games := wl.Wins + wl.Losses
	if games == 0 {
		return 0
	}
	return float64(wl.Wins) / float64(games)
}

func Wrapped(matches *pb.Matches, player string) (*pb.Wrapped, error) {
	gamesPlayed := 0
	hoursPlayed := 0.0
	generalCount := make(map[pb.General]int32)
	generalRates := make(map[pb.General]*pb.WinLoss)
	allGeneralRates := make(map[pb.General]*pb.WinLoss)
	unitsBuilt := make(map[string]int32)
	unitsBuiltEach := make(map[string]map[string]int32)
	unitsSpent := make(map[string]float64)

	for _, m := range matches.Matches {
		gamesPlayed++
		hoursPlayed += m.DurationMinutes / 60

		for _, p := range m.Players {
			if p.Name == player {
				generalCount[p.General]++
				if _, exists := generalRates[p.General]; !exists {
					generalRates[p.General] = &pb.WinLoss{}
				}
				if m.WinningTeam == p.Team {
					generalRates[p.General].Wins++
				} else {
					generalRates[p.General].Losses++
				}
			}

			if _, exists := allGeneralRates[p.General]; !exists {
				allGeneralRates[p.General] = &pb.WinLoss{}
			}
			if m.WinningTeam == p.Team {
				allGeneralRates[p.General].Wins++
			} else {
				allGeneralRates[p.General].Losses++
			}
		}

		details, err := GetDetails(m.Id)
		if err != nil {
			return nil, err
		}

		for _, c := range details.Costs {
			if c.Player.Name == player {
				for _, u := range c.Units {
					name := unitNameFormat(u.Name)
					unitsBuilt[name] += int32(u.Count)
					unitsSpent[name] += float64(u.TotalSpent)
				}
			}
			for _, u := range c.Units {
				name := unitNameFormat(u.Name)
				if _, exists := unitsBuiltEach[name]; !exists {
					unitsBuiltEach[name] = make(map[string]int32)
				}
				unitsBuiltEach[name][c.Player.Name] += int32(u.Count)
			}
		}
	}

	generals := lo.Keys(generalCount)
	mostPlayed := lo.MaxBy(generals, func(item pb.General, max pb.General) bool {
		return generalCount[item] > generalCount[max]
	})

	units := lo.Keys(unitsBuilt)
	mostBuilt := lo.MaxBy(units, func(item string, max string) bool {
		return unitsBuilt[item] > unitsBuilt[max]
	})

	others := lo.Values(unitsBuiltEach[mostBuilt])
	othersWithoutMostBuilt := lo.Without(others, unitsBuilt[mostBuilt])

	bestGeneral := lo.MaxBy(generals, func(item pb.General, max pb.General) bool {
		return winRate(generalRates[item])-winRate(allGeneralRates[item]) > winRate(generalRates[max])-winRate(allGeneralRates[max])
	})

	return &pb.Wrapped{
		GamesPlayed:       int32(gamesPlayed),
		HoursPlayed:       hoursPlayed,
		MostPlayed:        mostPlayed,
		MostPlayedWinrate: winRate(generalRates[mostPlayed]),
		MostBuilt:         mostBuilt,
		MostBuiltCount:    unitsBuilt[mostBuilt],
		MostBuiltSpent:    unitsSpent[mostBuilt],
		MostBuiltMore:     unitsBuilt[mostBuilt] - lo.Max(othersWithoutMostBuilt),
		BestGeneral:       bestGeneral,
		BestWinrate:       winRate(generalRates[bestGeneral]),
		BestAverage:       winRate(allGeneralRates[bestGeneral]),
	}, nil
}

func unitNameFormat(name string) string {
	return name
}

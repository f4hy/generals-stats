package data

import (
	"log"
	"sort"
	"time"

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

func timeToDate(date time.Time) pb.Date {
	return pb.Date{Year: int32(date.Year()), Month: int32(date.Month()), Day: int32(date.Day())}
}

func PlayerStats(matches *pb.Matches) *pb.PlayerStats {
	var playerstats pb.PlayerStats

	player_stat_map := make(map[string]map[pb.General]*pb.WinLoss)
	player_faction_stat_map := make(map[string]map[pb.Faction]*pb.WinLoss)

	over_time := make(map[string]map[pb.General]([]*pb.PlayerRateOverTime))

	sort.Slice(matches.Matches, func(i, j int) bool {
		return matches.Matches[i].Timestamp.Seconds < matches.Matches[j].Timestamp.Seconds
	})

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

			_, ot_exists := over_time[p.Name]
			if !ot_exists {
				over_time[p.Name] = make(map[pb.General]([]*pb.PlayerRateOverTime))
			}
			p_ot := over_time[p.Name]
			ot := p_ot[p.General]
			date := m.Timestamp.AsTime()
			pbdate := timeToDate(date)
			prev := &pb.PlayerRateOverTime{
				Wl: &pb.GeneralWL{
					General: p.General,
					WinLoss: &pb.WinLoss{},
				},
			}
			if len(ot) > 0 {
				prev = ot[len(ot)-1]
			}
			if prev.Date != nil && prev.Date.Year == pbdate.Year && prev.Date.Month == pbdate.Month && prev.Date.Day == pbdate.Day {
				if m.WinningTeam == p.Team {
					prev.Wl.WinLoss.Wins += 1
				} else {
					prev.Wl.WinLoss.Losses += 1
				}

			} else {

				next := pb.PlayerRateOverTime{
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
					next.Wl.WinLoss.Wins += 1
				} else {
					next.Wl.WinLoss.Losses += 1
				}
				ot = append(ot, &next)
			}
			p_ot[p.General] = ot

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
		pot := over_time[player]
		over_time := []*pb.PlayerRateOverTime{}
		log.Printf("pot %v", pot)

		for _, ot := range pot {
			for _, x := range ot {
				over_time = append(over_time, x)
			}
		}
		playerstat := pb.PlayerStat{
			PlayerName:   player,
			Stats:        generalWL,
			FactionStats: factionWL,
			OverTime:     over_time,
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
	over_time := make(map[string]*pb.MapResults)
	team_map_map := make(map[team_and_map]int)

	for _, m := range matches.Matches {
		tam := team_and_map{team: m.WinningTeam, played_map: m.Map}
		team_map_map[tam] += 1
		_, prs := over_time[m.Map]
		if !prs {
			empt := make([]*pb.MapResult, 0, 1)
			over_time[m.Map] = &pb.MapResults{
				Results: empt,
			}
		}
		date := timeToDate(m.Timestamp.AsTime())
		next := &pb.MapResult{
			Map:    m.Map,
			Date:   &date,
			Winner: m.WinningTeam,
		}
		over_time[m.Map].Results = append(over_time[m.Map].Results, next)
	}
	for t_and_m, wins := range team_map_map {
		mapstats := &pb.MapStat{
			Map:  t_and_m.played_map,
			Team: t_and_m.team,
			Wins: int32(wins),
		}
		teamstats.MapStats = append(teamstats.MapStats, mapstats)
	}
	teamstats.OverTime = over_time
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
	pairstats.FactionPairs = make(map[string]*pb.PairFactionWinLosses)
	teamMap := make(map[pb.Team]map[genpair]*pb.WinLoss)
	factionMap := make(map[pb.Team]map[factionpair]*pb.WinLoss)

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
			// no same for faction pairs
			fmap, prs := factionMap[p.team]
			if !prs {
				factionMap[p.team] = make(map[factionpair]*pb.WinLoss)
			}
			fmap = factionMap[p.team]
			fpair := pairToFpair(p)
			wl, prs = fmap[fpair.pair]
			if !prs {
				fmap[fpair.pair] = &pb.WinLoss{}
			}
			wl = fmap[fpair.pair]
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
		teamstr := team.String()
		pairstats.TeamPairs[teamstr] = &pairwinlosses
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
		teamstr := team.String()
		pairstats.FactionPairs[teamstr] = &pairwinlosses
	}
	log.Print("pair stats")
	return &pairstats
}

func winRate(wl *pb.WinLoss) float64 {
	games := wl.Wins + wl.Losses
	if games == 0 {
		return 0.
	}
	return float64(wl.Wins) / float64(games)
}

func unitNameFormat(name string) string {
	return name
	// split := strings.Split(name, "_")
	// if len(split) == 1 {
	//      return name
	// }
	// return split[1]
}

func Wrapped(matches *pb.Matches, player string) (*pb.Wrapped, error) {

	games_played := 0
	hours_played := 0.0
	general_count := make(map[pb.General]int32)
	general_rates := make(map[pb.General]*pb.WinLoss)
	all_general_rates := make(map[pb.General]*pb.WinLoss)

	units_built := make(map[string]int32)
	units_built_each := make(map[string]map[string]int32)
	units_spent := make(map[string]float64)

	for _, m := range matches.Matches {

		games_played += 1
		hours_played += m.DurationMinutes / 60.
		for _, p := range m.Players {
			log.Print(p.Name)
			if p.Name == player {
				general_count[p.General] += 1
				_, ex := general_rates[p.General]
				if !ex {
					general_rates[p.General] = &pb.WinLoss{}
				}
				if m.WinningTeam == p.Team {
					general_rates[p.General].Wins += 1
				} else {
					general_rates[p.General].Losses += 1
				}
			}
			_, ex := all_general_rates[p.General]
			if !ex {
				all_general_rates[p.General] = &pb.WinLoss{}
			}
			if m.WinningTeam == p.Team {
				all_general_rates[p.General].Wins += 1
			} else {
				all_general_rates[p.General].Losses += 1
			}

		}
		details, err := GetDetails(m.Id)
		if err != nil {
			return &pb.Wrapped{}, err
		}
		for _, c := range details.Costs {
			if c.Player.Name == player {
				for _, u := range c.Units {
					name := unitNameFormat(u.Name)
					units_built[name] += int32(u.Count)
					units_spent[name] += float64(u.TotalSpent)
				}
			}
			for _, u := range c.Units {
				name := unitNameFormat(u.Name)
				_, prs := units_built_each[name]
				if !prs {
					units_built_each[name] = make(map[string]int32)
				}
				units_built_each[name][c.Player.Name] += int32(u.Count)
			}
		}
	}
	generals := lo.Keys(general_count)
	mostPlayed := lo.MaxBy(generals, func(item pb.General, max pb.General) bool {
		return general_count[item] > general_count[max]
	})

	units := lo.Keys(units_built)
	mostBuilt := lo.MaxBy(units, func(item string, max string) bool {
		return units_built[item] > units_built[max]
	})

	others := lo.Values(units_built_each[mostBuilt])
	others_wo := lo.Without(others, units_built[mostBuilt])

	bestGeneral := lo.MaxBy(generals, func(item pb.General, max pb.General) bool {
		return winRate(general_rates[item])-winRate(all_general_rates[item]) > winRate(general_rates[max])-winRate(all_general_rates[max])
	})
	return &pb.Wrapped{
		GamesPlayed:       int32(games_played),
		HoursPlayed:       hours_played,
		MostPlayed:        mostPlayed,
		MostPlayedWinrate: winRate(general_rates[mostPlayed]),
		MostBuilt:         mostBuilt,
		MostBuiltCount:    units_built[mostBuilt],
		MostBuiltSpent:    (units_spent[mostBuilt]),
		MostBuiltMore:     units_built[mostBuilt] - (lo.Max(others_wo)),
		BestGeneral:       bestGeneral,
		BestWinrate:       winRate(general_rates[bestGeneral]),
		BestAverage:       winRate(all_general_rates[bestGeneral]),
	}, nil
}

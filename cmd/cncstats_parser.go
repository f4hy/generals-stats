package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"time"

	"github.com/bill-rich/cncstats/pkg/zhreplay"
	"github.com/bill-rich/cncstats/pkg/zhreplay/body"
	"github.com/bill-rich/cncstats/pkg/zhreplay/object"
	data "github.com/f4hy/generals-stats/backend/data"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
)

func general_parse(generalstr string) pb.General {

	General_lookup := map[string]pb.General{
		"USA":             pb.General_USA,
		"USA Airforce":    pb.General_AIR,
		"USA Lazr":        pb.General_LASER,
		"USA Superweapon": pb.General_SUPER,
		"China":           pb.General_CHINA,
		"China Nuke":      pb.General_NUKE,
		"China Tank":      pb.General_TANK,
		"China Infantry":  pb.General_INFANTRY,
		"GLA":             pb.General_GLA,
		"GLA Toxin":       pb.General_TOXIN,
		"GLA Stealth":     pb.General_STEALTH,
		"GLA Demo":        pb.General_DEMO,
	}
	result, prs := General_lookup[generalstr]
	if !prs {
		log.Fatal("Did not find general", generalstr)
	}
	return result
}

func player_parse(playername string) string {
	if playername == "Modus" {
		return "Brendan"
	}
	if playername == "OneThree111" {
		return "Bill"
	}
	if playername == "jbb" {
		return "Jared"
	}
	if playername == "Ye_Ole_Seans" {
		return "Sean"
	}
	log.Fatal("unkown player" + playername)
	return ""
}

func getPlayer(psummary *object.PlayerSummary) *pb.Player {
	return &pb.Player{
		Name:    player_parse(psummary.Name),
		General: general_parse(psummary.Side),
		Team:    pb.Team(psummary.Team),
	}
}

func getBuildings(psummary *object.PlayerSummary) []*pb.Costs_BuiltObject {
	ret := []*pb.Costs_BuiltObject{}
	for bname, building := range psummary.BuildingsBuilt {
		built := pb.Costs_BuiltObject{
			Name:       bname,
			Count:      int32(building.Count),
			TotalSpent: int32(building.TotalSpent),
		}
		ret = append(ret, &built)

	}
	return ret
}

func getUnits(psummary *object.PlayerSummary) []*pb.Costs_BuiltObject {
	ret := []*pb.Costs_BuiltObject{}
	for uname, unit := range psummary.UnitsCreated {
		created_unit := pb.Costs_BuiltObject{
			Name:       uname,
			Count:      int32(unit.Count),
			TotalSpent: int32(unit.TotalSpent),
		}
		ret = append(ret, &created_unit)
	}
	return ret
}

func processBody(body []*body.BodyChunk, minutes float64) ([]*pb.APM, map[string]*pb.Upgrades) {
	counts := make(map[string]int64)
	upgrades := getUpgradeEvents(body)
	for _, b := range body {
		if !strings.Contains(b.OrderName, "Select") && !strings.Contains(b.OrderName, "Checksum") {
			counts[player_parse(b.PlayerName)] += 1
		}
	}
	apms := []*pb.APM{}
	for player_name, count := range counts {
		apm := &pb.APM{
			PlayerName:  player_name,
			ActionCount: count,
			Minutes:     minutes,
			Apm:         float64(count) / minutes,
		}
		apms = append(apms, apm)
	}

	return apms, upgrades
}

func getUpgradeEvents(body []*body.BodyChunk) map[string]*pb.Upgrades {
	log.Println("Parsing the body")
	upgrades := make(map[string]*pb.Upgrades)
	for _, b := range body {
		if strings.Contains(b.OrderName, "Upgrade") {
			log.Println("parsing %s", b)
			log.Println("player %s", b.PlayerName)
			log.Println("DETAILS %s", b.Details)
			log.Println("DETAILS %s", b.Details.GetName())
			_, prs := upgrades[b.PlayerName]
			if !prs {
				upgrades[b.PlayerName] = &pb.Upgrades{}
			}
			details := b.Details
			upgrade := pb.UpgradeEvent{
				PlayerName: b.PlayerName,
				Timecode:   int64(b.TimeCode),
			}
			if details != nil {
				upgrade.UpgradeName = details.GetName()
			} else {
				upgrade.UpgradeName = "wtf unknown"
			}
			upgrades[b.PlayerName].Upgrades = append(upgrades[b.PlayerName].Upgrades, &upgrade)
		}
	}
	log.Println("done parsing upgrades")
	return upgrades
}

func parse_file(filename string) (*pb.MatchInfo, *pb.MatchDetails, error) {
	data, err := ioutil.ReadFile(filename)
	replay := zhreplay.Replay{}
	err = json.Unmarshal(data, &replay)
	if err != nil {
		fmt.Println("error:", err)
		log.Fatal("Failed to unmarshal")
	}
	h := replay.Header
	date := time.Date(h.Year, time.Month(h.Month), h.Day, h.Hour, h.Minute, h.Second, h.Millisecond, time.UTC)
	timestamp := timestamppb.New(date)
	match_id := int64(timestamp.Seconds)
	details := pb.MatchDetails{
		MatchId: match_id,
	}
	// fmt.Println("data:", replay.Header.Metadata.MapFile)
	winner, found := lo.Find(replay.Summary, func(p *object.PlayerSummary) bool {
		return p.Win
	})
	if !found {
		log.Println("no winnner??")
		return &pb.MatchInfo{}, &details, errors.New("Could not determine winner")
	}
	match := pb.MatchInfo{
		Id:          match_id,
		Timestamp:   timestamp,
		Map:         replay.Header.Metadata.MapFile,
		WinningTeam: pb.Team(winner.Team),
	}
	for _, i := range replay.Summary {
		// fmt.Printf("Name: %s : %s: %t %d\n", i.Name, i.Side, i.Win, i.Team)
		player := getPlayer(i)
		match.Players = append(match.Players, player)
		cost := &pb.Costs{
			Player:    player,
			Buildings: getBuildings(i),
			Units:     getUnits(i),
		}
		details.Costs = append(details.Costs, cost)
	}
	start := time.Unix(int64(replay.Header.TimeStampBegin), 0)
	end := time.Unix(int64(replay.Header.TimeStampEnd), 0)
	minutes := end.Sub(start).Minutes()
	apm, upgrades := processBody(replay.Body, minutes)
	log.Printf("Parsed apm %s", apm)
	log.Printf("Parsed upgrades %s", apm)

	details.Apms = apm
	details.UpgradeEvents = upgrades
	return &match, &details, nil
}

func main() {

	files, err := ioutil.ReadDir("./jsons/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		fmt.Println(file.Name(), file.IsDir())
		if strings.Contains(file.Name(), ".json") && strings.Contains(file.Name(), "2v2") && strings.Contains(file.Name(), "jbb") {
			// fmt.Println("parsing!! ", file.Name())
			result, details, err := parse_file("./jsons/" + file.Name())
			if err != nil {
				fmt.Println("could not parse file", file.Name())
			} else {
				// fmt.Println("Match result:", result.Timestamp.AsTime())
				fmt.Println("details :", details)
				// data.SaveMatch(result)
				// data.SaveDetails(details)
				_ = result
				_ = data.SaveMatch
				// data.SaveCosts(costs)
			}

		}else{
			log.Print("Not a 2v2 of our squad")
		}
	}
}

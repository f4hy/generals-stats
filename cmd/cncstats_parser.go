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
	"github.com/bill-rich/cncstats/pkg/zhreplay/object"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
        data "github.com/f4hy/generals-stats/backend/data"
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
	if(playername == "Modus"){return "Brendan"}
	if(playername == "OneThree111"){return "Bill"}
	if(playername == "jbb"){return "Jared"}
	if(playername == "Ye_Ole_Seans"){return "Sean"}
	log.Fatal("unkown player" + playername)
	return ""
}

func parse_file(filename string) (*pb.MatchInfo, error) {
	data, err := ioutil.ReadFile(filename)
	replay := zhreplay.Replay{}
	err = json.Unmarshal(data, &replay)
	if err != nil {
		fmt.Println("error:", err)
	}
	h := replay.Header
	date := time.Date(h.Year, time.Month(h.Month), h.Day, h.Hour, h.Minute, h.Second, h.Millisecond, time.UTC)
	timestamp := timestamppb.New(date)
	fmt.Println("data:", replay.Header.Metadata.MapFile)
	winner, found := lo.Find(replay.Summary, func(p *object.PlayerSummary) bool {
		return p.Win
	})
	if !found {
		log.Println("no winnner??")
		return &pb.MatchInfo{}, errors.New("Could not determine winner")
	}
	match := pb.MatchInfo{
		Id:          int32(timestamp.Seconds),
		Timestamp:   timestamp,
		Map:         replay.Header.Metadata.MapFile,
		WinningTeam: pb.Team(winner.Team),
	}
	for _, i := range replay.Summary {
		// fmt.Printf("Name: %s : %s: %t %d\n", i.Name, i.Side, i.Win, i.Team)
		match.Players = append(match.Players, &pb.Player{
			Name:    player_parse(i.Name),
			General: general_parse(i.Side),
			Team:    pb.Team(i.Team),
		})
	}
	return &match, nil
}

func main() {

	files, err := ioutil.ReadDir("./jsons/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		fmt.Println(file.Name(), file.IsDir())
		if strings.Contains(file.Name(), ".json") && strings.Contains(file.Name(), "2v2") && strings.Contains(file.Name(), "jbb") {
			fmt.Println("parsing!! ", file.Name())
			result, err := parse_file("./jsons/" + file.Name())
			if err != nil {
				fmt.Println("could not parse file", file.Name())
			} else {
				fmt.Println("Match result:", result.Timestamp.AsTime())
				data.SaveMatch(result)
			}
			
		}
	}
}

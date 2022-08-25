package data

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/bill-rich/cncstats/pkg/zhreplay"
	"github.com/bill-rich/cncstats/pkg/zhreplay/body"
	"github.com/bill-rich/cncstats/pkg/zhreplay/object"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
	"google.golang.org/protobuf/proto"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
)

var (
	DebugLogger *log.Logger
)

func init() {
	logfile, err := os.OpenFile("logs.txt", os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	mw := io.MultiWriter(os.Stdout, logfile)
	log.SetOutput(mw)

	DebugLogger = log.New(os.Stderr, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func general_parse(generalstr string) (pb.General, error) {

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
		return result, errors.New("Did not find general " + generalstr)
	}
	return result, nil
}

func player_parse(playername string) (string, error) {
	if playername == "Modus" || playername == "Brendan" {
		return "Brendan", nil
	}
	if playername == "OneThree111" || playername == "Bill" {
		return "Bill", nil
	}
	if playername == "jbb" || playername == "Jared" {
		return "Jared", nil
	}
	if playername == "Ye_Ole_Seans" || playername == "Sean" {
		return "Sean", nil
	}
	log.Print("unkown player" + playername)
	return "", errors.New("Unknown Player " + playername)
}

func getPlayer(psummary *object.PlayerSummary) (*pb.Player, error) {
	general, err := general_parse(psummary.Side)
	if err != nil {
		return &pb.Player{}, err
	}
	playername, err := player_parse(psummary.Name)
	if err != nil {
		return &pb.Player{}, err
	}
	return &pb.Player{
		Name:    playername,
		General: general,
		Team:    pb.Team(psummary.Team),
	}, nil
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

func getUpgradesummary(psummary *object.PlayerSummary) []*pb.Costs_BuiltObject {
	ret := []*pb.Costs_BuiltObject{}
	for uname, unit := range psummary.UpgradesBuilt {
		created_unit := pb.Costs_BuiltObject{
			Name:       uname,
			Count:      int32(unit.Count),
			TotalSpent: int32(unit.TotalSpent),
		}
		ret = append(ret, &created_unit)
	}
	return ret
}

func processBody(body []*body.BodyChunkEasyUnmarshall, minutes float64, timesteps int64) ([]*pb.APM, map[string]*pb.Upgrades, int64, error) {
	counts := make(map[string]int64)
	apms := []*pb.APM{}
	minutePerTimestemp := minutes / float64(timesteps)
	upgrades := getUpgradeEvents(body, minutePerTimestemp)
	var id int64
	for _, b := range body {
		if id == 0 && strings.Contains(b.OrderName, "Checksum") {
			checksum, ok := b.Arguments[0].(float64)
			if ok {
				id = int64(checksum)
			} else {
				log.Println("checksum was not a float", b.Arguments[0])
				return apms, upgrades, id, errors.New("checksum was not a float")
			}
		}

		if !strings.Contains(b.OrderName, "Select") && !strings.Contains(b.OrderName, "Checksum") {
			playername, _ := player_parse(b.PlayerName)
			counts[playername] += 1
		}
	}
	for player_name, count := range counts {
		apm := &pb.APM{
			PlayerName:  player_name,
			ActionCount: count,
			Minutes:     minutes,
			Apm:         float64(count) / minutes,
		}
		apms = append(apms, apm)
	}

	return apms, upgrades, id, nil
}

func getUpgradeEvents(body []*body.BodyChunkEasyUnmarshall, minPerTimestep float64) map[string]*pb.Upgrades {
	// log.Println("Parsing the body")
	upgrades := make(map[string]*pb.Upgrades)
	for _, b := range body {
		playername, _ := player_parse(b.PlayerName)
		if strings.Contains(b.OrderName, "Upgrade") {
			player := playername
			_, prs := upgrades[player]
			if !prs {
				upgrades[player] = &pb.Upgrades{}
			}
			details := b.Details
			upgrade := pb.UpgradeEvent{
				PlayerName:  playername,
				Timecode:    int64(b.TimeCode),
				UpgradeName: details.Name,
				Cost:        int64(details.Cost),
				AtMinute:    float64(b.TimeCode) * minPerTimestep,
			}
			upgrades[player].Upgrades = append(upgrades[player].Upgrades, &upgrade)
		}
	}
	// log.Println("done parsing upgrades")
	return upgrades
}

type match_and_details struct {
	info   *pb.MatchInfo
	detail *pb.MatchDetails
}

func parse_data(filename string, data []byte) (match_and_details, error) {
	replay := zhreplay.ReplayEasyUnmarshall{}
	err := json.Unmarshal(data, &replay)
	if err != nil {
		fmt.Println("Failed to unmarshal:", err)
		return match_and_details{}, err
	}
	replay.Header.FileName = filename
	h := replay.Header
	loc, _ := time.LoadLocation("Pacific/Honolulu")
	date := time.Date(h.Year, time.Month(h.Month), h.Day, h.Hour, h.Minute, h.Second, h.Millisecond, loc)
	timestamp := timestamppb.New(date)
	start := time.Unix(int64(replay.Header.TimeStampBegin), 0)
	end := time.Unix(int64(replay.Header.TimeStampEnd), 0)

	minutes := end.Sub(start).Minutes()
	// fmt.Println("data:", replay.Header.Metadata.MapFile)
	numTimeStamps := int64(replay.Header.NumTimeStamps)
	apm, upgrades, id, err := processBody(replay.Body, minutes, numTimeStamps)
	// match_id := int64(timestamp.Seconds)
	// log.Print("Old id was", match_id, "new id", id)
	details := pb.MatchDetails{
		MatchId: id,
	}
	match := pb.MatchInfo{
		Id:        id,
		Timestamp: timestamp,
		Map:       replay.Header.Metadata.MapFile,
		Filename:  filename,
	}
	winner, found := lo.Find(replay.Summary, func(p *object.PlayerSummary) bool {
		return p.Win
	})
	if !found {
		match.Incomplete = "No winner detected in replay"
		log.Println("no winnner?? time", minutes)
	} else {
		match.WinningTeam = pb.Team(winner.Team)
	}

	for _, i := range replay.Summary {
		// fmt.Printf("Name: %s : %s: %t %d\n", i.Name, i.Side, i.Win, i.Team)
		player, err := getPlayer(i)
		if err != nil {
			return match_and_details{&pb.MatchInfo{}, &details}, errors.New("Could not determine winner")
		}
		match.Players = append(match.Players, player)
		cost := &pb.Costs{
			Player:    player,
			Buildings: getBuildings(i),
			Units:     getUnits(i),
			Upgrades:  getUpgradesummary(i),
		}
		details.Costs = append(details.Costs, cost)
	}
	details.MatchId = id
	// log.Printf("Parsed apm %s", apm)
	// log.Printf("Parsed upgrades %s", upgrades)

	details.Apms = apm
	details.UpgradeEvents = upgrades
	match.DurationMinutes = minutes
	addMatchNotes(&match)
	return match_and_details{&match, &details}, nil
}

func saveAll(m *match_and_details) error {
	result := m.info
	details := m.detail
	// fmt.Println("Match result:", result.Timestamp.AsTime())
	// fmt.Println("details :", details)
	result_bytes, err := proto.Marshal(result)
	if err != nil {
		panic(err)
	}
	resultpath := fmt.Sprintf("parsed-matches/%d.proto", result.Id)
	err = os.WriteFile(resultpath, result_bytes, 0644)
	if err != nil {
		panic(err)
	}
	details_bytes, err := proto.Marshal(details)
	if err != nil {
		panic(err)
	}
	detailpath := fmt.Sprintf("match-details/%d.proto", result.Id)
	err = os.WriteFile(detailpath, details_bytes, 0644)
	SaveMatch(result)
	// data.SaveDetails(details)
	SaveDetails(details)
	// _ = result
	// _ = data.SaveMatch
	// data.SaveCosts(costs)
	return nil
}

func addMatchNotes(match *pb.MatchInfo) {
	notes := map[int64]string{
		2624432546: "EMP <3 Chinook",
		1569540457: "LOL top vs bot",
		2635701063: "LOL top vs bot",
	}
	note, prs := notes[match.Id]
	if prs {
		match.Notes = match.Notes + note
	}
}

func knownAborted(matchId int64) string {
	aborted := map[int64]string{
		1650483008: "I dont remember",
		593943529:  "Baby Early",
		722564743:  "Baby Early",
		1649130810: "Baby Early",
		1897002896: "Baby Early",
		629393234:  "Baby Midgame",
		2541574142: "Missmatch epic quad game",
		1140820264: "Missmatch :(",
		4174957573: "Disconnect :( :(",
		1015461230: "Disconnect :( :(",
		2421832733: "Missmatch :(",
		4233126343: "Missmatch :(",
	}
	reason := aborted[matchId]
	return reason
}

func winnerOverride(matchId int64) (pb.Team, bool) {
	overrides := map[int64]pb.Team{
		3125981705: pb.Team_THREE,
		3952919954: pb.Team_ONE,
		1178219525: pb.Team_THREE,
		2873364142: pb.Team_ONE,
		1748101175: pb.Team_THREE,
		1293260443: pb.Team_ONE,
		463237658:  pb.Team_ONE,
	}
	team, prs := overrides[matchId]
	return team, prs
}

func ParseJsons() {

	jsons, err := ListJsons()
	if err != nil {
		log.Fatal("Could not fetch jsons")
	}
	json_data_map := make(map[string][]byte)
	for _, json_path := range jsons {
		_, s := filepath.Split(json_path)
		bytes, err := GetJson(s)
		if err != nil {
			log.Println("Could not get json", json_path)
			continue
		}

		json_data_map[s] = bytes

	}

	allParsed := make(map[int64]*match_and_details)
	failed := []string{}
	for file, json_data := range json_data_map {
		if strings.Contains(file, ".json") && strings.Contains(file, "2v2") && strings.Contains(file, "jbb") {
			// log.Println("parsing: ", file)
			if err != nil {
				log.Println("Could not get", file)
			}
			parsed, err := parse_data(file, json_data)
			if err != nil {
				log.Println("Could not parse", file)
				failed = append(failed, file)
			}
			result := parsed.info
			abortReason := knownAborted(result.Id)
			if abortReason != "" {
				log.Print("Aborted Match.")
				parsed.info.Incomplete = abortReason
			}
			team, needOverride := winnerOverride(result.Id)
			if needOverride {
				result.WinningTeam = team
				result.Notes = "Overriding auto detected team with team " + team.String()
				if result.Incomplete != "" {
					result.Notes += " autodetect error: " + result.Incomplete
				}
				result.Incomplete = ""
			}
			if err != nil {
				fmt.Println("could not parse file", file)
			} else {
				// saveMatch(parsed)
				id := result.Id
				if val, ok := allParsed[id]; ok {
					log.Print("filename\n", parsed.info.Filename, "\nexisting\n", val.info.Filename)
					if strings.Contains(file, "day_Modus_") {
						allParsed[id] = &parsed
					}
				} else {
					allParsed[id] = &parsed
				}
			}

		} else {
			log.Print("Not a 2v2 of our squad")
		}
	}
	for _, data := range allParsed {
		// log.Print("Saving matchid", id)
		saveAll(data)
	}
}

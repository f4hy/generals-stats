package data

import (
	"encoding/json"
	"errors"
	"fmt"
	log "github.com/golang/glog"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/bill-rich/cncstats/pkg/zhreplay"
	"github.com/bill-rich/cncstats/pkg/zhreplay/body"
	"github.com/bill-rich/cncstats/pkg/zhreplay/object"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/samber/lo"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
)

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
	log.Warningf("unkown player: %v", playername)
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
	ret := make([]*pb.Costs_BuiltObject, 0, len(psummary.BuildingsBuilt))
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
	ret := make([]*pb.Costs_BuiltObject, 0, len(psummary.UnitsCreated))
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
	ret := make([]*pb.Costs_BuiltObject, 0, len(psummary.UpgradesBuilt))
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


var apmPool = sync.Pool{
	New: func() interface{} {
		return new(pb.APM)
	},
}

func processBody(body []*body.BodyChunkEasyUnmarshall, minutes float64, timesteps int64) ([]*pb.APM, map[string]*pb.Upgrades, int64, error) {
	counts := make(map[string]int64)
	apms := make([]*pb.APM, 0, len(body)) // Pre-allocate with the expected size
	minutePerTimestemp := minutes / float64(timesteps)
	upgrades := getUpgradeEvents(body, minutePerTimestemp)
	var id int64
	for _, b := range body {
		if id == 0 && strings.Contains(b.OrderName, "Checksum") {
			checksum, ok := b.Arguments[0].(float64)
			if ok {
				id = int64(checksum)
			} else {
				log.Infof("checksum was not a float: %v", b.Arguments[0])
				return apms, upgrades, id, errors.New("checksum was not a float")
			}
		}

		if !strings.Contains(b.OrderName, "Select") && !strings.Contains(b.OrderName, "Checksum") {
			playername, _ := player_parse(b.PlayerName)
			counts[playername] += 1
		}
	}
	for player_name, count := range counts {
		apm := apmPool.Get().(*pb.APM)
		apm.PlayerName = player_name
		apm.ActionCount = count
		apm.Minutes = minutes
		apm.Apm = float64(count) / minutes
		apms = append(apms, apm)
	}

	return apms, upgrades, id, nil
}


func getUpgradeEvents(body []*body.BodyChunkEasyUnmarshall, minPerTimestep float64) map[string]*pb.Upgrades {
	upgrades := make(map[string]*pb.Upgrades)
	for _, b := range body {
		if strings.Contains(b.OrderName, "Upgrade") {
			playername, _ := player_parse(b.PlayerName)
			player := playername
			if _, prs := upgrades[player]; !prs {
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
	return upgrades
}

func getSpent(body []*body.BodyChunkEasyUnmarshall, minutes float64, timesteps int64) *pb.SpentOverTime {
	minPerTimestep := minutes / float64(timesteps)
	spent := pb.SpentOverTime{}
	running_buildings := make(map[string]int64)
	running_units := make(map[string]int64)
	running_upgrades := make(map[string]int64)
	running_total := make(map[string]int64)
	for _, b := range body {
		playername, _ := player_parse(b.PlayerName)
		running_total[playername] += int64(b.Details.Cost)
		tot := pb.Spent{
			PlayerName: playername,
			AccCost:    running_total[playername],
			AtMinute:   float64(b.TimeCode) * minPerTimestep,
		}
		spent.Total = append(spent.Total, &tot)
		if b.OrderName == "BuildUpgrade" {
			running_upgrades[playername] += int64(b.Details.Cost)
			up := pb.Spent{
				PlayerName: playername,
				AccCost:    running_upgrades[playername],
				AtMinute:   float64(b.TimeCode) * minPerTimestep,
			}
			spent.Upgrades = append(spent.Upgrades, &up)

		}
		if b.OrderName == "CreateUnit" {
			running_units[playername] += int64(b.Details.Cost)
			unit := pb.Spent{
				PlayerName: playername,
				AccCost:    running_units[playername],
				AtMinute:   float64(b.TimeCode) * minPerTimestep,
			}
			spent.Units = append(spent.Units, &unit)

		}
		if b.OrderName == "BuildObject" {
			running_buildings[playername] += int64(b.Details.Cost)
			building := pb.Spent{
				PlayerName: playername,
				AccCost:    running_buildings[playername],
				AtMinute:   float64(b.TimeCode) * minPerTimestep,
			}
			spent.Buildings = append(spent.Buildings, &building)
		}
	}
	return &spent
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
	if err != nil {
		fmt.Println("Failed to parse the body")
		return match_and_details{}, err
	}
	spent := getSpent(replay.Body, minutes, numTimeStamps)
	// match_id := int64(timestamp.Seconds)
	// log.Print("Old id was", match_id, "new id", id)
	details := pb.MatchDetails{
		MatchId: id,
		Spent:   spent,
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
		log.Warningf("no winnner?? time: %v", minutes)
	} else {
		match.WinningTeam = pb.Team(winner.Team)
	}

	for _, i := range replay.Summary {
		player, err := getPlayer(i)
		if err != nil {
			return match_and_details{&pb.MatchInfo{}, &details}, errors.New("could not determine winner")
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
	err := SaveMatch(result)
	if err != nil {
		return err
	}
	err = SaveDetails(details)
	return err
}

func save(id int64, matchdata match_and_details, group *sync.WaitGroup) {
	if id != matchdata.info.Id {
		log.Fatalf("%v info ids don't match %v != %v", matchdata.info.Filename, id, matchdata.info.Id)
	}
	if id != matchdata.detail.MatchId {
		log.Fatalf("%v detail ids don't match %v != %v", matchdata.info.Filename, id, matchdata.detail.MatchId)
	}
	log.V(1).Infof("Saving matchid %v", id)
	err := saveAll(&matchdata)
	if err != nil {
		log.Fatalf("Failed to save match[%v] %v", id, err)
	}
	defer group.Done()
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
		2541574142: "Mismatch epic quad game",
		1140820264: "Mismatch :(",
		4174957573: "Disconnect :( :(",
		1015461230: "Disconnect :( :(",
		2421832733: "Mismatch :(",
		4233126343: "Mismatch :(",
		3060818251: "Mismatch :( :(",
		518392768:  "Mismatch :( ",
		1349671078: "Mismatch at start ",
		3754206351: "Mismatch :( ",
		2606388828: "Disconnect",
		2733966289: "Mismatch at end :(",
		2627127515: "Mismatch!!",
		2376772908: "Mismatch",
		4289543903: "Mismatch",
		4088397075: "Mismatch",
		2418485416: "Mismatch",
		1078744849: "Mismatch",
		4127002559: "Mismatch",
		3505487053: "Mismatch",
		137408485:  "Mismatch",
		3213999161: "Mismatch",
		3546411607: "Mismatch",
		919932587:  "Brendan forced to step away :(",
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
		3350140132: pb.Team_THREE,
		886039148:  pb.Team_THREE,
		448677800:  pb.Team_THREE,
		2066175009: pb.Team_ONE,
		3934241601: pb.Team_ONE,
		2500955583: pb.Team_THREE,
		3378141023: pb.Team_THREE,
		3707381344: pb.Team_THREE,
		2890008785: pb.Team_ONE,
		3599396223: pb.Team_THREE,
		2501110320: pb.Team_ONE,
		3536570607: pb.Team_THREE,
		2239209531: pb.Team_ONE,
		929574895:  pb.Team_ONE,
		2335927854: pb.Team_THREE,
		4000802867: pb.Team_THREE,
		354171420:  pb.Team_ONE,
		4018143823: pb.Team_ONE,
		2814791583: pb.Team_ONE,
		2588838602: pb.Team_ONE,
		190779906: pb.Team_THREE,
		4166728131: pb.Team_ONE,
	}
	team, prs := overrides[matchId]
	return team, prs
}

func ParseJson(json_path string) (match_and_details, error) {
	_, file := filepath.Split(json_path)
	json_data, err := GetJson(file)
	if err != nil {
		log.Warning("Could not get json", json_path)
		return match_and_details{}, err
	}
	if strings.Contains(file, ".json") && strings.Contains(file, "2v2") && strings.Contains(file, "jbb") {
		// log.Println("parsing: ", file)
		if err != nil {
			log.Warning("Could not get", file)
		}
		parsed, err := parse_data(file, json_data)
		if err != nil {
			log.Warning("Could not parse", file)
			return parsed, err
		}
		parsed.info.Filename = file
		result := parsed.info
		abortReason := knownAborted(result.Id)
		if abortReason != "" {
			log.Warning("Aborted Match.")
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
			return parsed, err
		} else {
			return parsed, nil
		}

	}
	log.Info("Not a 2v2 of our squad")
	return match_and_details{}, errors.New("not a 2v2 of our squad")
}

func parseWorker(id int, jsons <-chan string, results chan<- match_and_details, failure chan<- string, group *sync.WaitGroup) {
	log.V(1).Infof("Starting worker %v", id)
	for json := range jsons {
		log.V(1).Infof("worker %v parsing %v", id, json)
		parsed, err := ParseJson(json)
		if err != nil {
			log.V(1).Infof("worker %v error on  %v", id, json)
			failure <- fmt.Sprintf("%v error: %v", json, err.Error())
		} else {
			results <- parsed
		}
	}
	log.Infof("worker %v done", id)
	group.Done()
}

func ParseJsons(all bool) {

	jsons, err := ListJsons()
	if err != nil {
		log.Fatal("Could not fetch jsons")
	}
	this_month := time.Now().Month().String()
	last_week_month := time.Now().AddDate(0, 0, -7).Month().String()

	if !all {
		jsons = lo.Filter(jsons, func(j string, i int) bool {
			log.Info(j, this_month, last_week_month)
			return strings.Contains(j, this_month) || strings.Contains(j, last_week_month)
		})
	}

	numJobs := len(jsons)
	log.Infof("Have %v jsons", len(jsons))
	var jobGroup sync.WaitGroup
	jobs := make(chan string, numJobs)
	results := make(chan match_and_details, numJobs)
	failures := make(chan string, numJobs)

	for w := 1; w <= 2; w++ {
		jobGroup.Add(1)
		go parseWorker(w, jobs, results, failures, &jobGroup)
	}
	for _, json_path := range jsons {
		jobs <- json_path
	}
	close(jobs)
	log.Info("waiting til done")
	jobGroup.Wait()
	close(results)
	close(failures)
	log.Info("done! processing results")

	failed := []string{}
	for fail := range failures {
		failed = append(failed, fail)
	}
	allParsed := make(map[int64]match_and_details)
	for result := range results {
		id := result.info.Id
		file := result.info.Filename
		if val, ok := allParsed[id]; ok {
			log.V(1).Infof("filename %v %v", result.info.Id, result.info.Filename)
			log.V(1).Infof("existing %v %v", val.info.Id, val.info.Filename)
			if strings.Contains(file, "day_Modus_") {
				allParsed[id] = result
			}
		} else {
			allParsed[id] = result
		}
	}

	start_save := time.Now()
	var saveGroup sync.WaitGroup

	for parsed_id, data_to_save := range allParsed {
		saveGroup.Add(1)
		go save(parsed_id, data_to_save, &saveGroup)
	}
	saveGroup.Wait()
	log.V(1).Infof("Saving matches took %v", time.Since(start_save))

	for _, fail := range failed {
		log.Warningf("Failure %v", fail)
	}
	log.Info("Finish parse")
}

package data

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	s3 "github.com/f4hy/generals-stats/backend/s3"
	log "github.com/golang/glog"
	"github.com/samber/lo"
)

var (
	replayPath string = "replays"
	jsonPath   string = "jsons"
)

func init() {
	isdev := os.Getenv("DEV")
	if isdev != "" {
		replayPath = "dev/replays"
		jsonPath = "dev/jsons"
	}
}

func ListReplays() ([]string, error) {
	log.Info("getting replays")
	results, err := s3.List(replayPath)
	sort.Slice(results, func(i, j int) bool {
		return results[i] < results[j]
	})
	log.Info("replays")
	return results, err
}

func GetReplay(replayname string) ([]byte, error) {
	log.Info("getting replay: ", replayname)
	return s3.GetS3Data(replayPath + "/" + replayname)
}

func ListJsons() ([]string, error) {
	log.Info("getting jsons")
	results, err := s3.List(jsonPath)
	sort.Slice(results, func(i, j int) bool {
		return results[i] < results[j]
	})
	log.Info("jsons")
	return results, err
}

func GetJson(jsonname string) ([]byte, error) {
	log.Info("getting json: ", jsonname)
	return s3.GetS3Data(jsonPath + "/" + jsonname)
}

func jsonExistsForReplay(replay_name string, existing_jsons []string) (bool, string) {
	json_name := strings.Replace(replay_name, ".rep", ".json", -1)
	fmt.Println(replay_name, json_name)
	_, j_exists := lo.Find(existing_jsons, func(replayname string) bool {
		_, s := filepath.Split(replayname)
		return s == json_name
	})
	log.Infof("Json already in the list? %v", j_exists)
	return j_exists, json_name
}

func parseAndSaveReplay(replay_name string, replay_data []byte, existing_jsons []string) error {
	j_exists, json_name := jsonExistsForReplay(replay_name, existing_jsons)
	if !j_exists {
		parsed, err := parseRepaly(replay_name, replay_data)
		if err != nil {
			return err
		}
		s3.AddDataToS3(jsonPath+"/"+json_name, []byte(parsed))

	}
	return nil
}

func SaveReplays(include_last_month bool) (savecount int, fail error) {
	scraped_replays := scrape(include_last_month)
	replays, err := ListReplays()
	if err != nil {
		return 0, err
	}
	jsons, err := ListJsons()
	if err != nil {
		return 0, err
	}
	save_count := 0
	for scraped_name, scraped_data := range scraped_replays {
		log.Infof("Found %s %d", scraped_name, len(scraped_data))
		_, exists := lo.Find(replays, func(replayname string) bool {
			_, s := filepath.Split(replayname)
			return s == scraped_name
		})
		log.Infof("Already in the list? %v", exists)
		if !exists {
			s3.AddDataToS3(replayPath+"/"+scraped_name, scraped_data)
			save_count += 1
		}
		// parse it to json
		if err = parseAndSaveReplay(scraped_name, scraped_data, jsons); err != nil {
			save_count += 1
		}
	}
	replays, err = ListReplays()
	if err != nil {
		return 0, err
	}
	jsons, err = ListJsons()
	if err != nil {
		return 0, err
	}
	for _, replay_path := range replays {
		_, replay_name := filepath.Split(replay_path)
		if strings.Contains(replay_name, "OneThree") && strings.Contains(replay_name, "Modus") && strings.Contains(replay_name, "jbb") {
			exists, _ := jsonExistsForReplay(replay_name, jsons)
			if !exists {
				log.Infof("Parsing existing replay!")
				replay_data, err := GetReplay(replay_name)
				if err != nil {
					return 0, err
				}
				parseAndSaveReplay(replay_name, replay_data, jsons)
			}
		}
	}
	return save_count, nil
}

func parseRepaly(filename string, replayData []byte) (string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", err
	}
	part.Write(replayData)
	writer.Close()
	req, err := http.NewRequest("POST", "https://cncstats.herokuapp.com/replay", body)
	if err != nil {
		return "", err
	}
	req.Header.Add("Content-Type", writer.FormDataContentType())
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	// fmt.Println("resp", string (bodyBytes))
	return string(bodyBytes), nil

}

func ParseRepalys(replay_data map[string][]byte) error {
	for scraped_name, scraped_data := range replay_data {
		json, err := parseRepaly(scraped_name, scraped_data)
		if err != nil {
			return err
		}
		json_name := strings.Replace(scraped_name, "replay", "json", -1)
		json_name = strings.Replace(json_name, ".rep", ".json", -1)
		_ = json
		fmt.Println(scraped_name, json_name)
		// s3.AddDataToS3(json_name, []byte(json))
	}
	return nil
}

package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	data "github.com/f4hy/generals-stats/backend/data"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"
)

var last_fetched time.Time
var last_scraped time.Time
var matches *pb.Matches

func init() {
	matches = &pb.Matches{}
	flag.Usage = func() { flag.PrintDefaults() }
	flag.Set("minloglevel", "3")
	flag.Set("logtostderr", "true")
	isdev := os.Getenv("DEV") != ""
	if isdev {
		flag.Set("stderrthreshold", "INFO")
		flag.Set("v", "1")
	} else {
		flag.Set("stderrthreshold", "WARNING")
		flag.Set("v", "0")
	}

	flag.Parse()
	last_fetched = time.Date(2000, time.November, 10, 23, 0, 0, 0, time.UTC)
	updateMatches()
	last_scraped = time.Now()
}

func getEnv(key, fallback string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		value = fallback
	}
	return value
}

func completedMatches(all *pb.Matches) *pb.Matches {
	completed := pb.Matches{}
	for _, m := range all.Matches {
		if m.Incomplete == "" {
			completed.Matches = append(completed.Matches, m)
		}
	}
	return &completed
}

func scrape_and_prase() {
	since := time.Now()
	for _, m := range matches.Matches {
		ts := m.Timestamp.AsTime()
		if ts.Before(since) {
			since = ts
		}
	}

	data.SaveReplays(since)
	log.Info("Scraped")
	data.ParseJsons(false)
	log.Info("ReParsed")
	last_scraped = time.Now()
	fetched, err := data.GetMatches()
	if err != nil {
		log.Error("Failed to get matches, keeping cache: ", err.Error())
	} else {
		matches = fetched
	}

}

func updateMatches() *pb.Matches {
	since_scraped := time.Since(last_scraped).Minutes()
	log.Infof("since last scraped %v", since_scraped)
	if since_scraped > 30 {
		last_scraped = time.Now()
		go scrape_and_prase()
	}
	since_fetched := time.Since(last_fetched).Minutes()
	log.Infof("since last fetched %v", since_fetched)
	if since_fetched < 5 {
		return matches
	}
	fetched, err := data.GetMatches()
	if err != nil {
		log.Error("Failed to get matches, keeping cache: ", err.Error())
		return matches
	}
	log.Info("Updating match data")
	last_fetched = time.Now()
	matches = fetched
	return matches
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	router.Use(cors.Default())

	var port = getEnv("PORT", "5000")
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.Use(static.Serve("/", static.LocalFile("build", true)))
	matches := updateMatches()
	completed := completedMatches(matches)
	ticker := time.NewTicker(time.Minute * 15)
	go func() {
		for tick := range ticker.C {
			log.Infof("scraping from timer %v", tick)
			scrape_and_prase()
		}
	}()
	maxAge := "max-age=500"
	api := router.Group("/api")
	{
		api.GET("/matches/:count", func(c *gin.Context) {
			count_str := c.Param("count")
			count, err := strconv.Atoi(count_str)
			if err != nil {
				log.Error(err)
				count = 5000
			}
			c.Header("Cache-Control", maxAge)
			matches = updateMatches()
			completed = completedMatches(matches)
			upper := min(len(matches.Matches), count)
			log.Infof("Upper %v", upper)
			limited := matches.Matches[:upper]
			requested := &pb.Matches{Matches: limited}
			c.ProtoBuf(http.StatusOK, requested)
		})
		api.GET("/playerstats", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			player_stats := data.PlayerStats(completed)
			c.ProtoBuf(http.StatusOK, player_stats)
		})
		api.GET("/generalstats", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			general := data.GeneralStats(completed)
			c.ProtoBuf(http.StatusOK, general)
		})
		api.GET("/listmaps", func(c *gin.Context) {
			// c.Header("Cache-Control", maxAge)
			maps, err := data.ListMaps()
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			c.JSON(http.StatusOK, maps)
		})
		api.GET("/listreplays", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			log.Infof("listing replays")
			replays, err := data.ListReplays()
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			log.Infof("Found replays %d", len(replays))
			c.JSON(http.StatusOK, replays)
		})
		api.GET("/scrape/:days", func(c *gin.Context) {
			// c.Header("Cache-Control", maxAge)
			days_str := c.Param("days")
			days, err := strconv.Atoi(days_str)
			if err != nil {
				log.Error(err)
				days = 2
			}
			saved, err := data.SaveReplays(time.Now().AddDate(0, 0, -days))
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			log.Infof("Done Scraping")
			c.JSON(http.StatusOK, saved)
		})
		api.GET("/reparse", func(c *gin.Context) {
			// c.Header("Cache-Control", maxAge)
			replays, err := data.ListJsons()
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			data.ParseJsons(true)
			log.Infof("Done parsing")
			c.JSON(http.StatusOK, replays)
		})
		api.GET("/map/:mapname", func(c *gin.Context) {
			mapurl, err := data.GetMap(c.Param("mapname"))
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			c.String(http.StatusOK, mapurl)
		})
		api.GET("/teamstats", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			ts := data.TeamStats(completed)
			c.ProtoBuf(http.StatusOK, ts)
		})
		api.GET("/mapstats", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			ts := data.MapStats(completed)
			c.ProtoBuf(http.StatusOK, ts)
		})
		api.GET("/pairstats", func(c *gin.Context) {
			// c.Header("Cache-Control", maxAge)
			ts := data.PairStats(completed)
			c.ProtoBuf(http.StatusOK, ts)
		})
		api.GET("/details/:matchid", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			matchidstr := c.Param("matchid")
			matchid, err := strconv.ParseInt(matchidstr, 10, 0)
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			ts, err := data.GetDetails(matchid)
			c.ProtoBuf(http.StatusOK, ts)
		})
		api.POST("/saveMatch", func(c *gin.Context) {
			match := &pb.MatchInfo{}
			c.Bind(match)
			err := data.SaveMatch(match)
			if err != nil {
				log.Error(err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			c.String(http.StatusOK, "Saved Match")
		})
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})
	}
	fmt.Printf("Running in port %s", port)
	// Start and run the server
	router.Run(fmt.Sprintf(":%s", port))
}

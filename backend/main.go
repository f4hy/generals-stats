package main

import (
	"flag"
	"fmt"
	data "github.com/f4hy/generals-stats/backend/data"
	pb "github.com/f4hy/generals-stats/backend/proto"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"
	"net/http"
	"os"
	"strconv"
	"time"
)

func init() {
	flag.Usage = func() { flag.PrintDefaults() }
	flag.Set("minloglevel", "3")
	flag.Set("logtostderr", "true")
	flag.Set("stderrthreshold", "WARNING")
	flag.Set("v", "0")
	flag.Parse()
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

func scrape_and_prase(){
	data.SaveReplays(false)
	data.ParseJsons()
}

func updateMatches(existing *pb.Matches, last_time time.Time) (*pb.Matches, time.Time) {
	elapsed := time.Since(last_time)
	if elapsed.Minutes() < 5 {
		return existing, last_time
	}
	if(elapsed.Minutes() > 30){
		go scrape_and_prase()
	}

	matches, err := data.GetMatches()
	if err != nil {
		log.Error("Failed to get matches, keeping cache: ", err.Error())
		return existing, last_time
	}
	log.Info("Updating match data")
	return matches, time.Now()
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
	matches, last_updated := updateMatches(&pb.Matches{}, time.Date(2000, time.November, 10, 23, 0, 0, 0, time.UTC))
	completed := completedMatches(matches)
	maxAge := "max-age=5000"
	api := router.Group("/api")
	{
		api.GET("/matches", func(c *gin.Context) {
			c.Header("Cache-Control", maxAge)
			matches, last_updated = updateMatches(matches, last_updated)
			completed = completedMatches(matches)
			c.ProtoBuf(http.StatusOK, matches)
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
		api.GET("/scrape", func(c *gin.Context) {
			// c.Header("Cache-Control", maxAge)
			saved, err := data.SaveReplays(true)
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
			data.ParseJsons()
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

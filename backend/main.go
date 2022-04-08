package main
import (
        "flag"
        "fmt"
        "net/http"
        "os"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
        log "github.com/golang/glog"
        "github.com/gin-gonic/contrib/static"
        pb "github.com/f4hy/generals-stats/backend/proto"
        data "github.com/f4hy/generals-stats/backend/data"
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

        api := router.Group("/api")
        {
                api.GET("/matches", func(c *gin.Context) {
                        matches, err := data.GetMatches()
                        if err != nil {
                                c.AbortWithError(http.StatusInternalServerError, err)
                                return
                        }
                        c.ProtoBuf(http.StatusOK, matches)
                })
                api.GET("/playerstats", func(c *gin.Context) {
                        player_stats := data.PlayerStats()
                        c.ProtoBuf(http.StatusOK, player_stats)
                })
                api.GET("/generalstats", func(c *gin.Context) {
                        general := data.GeneralStats()
                        c.ProtoBuf(http.StatusOK, general)
                })
                api.GET("/teamstats", func(c *gin.Context) {
                        ts := data.TeamStats()
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
                        // request2 := &pb.MatchInfo{}
                        // b,err := c.GetRawData()
                        // // fmt.Println(b)
                        // // log.Error(err)
                        // proto.Unmarshal(b, request2)
                        // fmt.Println("1 " + request.GetMap())
                        // fmt.Println("2 " + request2.GetMap())
                        // j,err := protojson.Marshal(request)
                        // fmt.Println("json?" + string(j))
                        // log.Error(err)
                        // c.ProtoBuf(http.StatusOK, request)
                })
                api.GET("/health", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{"status": "ok"})
                })
        }
        fmt.Printf("Running in port %s", port)
        // Start and run the server
        router.Run(fmt.Sprintf(":%s", port))
}

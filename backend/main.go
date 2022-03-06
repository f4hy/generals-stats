package main
import (
        "flag"
        "fmt"
        "net/http"
        "os"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
        log "github.com/golang/glog"
        "github.com/golang/protobuf/proto"
        "google.golang.org/protobuf/encoding/protojson"
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
        api := router.Group("/api")
        {
                api.GET("/test", func(c *gin.Context) {
                        response := &pb.HelloReply{
                                Message: "Hello there",
                        }
                        b,err := protojson.Marshal(response)
                        log.Error(err)
                        fmt.Println(string(b))
                        s,err := proto.Marshal(response)
                        fmt.Println(string(s))
                        c.ProtoBuf(http.StatusOK, response)
                })
                api.GET("/matches", func(c *gin.Context) {
			example_matches := data.ExampleMatches()
			c.ProtoBuf(http.StatusOK, &example_matches)
		})
                api.POST("/pbmsg", func(c *gin.Context) {
                        request := &pb.HelloRequest{}
			c.Bind(request)
			// b,err := c.GetRawData()
                        // fmt.Println(b)
			// log.Error(err)
			// proto.Unmarshal(b, request)
                        fmt.Println("Wtf " + request.Name)
                        j,err := protojson.Marshal(request)
                        fmt.Println("Wtf " + request.Name)
                        fmt.Println("json?" + string(j))
			log.Error(err)
			response := &pb.Player{Name: request.GetName(),
				General: pb.General_DEMO,
				Team: pb.Team_THREE}
                        // response := &pb.HelloReply{
                        //         Message: "Hello " + request.Name,
                        // }
			c.ProtoBuf(http.StatusOK, response)
                        // c.JSON(http.StatusOK, gin.H{"works":  request.Name })
                })
                api.GET("/health", func(c *gin.Context) {
                        c.JSON(http.StatusOK, gin.H{"status": "ok"})
                })
        }
        fmt.Printf("Running in port %s", port)
        // Start and run the server
        router.Run(fmt.Sprintf(":%s", port))
}

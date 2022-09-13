package data

import (
	"fmt"
	"github.com/gocolly/colly"
	// "github.com/gocolly/colly/debug"
	"strings"
	"time"
)

func scrape(since time.Time) map[string][]byte {
	// Instantiate default collector
	c := colly.NewCollector(
		colly.AllowedDomains("www.gentool.net"),
		colly.Async(true),
		// colly.Debugger(&debug.LogDebugger{}),
	)
	replay_data := make(map[string][]byte)

	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 2})
	// c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 2})
	// On every a element which has href attribute call callback
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")
		// Print link
		// fmt.Printf("Link found: %q -> %s\n", e.Text, link)
		if strings.Contains(e.Text, ".rep") {
			fmt.Println("Found Replay", e.Request.AbsoluteURL(link))
			c.Visit(e.Request.AbsoluteURL(link))
		}
		if strings.Contains(e.Text, "OneThree") || strings.Contains(e.Text, "Modus") || strings.Contains(e.Text, "jbb") {
			fmt.Println("Found", e.Request.AbsoluteURL(link))
			c.Visit(e.Request.AbsoluteURL(link))
		}
		if strings.Contains(e.Text, "_January") ||
			strings.Contains(e.Text, "_February") ||
			strings.Contains(e.Text, "_March") ||
			strings.Contains(e.Text, "_April") ||
			strings.Contains(e.Text, "_May") ||
			strings.Contains(e.Text, "_June") ||
			strings.Contains(e.Text, "_July") ||
			strings.Contains(e.Text, "_August") ||
			strings.Contains(e.Text, "_September") ||
			strings.Contains(e.Text, "_November") ||
			strings.Contains(e.Text, "_Monday") ||
			strings.Contains(e.Text, "_Tuesday") ||
			strings.Contains(e.Text, "_Wednesday") ||
			strings.Contains(e.Text, "_Thursday") ||
			strings.Contains(e.Text, "_Friday") ||
			strings.Contains(e.Text, "_Saturday") ||
			strings.Contains(e.Text, "_Sunday") {
			fmt.Println("Found", e.Request.AbsoluteURL(link))
			c.Visit(e.Request.AbsoluteURL(link))
		}
		// Visit link found on page
		// Only those links are visited which are in AllowedDomains
		// c.Visit(e.Request.AbsoluteURL(link))
	})

	// Before making a request print "Visiting ..."
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL.String())
	})
	c.OnResponse(func(r *colly.Response) {
		fmt.Println("Response", r.FileName())
		if strings.Contains(r.FileName(), ".rep") {

			r.Save("./scraped_replays/" + r.FileName())
			replay_data[r.FileName()] = r.Body
		}
	})
	// c.Visit("http://www.gentool.net/data/zh/")

	for i := since; i.Before(time.Now()); i = i.AddDate(0, 0, 1) {
		year, month, day := i.Date()
		this_url := fmt.Sprintf("http://www.gentool.net/data/zh/%d_%02d_%s/%02d_%s", year, int(month), month, day, i.Weekday())
		c.Visit(this_url)
	}
	c.Wait()
	return replay_data
}

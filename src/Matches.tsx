import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import ThumbDownIcon from "@mui/icons-material/ThumbDown"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import * as React from "react"
import DisplayGeneral from "./Generals"
import { Matches, MatchInfo } from "./proto/match"
import ShowMatchDetails from "./ShowMatchDetails"

function getMatches(callback: (m: Matches) => void) {
  fetch("/api/matches").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j)
        const matches = Matches.decode(a)
        matches.matches.sort(
          (m1, m2) =>
            (m2.timestamp?.getTime() ?? 0) - (m1.timestamp?.getTime() ?? 0)
        )
        callback(matches)
      })
  )
}

function getMapList(callback: (m: string[]) => void) {
  fetch("/api/listmaps").then((r) =>
      r.json()
  ).then(callback)
}


function getMapUrl(mapname: string, callback: (m: string) => void) {
  fetch("/api/map/" + encodeURIComponent(mapname)).then((r) => r.text())
    .then((s) => callback(s))
}


function MatchCard(props: { avatar: React.ReactNode, title: React.ReactNode, color: string }) {
  return (
    <Card sx={{ backgroundColor: props.color }}>
      <CardHeader
        sx={{ m: 1 }}
        title={props.title}
        avatar={props.avatar}
      />
    </Card>
  )
}

function DisplayMatchInfo(props: { match: MatchInfo, maplist: string[] }) {
  const [details, setDetails] = React.useState<boolean>(false)
  const [mapUrl, setMapUrl] = React.useState<string>("")
    const [mapMatch, setMapMatch] = React.useState<string>("")
  const mapname = props.match.map.split("/").slice(-1).pop() ?? ""
  React.useEffect(() => {
    const mapmatch = props.maplist.find(m => m.includes(mapname))
      if(mapmatch){
        setMapMatch(mapmatch)
        const maproot = mapmatch.split("/").slice(-1).pop()
        if (maproot) {
            setMapMatch(mapmatch + " ??? " + maproot)
          getMapUrl(maproot, setMapUrl)
        }
	}
  }, [])

  const date: string = props.match.timestamp
    ? props.match.timestamp.toDateString()
    : "unknown"
  const header =
    "Match Id" +
    props.match.id +
    " Date: " +
    date +
    " on Map: " +
    props.match.map +
    "  winner:" +
    props.match.winningTeam
  const winners = props.match.players.filter(
    (p) => p.team === props.match.winningTeam
  )
  const losers = props.match.players.filter(
    (p) => p.team !== props.match.winningTeam
  )
  const losingTeam = losers[0].team
  return (
    <Paper sx={{ width: "90%" }}>
      <ListItem key="match">
        <ListItemText key="match-text" primary={header} />
      </ListItem>
      <Grid container spacing={1}>
        <Grid item xs={2}>{mapUrl.length ? <img src={mapUrl} /> : <div>no image</div>} </Grid>
        <Grid item xs={2}>
          <MatchCard title={
            <Typography variant="h5">
              {"Team " + props.match.winningTeam}
            </Typography>
          }
            avatar={<EmojiEventsIcon />}
            color="#c5e1a5"
          />
        </Grid>
        {winners.map((p) => (
          <Grid item xs={4}>
            <MatchCard title={
              <Typography variant="h5">{`${p.name.padEnd(
                50,
                " "
              )}`}</Typography>
            }
              avatar={<DisplayGeneral
                general={p.general}
                key={p.name + "-" + p.general + "-general"}
              />
              }
              color="#c5e1a5"
            />
          </Grid>
        ))}
        <Grid item xs={4}>
          <MatchCard title={
            <Typography variant="h5">
              {"Team " + losingTeam}
            </Typography>
          }
            avatar={<ThumbDownIcon />}
            color="#e57373"
          />
        </Grid>
        {losers.map((p) => (
          <Grid item xs={4}>
            <MatchCard title={
              <Typography variant="h5">{`${p.name.padEnd(
                50,
                " "
              )}`}</Typography>
            }
              avatar={<DisplayGeneral
                general={p.general}
                key={p.name + "-" + p.general + "-general"}
              />
              }
              color="#e57373"
            />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" onClick={() => setDetails(!details)}>
        Match Details
      </Button>
      {details ? <ShowMatchDetails id={props.match.id} /> : <Divider />}
    </Paper>
  )
}

const empty = { matches: [] }

export default function DisplayMatches() {
  const [matchList, setMatchList] = React.useState<Matches>(empty)
  const [mapList, setMapList] = React.useState<string[]>([])
  React.useEffect(() => {
      getMatches(setMatchList)
      getMapList(setMapList)
  }, [])
  return (
    <Paper>
      {matchList.matches.map((m, i) => (
          <>
          <DisplayMatchInfo match={m} maplist={mapList} key={m.id} />
          <Divider />
        </>
      ))}
    </Paper>
  )
}

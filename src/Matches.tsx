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
            (m1.timestamp?.getTime() ?? 0) - (m2.timestamp?.getTime() ?? 0)
        )
        callback(matches)
      })
  )
}

function DisplayMatchInfo(props: { match: MatchInfo }) {
  const [details, setDetails] = React.useState<boolean>(false)
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
    <Paper sx={{ width: "60%" }}>
      <ListItem key="match">
        <ListItemText key="match-text" primary={header} />
      </ListItem>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Card sx={{ maxWidth: 345, backgroundColor: "#c5e1a5" }}>
            <CardHeader
              sx={{ m: 1 }}
              title={
                <Typography variant="h5">
                  {"Team " + props.match.winningTeam + " Winners"}
                </Typography>
              }
              avatar={<EmojiEventsIcon />}
            />
          </Card>
        </Grid>
        {winners.map((p) => (
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345, backgroundColor: "#c5e1a5" }}>
              <CardHeader
                avatar={
                  <DisplayGeneral
                    general={p.general}
                    key={p.name + "-" + p.general + "-general"}
                  />
                }
                title={
                  <Typography variant="h5">{`${p.name.padEnd(
                    50,
                    " "
                  )}`}</Typography>
                }
              />
            </Card>
          </Grid>
        ))}
        <Grid item xs={3}>
          <Card sx={{ maxWidth: 345, backgroundColor: "#e57373" }}>
            <CardHeader
              sx={{ m: 1 }}
              title={
                <Typography variant="h5">
                  {"Team " + losingTeam + " Losers"}
                </Typography>
              }
              avatar={<ThumbDownIcon />}
            />
          </Card>
        </Grid>
        {losers.map((p) => (
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345, backgroundColor: "#e57373" }}>
              <CardHeader
                avatar={
                  <DisplayGeneral
                    general={p.general}
                    key={p.name + "-" + p.general + "-general"}
                  />
                }
                title={
                  <Typography variant="h5">{`${p.name.padEnd(
                    50,
                    " "
                  )}`}</Typography>
                }
              />
            </Card>
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
  React.useEffect(() => {
    getMatches(setMatchList)
  }, [])
  return (
    <Paper>
      {/* <Button variant="contained" onClick={() => getMatches(setMatchList)} >Get Matches</Button> */}
      <Typography>Will display this better later.</Typography>
      {matchList.matches.map((m, i) => (
        <>
          <DisplayMatchInfo match={m} key={m.id} />
          <Divider />
        </>
      ))}
    </Paper>
  )
}

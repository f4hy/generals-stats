import { Stack as ChartStack, ValueScale } from "@devexpress/dx-react-chart"
import {
  ArgumentAxis,
  BarSeries,
  Chart,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import * as React from "react"
import DisplayGeneral from "./Generals"
import { Faction, General, PlayerStat, PlayerStats, PlayerStat_GeneralWL } from "./proto/match"

function getPlayerStats(callback: (m: PlayerStats) => void) {
  fetch("/api/playerstats").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j)
        const playerStats = PlayerStats.decode(a)
        callback(playerStats)
      })
  )
}

function roundUpNearestN(num: number, N: number) {
  return Math.ceil(num / N) * N
}

function PlayerListItem(props: { playerStatWL: PlayerStat_GeneralWL }){
    const p = props.playerStatWL
    return (
    <ListItem>
      <ListItemAvatar>
        <DisplayGeneral general={p.general} />
      </ListItemAvatar>
      <ListItemText
        primary={`${General[p.general]}: (${p.winLoss?.wins ?? 0} : ${p.winLoss?.losses ?? 0
          })`}
      />
    </ListItem>
  )
}

function DisplayPlayerStat(props: { stat: PlayerStat; max: number }) {
  const sorted = props.stat.stats.sort((s1, s2) => s1.general - s2.general)
  const data = sorted.map((p) => ({
    general: General[p.general],
    wins: p.winLoss?.wins ?? 0,
    losses: p.winLoss?.losses ?? 0,
  }))
  const faction_sorted = props.stat.factionStats.sort(
    (s1, s2) => s1.faction - s2.faction
  )
  const faction_data = faction_sorted.map((p) => ({
    faction: Faction[p.faction],
    wins: p.winLoss?.wins ?? 0,
    losses: p.winLoss?.losses ?? 0,
  }))
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <List>
            <ListItem>
              <ListItemText primary={"Player Name: " + props.stat.playerName} />
            </ListItem>
            {sorted.map((p) => (<PlayerListItem playerStatWL={p} />))}
          </List>
        </Grid>
        <Grid item xs={9}>
          <Chart data={faction_data}>
            <ArgumentAxis />
            <ValueAxis />
            <ValueScale modifyDomain={(x) => [0, props.max]} />
            <BarSeries valueField="wins" argumentField="faction" name="wins" />
            <BarSeries
              valueField="losses"
              argumentField="faction"
              name="losses"
            />
            <ChartStack />
          </Chart>
          <Chart data={data}>
            <ArgumentAxis />
            <ValueAxis />
            <ValueScale modifyDomain={(x) => [0, props.max]} />
            <BarSeries valueField="wins" argumentField="general" name="wins" />
            <BarSeries
              valueField="losses"
              argumentField="general"
              name="losses"
            />
            <ChartStack />
          </Chart>
        </Grid>
      </Grid>
    </Box>
  )
}

const empty = { playerStats: [] }

export default function DisplayPlayerStats() {
  const [playerStats, setPlayerStats] = React.useState<PlayerStats>(empty)
  React.useEffect(() => {
    getPlayerStats(setPlayerStats)
  }, [])
  const maxwl = playerStats.playerStats.reduce(
    (acc, s) =>
      Math.max(
        acc,
        s.factionStats.reduce(
          (ac, x) => Math.max(ac, x.winLoss?.wins ?? 0, x.winLoss?.losses ?? 0),
          0
        )
      ),
    0
  )
  const maxWinLoss = roundUpNearestN(maxwl + 1, 2)
  return (
    <Paper>
      {playerStats.playerStats.map((m) => (
        <>
          <DisplayPlayerStat stat={m} max={maxWinLoss} />
          <Divider />
        </>
      ))}
    </Paper>
  )
}

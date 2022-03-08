import { Stack } from '@devexpress/dx-react-chart';
import {
  ArgumentAxis, BarSeries, Chart, ValueAxis
} from '@devexpress/dx-react-chart-material-ui';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import DisplayGeneral from "./Generals";
import { General, PlayerStat, PlayerStats } from "./proto/match";

function getPlayerStats(callback: (m: PlayerStats) => void) {
  fetch("/api/playerstats",
  ).then(r => r.blob().then(b => b.arrayBuffer())
    .then(j => {
      console.log(j)
      const a = new Uint8Array(j)
      const playerStats = PlayerStats.decode(a)
      callback(playerStats)
    }))
}

function DisplayPlayerStat(props: { stat: PlayerStat }) {
  const sorted = props.stat.stats.sort((s1, s2) => s1.general - s2.general)
  const data = sorted.map(p => ({ general: General[p.general], wins: p.winLoss?.wins ?? 0, losses: p.winLoss?.losses ?? 0 }))
  return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <List>
              <ListItem>
                <ListItemText primary={"Player Name: " + props.stat.playerName} />
              </ListItem>
              {sorted.map(p =>
              (
                <ListItem>
                  <ListItemAvatar>
                    <DisplayGeneral general={p.general} />
                  </ListItemAvatar>
                  <ListItemText primary={`${General[p.general]}: (${p.winLoss?.wins ?? 0} : ${p.winLoss?.losses ?? 0})`} />
                </ListItem>
              )
              )}
            </List>
          </Grid>
          <Grid item xs={9}>
            <Chart data={data}>
              <ArgumentAxis />
              <ValueAxis />
              <BarSeries valueField="wins" argumentField="general" name="wins" />
              <BarSeries valueField="losses" argumentField="general" name="losses" />
              <Stack />
            </Chart>
          </Grid>
        </Grid>
      </Box>
  )
}

const empty = { playerStats: [] }

export default function DisplayPlayerStats() {
  const [playerStats, setPlayerStats] = React.useState<PlayerStats>(empty);
  React.useEffect(() => {
    getPlayerStats(setPlayerStats)

  }, []);
  return (<Paper>

    {/* <Button variant="contained" onClick={() => getPlayerStats(setPlayerStats)} >Get Matches</Button> */}
    {playerStats.playerStats.map(m => (<><DisplayPlayerStat stat={m} /><Divider /></>))}
  </Paper>);
}

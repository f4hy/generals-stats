import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Matches, MatchInfo, General, PlayerStats, PlayerStat } from "./proto/match"
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DisplayGeneral from "./Generals"




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
  const sorted = props.stat.stats.sort((s1,s2)=> s1.general - s2.general)
  return (
    <Paper>
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
    </Paper >
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
    <Typography>Will make this graphs later.</Typography>
    {playerStats.playerStats.map(m => (<><DisplayPlayerStat stat={m} /><Divider /></>))}
  </Paper>);
}

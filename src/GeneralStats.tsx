import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Matches, MatchInfo, General, GeneralStats, GeneralStat } from "./proto/match"
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DisplayGeneral from "./Generals"




function getGeneralStats(callback: (m: GeneralStats) => void) {
  fetch("/api/generalstats",
  ).then(r => r.blob().then(b => b.arrayBuffer())
    .then(j => {
      console.log(j)
      const a = new Uint8Array(j)
      const generalStats = GeneralStats.decode(a)
      generalStats.generalStats.sort((s1, s2) => s1.general - s2.general)
      callback(generalStats)
    }))
}

function DisplayGeneralStat(props: { stat: GeneralStat }) {
  const sorted = props.stat.stats.sort((s1,s2)=> s1.playerName.length - s2.playerName.length)
    const overall = props.stat.total
    return (
    <Paper>
      <List>
        <ListItem>
          <ListItemAvatar>
            <DisplayGeneral general={props.stat.general} />
          </ListItemAvatar>
          <ListItemText primary={General[props.stat.general]} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Total: (${overall?.wins ?? 0} : ${overall?.losses ?? 0}) ` } />
        </ListItem>
	<Divider/>
        {sorted.map(p =>
        (
          <ListItem>
            <ListItemText primary={`${p.playerName}: (${p.winLoss?.wins ?? 0} : ${p.winLoss?.losses ?? 0})`} />
          </ListItem>
        )
        )}
      </List>
    </Paper >
  )
}

const empty = { generalStats: [] }

export default function DisplayGeneralStats() {
  const [generalStats, setGeneralStats] = React.useState<GeneralStats>(empty);
  React.useEffect(() => {
    getGeneralStats(setGeneralStats)

  }, []);
  return (<Paper>

    {/* <Button variant="contained" onClick={() => getGeneralStats(setGeneralStats)} >Get Matches</Button> */}
    <Typography>Will make this graphs later.</Typography>
    {generalStats.generalStats.map(m => (<><DisplayGeneralStat stat={m} /><Divider /></>))}
  </Paper>);
}

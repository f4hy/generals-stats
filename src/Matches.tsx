import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import DisplayGeneral from "./Generals";
import { General, Matches, MatchInfo } from "./proto/match";



function getMatches(callback: (m: Matches) => void) {
  fetch("/api/matches",
  ).then(r => r.blob().then(b => b.arrayBuffer())
    .then(j => {
      console.log(j)
      const a = new Uint8Array(j)
	const matches = Matches.decode(a)
      matches.matches.sort((m1,m2)=> m1.id - m2.id)
      callback(matches)
    }))
}

function DisplayMatchInfo(props: { match: MatchInfo }) {
  return (
    <Paper>
      <List>
        <ListItem key="match">
          <ListItemText key="match-text" primary={"Match Id" + props.match.id + " on Map: " + props.match.map + "  winner:" + props.match.winningTeam} />
        </ListItem>
        {props.match.players.map(p =>
        (
          <ListItem key={p.name +'-' + p.general} sx={{color:  p.team === props.match.winningTeam ? 'success.main' : 'error.main'}}>
            <ListItemIcon key={p.name +'-' + p.general + '-icon'}>
              {p.team === props.match.winningTeam ? <EmojiEventsIcon /> : <ThumbDownIcon />}
            </ListItemIcon>
	    <ListItemAvatar key={p.name +'-' + p.general + '-avatar'}>
            <DisplayGeneral general={p.general} key={p.name +'-' + p.general + '-general'} />
	    </ListItemAvatar>
            <ListItemText primary={` Player: ${p.name.padEnd(50, ' ')}:` + General[p.general] + " team:" + p.team} key={p.name +'-' + p.general + '-text'} />
          </ListItem>
        )
        )}
      </List>
    </Paper >
  )
}

const empty = { matches: [] }

export default function DisplayMatches() {
  const [matchList, setMatchList] = React.useState<Matches>(empty);
  React.useEffect(() => {
    getMatches(setMatchList)

  }, []);
    return (<Paper>
      
      {/* <Button variant="contained" onClick={() => getMatches(setMatchList)} >Get Matches</Button> */}
    <Typography>Will display this better later.</Typography>
    {matchList.matches.map(m => (<><DisplayMatchInfo match={m} key={m.id} /><Divider /></>))}
  </Paper>);
}

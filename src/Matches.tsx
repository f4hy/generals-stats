import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Matches, MatchInfo, General } from "./proto/match"
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import List from '@mui/material/List';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DisplayGeneral from "./Generals"



function getMatches(callback: (m: Matches) => void) {
  fetch("/api/matches",
  ).then(r => r.blob().then(b => b.arrayBuffer())
    .then(j => {
      console.log(j)
      const a = new Uint8Array(j)
      const matches = Matches.decode(a)
      callback(matches)
    }))
}

function DisplayMatchInfo(props: { match: MatchInfo }) {
  return (
    <Paper>
      <List>
        <ListItem>
          <ListItemText primary={"Match Id" + props.match.id + " on Map: " + props.match.map + "  winner:" + props.match.winningTeam} />
        </ListItem>
        {props.match.players.map(p =>
        (
          <ListItem sx={{color:  p.team === props.match.winningTeam ? 'success.main' : 'error.main'}}>
            <ListItemIcon>
              {p.team === props.match.winningTeam ? <EmojiEventsIcon /> : <ThumbDownIcon />}
            </ListItemIcon>
	    <ListItemAvatar>
            <DisplayGeneral general={p.general} />
	    </ListItemAvatar>
            <ListItemText primary={` Player: ${p.name.padEnd(50, ' ')}:` + General[p.general] + " team:" + p.team} />
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
      
    <Button variant="contained" onClick={() => getMatches(setMatchList)} >Get Matches</Button>
    <Typography>Its just randomly generated matches for now.</Typography>
    {matchList.matches.map(m => (<><DisplayMatchInfo match={m} /><Divider /></>))}
  </Paper>);
}

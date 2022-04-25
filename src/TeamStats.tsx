import { scaleBand } from "@devexpress/dx-chart-core";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import * as React from "react";
import { DateMessage, TeamStat, TeamStats } from "./proto/match";

function getTeamStats(callback: (m: TeamStats) => void) {
  fetch("/api/teamstats").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j);
        const teamStats = TeamStats.decode(a);
        callback(teamStats);
      })
  );
}

function roundUpNearest5(num: number) {
  console.log("ceil is for " + num + ":" + Math.ceil(num / 5));
  return Math.ceil(num / 5) * 5;
}

/* interface OverTime {
*     sum: {[team: string]: number}
*     running: ({date: string, data: {[team: string]: number}})[]
* } */
interface OverTime {
  date: string
  team1: 0
  team3: 0
}

function datemsgtoString(datemsg: DateMessage | undefined) {
  if (datemsg) {
    return `${datemsg.Year}-${datemsg.Month}-${datemsg.Day}`
  }
  return "unknown"
}

function RecordOverTime(props: { stats: TeamStats }) {
  const initial: OverTime[] = []
  function reducer(acc: OverTime[], next: TeamStat): OverTime[] {
    const datestr = datemsgtoString(next.date)
    const toAdd: OverTime = { date: datestr, team1: 0, team3: 0 }
    if (acc.length) {
      const last = acc[acc.length - 1]
      if (last.date === datestr) { acc.pop() }
      toAdd.team1 += last.team1
      toAdd.team3 += last.team3
    }
    if (next.team == 1) {
      toAdd.team1 += next.wins
    }
    if (next.team == 3) {
      toAdd.team3 += next.wins
    }
    return [...acc, toAdd]


  }
  const data = props.stats.teamStats.reduce(reducer, (initial))
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container>
        <ResponsiveContainer width="95%" height={500}>
          <LineChart
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="team1" stroke="#8884d8" strokeWidth={3}/>
            <Line dataKey="team3" stroke="#82ca9d" strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </Container>
    </Box>

  )
}

function DisplayTeamStat(props: {
  stats: TeamStat[];
  title: string;
  max: number;
}) {
  /* const data = [props.stats.reduce((acc, s) => ({teamname: `${s.team}`, [s.team]: s.wins, ...acc}), {})] */
  const data = props.stats.sort((x1, x2) => x1.team - x2.team) //.reduce((o, x)=> ({...o, ["team"+ x.team]: x.wins}), {"a": 1})];
  return (

    <Box sx={{ flexGrow: 1 }}>
      <h3>{props.title}</h3>
      <Container>
        <ResponsiveContainer width="95%" height={300}>
          <BarChart data={data} layout="horizontal">
            <Bar dataKey="wins" fill="#8884d8" />
            <XAxis dataKey="team" label="team" />
            <YAxis domain={[0, props.max]} />
            <Tooltip cursor={false} />
          </BarChart>
        </ResponsiveContainer>
      </Container>
    </Box>
  );
}

const empty = { teamStats: [] };

export default function DisplayTeamStats() {
  const [teamStats, setTeamStats] = React.useState<TeamStats>(empty);
  React.useEffect(() => {
    getTeamStats(setTeamStats);
  }, []);
  const max = teamStats.teamStats.reduce((max, s) => Math.max(max, s.wins), 0);
  function reducer(totals: TeamStat[], next: TeamStat) {
    const existing = totals.find((t) => t.team === next.team);
    if (existing) {
      existing.wins += next.wins;
    } else {
      totals.push({ ...next });
    }
    return totals;
  }
  const total = teamStats.teamStats.reduce(reducer, []);
  /* const total_max = total.reduce((max, s) => Math.max(max, s.wins), 0); */
  const grouped = Object.entries(
    _.groupBy(
      teamStats.teamStats,
      (ts: TeamStat) =>
        `${ts.date?.Year ?? 0}-${ts.date?.Month ?? 0}-${ts.date?.Day ?? 0}`
    )
  );
  return (
    <Paper>
      <Typography variant="h2">Team Records by session.</Typography>
      {/* <Button variant="contained" onClick={() => getGeneralStats(setGeneralStats)} >Get Matches</Button> */}
      <RecordOverTime stats={teamStats} />
      {/* <DisplayTeamStat
        stats={total}
        title="Total"
        max={roundUpNearest5(total_max)}
      /> */}
      {grouped.map(([date, m]) => (
        <>
          <DisplayTeamStat stats={m} title={date} max={roundUpNearest5(max)} />
          <Divider />
        </>
      ))}
    </Paper>
  );
}

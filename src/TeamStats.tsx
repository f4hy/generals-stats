import { scaleBand } from "@devexpress/dx-chart-core";
import {
  ArgumentScale,
  EventTracker,
  ValueScale,
} from "@devexpress/dx-react-chart";
import {
  ArgumentAxis,
  BarSeries,
  Chart,
  Title,
  Tooltip,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import * as React from "react";
import { TeamStat, TeamStats } from "./proto/match";

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

function DisplayTeamStat(props: {
  stats: TeamStat[];
  title: string;
  max: number;
}) {
  /* const data = [props.stats.reduce((acc, s) => ({teamname: `${s.team}`, [s.team]: s.wins, ...acc}), {})] */
  const data = props.stats;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Chart data={data}>
        <ArgumentAxis>
          <Title text="Team" />{" "}
        </ArgumentAxis>
        <ArgumentScale factory={scaleBand} />
        <ValueAxis>
          <Title text={"Wins:" + props.title} />
        </ValueAxis>
        <ValueScale modifyDomain={(x) => [0, props.max]} />
        <BarSeries valueField="wins" argumentField="team" name="wins" />
        <Title text={props.title} />
        <EventTracker />
        <Tooltip />
      </Chart>
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
  const total_max = total.reduce((max, s) => Math.max(max, s.wins), 0);
  const grouped = Object.entries(
    _.groupBy(
      teamStats.teamStats,
      (ts: TeamStat) =>
        `${ts.date?.Year ?? 0}-${ts.date?.Month ?? 0}-${ts.date?.Day ?? 0}`
    )
  );
  return (
    <Paper>
      <Typography variant="h2">Team records. Total and by session.</Typography>
      {/* <Button variant="contained" onClick={() => getGeneralStats(setGeneralStats)} >Get Matches</Button> */}
      <DisplayTeamStat
        stats={total}
        title="Total"
        max={roundUpNearest5(total_max)}
      />
      {grouped.map(([date, m]) => (
        <>
          <DisplayTeamStat stats={m} title={date} max={roundUpNearest5(max)} />
          <Divider />
        </>
      ))}
    </Paper>
  );
}

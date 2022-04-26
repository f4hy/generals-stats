import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import * as React from "react";
import { DateMessage, MapStats, MapStat } from "./proto/match";

function getMapStats(callback: (m: MapStats) => void) {
  fetch("/api/mapstats").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j);
        const mapstats = MapStats.decode(a);
        callback(mapstats);
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

function DisplayMapstat(props: {
  stats: MapStat[];
  title: string;
  max: number;
}) {
  /* const data = [props.stats.reduce((acc, s) => ({teamname: `${s.team}`, [s.team]: s.wins, ...acc}), {})] */
  const data = props.stats.sort((x1, x2) => x1.team - x2.team) //.reduce((o, x)=> ({...o, ["team"+ x.team]: x.wins}), {"a": 1})];
  return (

    <Box sx={{ flexGrow: 1 }}>
      <h3>{props.title}</h3>
      <ResponsiveContainer width="90%" height={300}>
        <BarChart data={data} layout="horizontal">
          <Bar dataKey="wins" fill="#8884d8" />
          <XAxis dataKey="team" label="team" />
          <YAxis domain={[0, props.max]} label="wins" />
          <Tooltip cursor={false} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

const empty = { mapStats: [] };

interface Red {
  map: string;
  team1: number;
  team3: number
}

export default function DisplayMapstats() {
  const [mapstats, setMapstats] = React.useState<MapStats>(empty);
  React.useEffect(() => {
    getMapStats(setMapstats);
  }, []);
  const max = mapstats.mapStats.reduce((max, s) => Math.max(max, s.wins), 0);
  const initial: Red[] = []
    function reducer(reds: Red[], next: MapStat) {
	const nmap = next.map.split("/").pop()
	if(!nmap){return reds}
    const found = reds.find(r => r.map == nmap)

    if (found) {
      if (next.team == 1) {
        found.team1 += next.wins
      }
      if (next.team == 3) {
        found.team3 += next.wins
      }
      return reds
    }
    const n: Red = {
      map: nmap,
      team1: next.team == 1 ? next.wins : 0,
      team3: next.team == 3 ? next.wins : 0,
    }
    return [...reds, n]

    }
    function redScore(r: Red): number{
	return r.team1*1.01 + r.team3 + r.map.length * 0.00001
    }
  const data = mapstats.mapStats.reduce(reducer, initial).sort((m1, m2) => redScore(m2) - redScore(m1))
  return (
    <Paper>
      <Typography variant="h2">Map stats.</Typography>
      <Box sx={{ flexGrow: 1 }}>
        <ResponsiveContainer width="90%" height={800}>
          <BarChart data={data} layout="horizontal" margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }} >
            <Bar dataKey="team1" fill="#82ca9d" stackId="a" />
            <Bar dataKey="team3" fill="#8884d8" stackId="a" />
            <XAxis dataKey="map" label="map" angle={90} height={500} textAnchor="begin" minTickGap={0} interval={0} />
            <YAxis domain={[0, max]} label="wins" />
            <Tooltip cursor={false} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

import Box from "@mui/material/Box"
import _ from "lodash"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import * as React from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { MapStat, MapStats } from "./proto/match"
import useMediaQuery from '@mui/material/useMediaQuery';

function getMapStats(callback: (m: MapStats) => void) {
  fetch("/api/mapstats").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j)
        const mapstats = MapStats.decode(a)
        callback(mapstats)
      })
  )
}
const empty = { mapStats: [] }

interface Red {
  map: string
  team1: number
  team3: number
}

export default function DisplayMapstats() {
  const [mapstats, setMapstats] = React.useState<MapStats>(empty)
  React.useEffect(() => {
    getMapStats(setMapstats)
  }, [])
  const isBig = useMediaQuery('(min-width:1200px)');

  const max = mapstats.mapStats.reduce((max, s) => Math.max(max, s.wins), 0)
  const initial: Red[] = []
  function reducer(reds: Red[], next: MapStat) {
    const nmap = next.map.split("/").pop()
    if (!nmap) {
      return reds
    }
    const found = reds.find((r) => r.map === nmap)

    if (found) {
      if (next.team === 1) {
        found.team1 += next.wins
      }
      if (next.team === 3) {
        found.team3 += next.wins
      }
      return reds
    }
    const n: Red = {
      map: nmap,
      team1: next.team === 1 ? next.wins : 0,
      team3: next.team === 3 ? next.wins : 0,
    }
    return [...reds, n]
  }
  function redScore(r: Red): number {
    return r.team1 * 1.01 + r.team3 + r.map.length * 0.00001
  }
  const data = mapstats.mapStats
    .reduce(reducer, initial)
    .sort((m1, m2) => redScore(m2) - redScore(m1))
  const chunks = _.chunk(data, isBig ? 64 : 16)
  return (
    <Paper>
      <Typography variant="h2">Map stats.</Typography>
      <Box sx={{ flexGrow: 1, maxWidth: 1600, textAlign: "center" }}>
        {chunks.map(chunk => (
          <ResponsiveContainer width="99%" height={800}>
            <BarChart
              data={chunk}
              layout="horizontal"
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <Bar dataKey="team1" fill="#82ca9d" stackId="a" />
              <Bar dataKey="team3" fill="#8884d8" stackId="a" />
              <XAxis
                dataKey="map"
                label="map"
                angle={90}
                height={500}
                textAnchor="begin"
                minTickGap={0}
                interval={0}
              />
              <YAxis domain={[0, max]} label="wins" />
              <Tooltip cursor={false} />
            </BarChart>
          </ResponsiveContainer>
        ))}
      </Box>
    </Paper>
  )
}

import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import _ from "lodash"
import * as React from "react"
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import DisplayGeneral from "./Generals"
import {
  General,
  generalToJSON,
  PairsWinLosses,
  TeamPairs,
} from "./proto/match"

function getPairStats(callback: (m: TeamPairs) => void) {
  fetch("/api/pairstats").then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j)
        const mapstats = TeamPairs.decode(a)
        callback(mapstats)
      })
  )
}

const empty = { teamPairs: {} }

function DisplayPair(props: { general1: General; general2: General }) {
  const g1 = props.general1
  const g2 = props.general2
  return (
    <div>
      <DisplayGeneral general={g1} />
      <DisplayGeneral general={g2} />
    </div>
  )
}

function PairBarChart(props: { pairdata: PairsWinLosses; team: string }) {
  const d = props.pairdata.pairwl ?? []
  const data = d.map((pwl) => ({
    wins: pwl?.winloss?.wins ?? 0,
    losses: (pwl?.winloss?.losses ?? 0) * -1,
    pair: generalToJSON(pwl.general1) + " : " + generalToJSON(pwl.general2),
  }))
  const sorted = _.sortBy(data, (d) => -(d.losses + d.wins * 1.001))
  return (
    <Paper>
      <Typography variant="h3">Team {props.team} pairs!</Typography>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={sorted}
          layout="horizontal"
          stackOffset="sign"
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Bar dataKey="wins" fill="#42A5F5" stackId="a" />
          <Bar dataKey="losses" fill="#FF7043" stackId="a" />
          <ReferenceLine y={0} stroke="#000" />
          <XAxis
            dataKey="pair"
            label="pair"
            height={300}
            angle={-90}
            minTickGap={0}
            interval={0}
            textAnchor="end"
            dx={-6}
          />
          <YAxis label="wins" />
          <Tooltip cursor={false} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default function DisplayPairstats() {
  const [pairstats, setPairstats] = React.useState<TeamPairs>(empty)
  React.useEffect(() => {
    getPairStats(setPairstats)
  }, [])
  const teams = _.sortBy(Object.keys(pairstats.teamPairs), (x) => x)
  return (
    <>
      <Typography variant="h2">Pair stats.</Typography>
      <Box sx={{ flexGrow: 1 }}>
        {teams.map((team) => (
          <PairBarChart pairdata={pairstats.teamPairs[team]} team={team} />
        ))}
      </Box>
    </>
  )
}

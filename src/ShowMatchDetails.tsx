import Divider from "@mui/material/Divider"
import _ from "lodash"
import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import { TeamColor } from "./Colors"
import CostBreakdown from "./CostBreakdown"
import { APM, MatchDetails, Upgrades } from "./proto/match"

function getDetails(id: number, callback: (m: MatchDetails) => void) {
  fetch("/api/details/" + id).then((r) =>
    r
      .blob()
      .then((b) => b.arrayBuffer())
      .then((j) => {
        const a = new Uint8Array(j)
        const costs = MatchDetails.decode(a)
        callback(costs)
      })
  )
}

const empty: MatchDetails = {
  matchId: 0,
  costs: [],
  apms: [],
  upgradeEvents: {},
}

const shapes: (
  | "circle"
  | "cross"
  | "diamond"
  | "square"
  | "star"
  | "triangle"
)[] = ["circle", "star", "square", "triangle"]

function EventChart(props: { upgrades: { [name: string]: Upgrades } }) {
  const names = Object.keys(props.upgrades).sort((x1, x2) =>
    x1.localeCompare(x2)
  )
  if (props.upgrades) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
          {names.map((name, idx) => (
            <Scatter
              name={name}
              fill={TeamColor(name)}
              data={props.upgrades[name].upgrades}
              shape={shapes[idx]}
              legendType={shapes[idx]}
            >
              {/* <LabelList dataKey="upgradeName" position="left" formatter={labelformater} offset={100} /> */}
            </Scatter>
          ))}
          <XAxis type="number" dataKey="atMinute" />
          <YAxis
            type="number"
            dataKey="cost"
            label={{
              value: "Cost",
              position: "insideLeft",
              offset: -5,
              angle: -90,
            }}
          />
          <ZAxis dataKey="upgradeName" name="upgrade" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <CartesianGrid />
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>
    )
  } else {
    return <div>{JSON.stringify(props.upgrades)}</div>
  }
}

function ApmChart(props: { apms: APM[] }) {
  const data = _.sortBy(props.apms, (a) => -a.apm)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="horizontal"
        margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
      >
        <Bar dataKey="apm" fill="#42A5F5" />
        <XAxis dataKey="playerName" />
        <YAxis
          label={{
            value: "Actions Per Minute",
            position: "insideLeft",
            offset: -5,
            angle: -90,
          }}
        />
        <Tooltip cursor={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function ShowMatchDetails(props: { id: number }) {
  const [details, setDetails] = React.useState<MatchDetails>(empty)
  React.useEffect(() => {
    getDetails(props.id, setDetails)
  }, [props.id])
  return (
    <>
      <EventChart upgrades={details.upgradeEvents} />
      <ApmChart apms={details.apms} />
      <Divider />
      <CostBreakdown costs={details.costs} />
    </>
  )
}

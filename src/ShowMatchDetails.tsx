import { blue, lightGreen, purple, red } from "@mui/material/colors"
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import _ from "lodash"
import * as React from "react"
import {
  Bar,
    BarChart,
    LineChart,
    Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Costs_BuiltObject, MatchDetails, APM, UpgradeEvent } from "./proto/match"
import CostBreakdown from "./CostBreakdown"

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

const empty: MatchDetails = { matchId: 0, costs: [], apms: [], upgradeEvents: {} }

function EventChart(props: {upgrades: UpgradeEvent[]}){
    if(props.upgrades){
    return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={props.upgrades}
            layout="horizontal"
            margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
          >
            <Line dataKey="upgradeName" />
            <XAxis dataKey="timecode" />
            <YAxis
              label={{
                value: "Actions Per Minute",
                position: "insideLeft",
                offset: -5,
                angle: -90,
              }}
            />
            <Tooltip cursor={false} />
          </LineChart>
        </ResponsiveContainer>

      )
    }
    else{
	return (
    <div>{JSON.stringify(props.upgrades)}</div>
	)
    }
}

function ApmChart(props: {apms: APM[]}){
    const data = _.sortBy(props.apms, a => -a.apm)
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
    const upgrades = details.upgradeEvents?.Modus?.upgrades
  return (
    <>
	<ApmChart apms={details.apms} />
	<div>{JSON.stringify(details.upgradeEvents)}</div>
      {/* <EventChart upgrades={upgrades} /> */}
      <Divider />
      <CostBreakdown costs={details.costs} />
    </>
  )
}

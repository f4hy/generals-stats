import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import _ from "lodash"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import Stack from "@mui/material/Stack"
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
import useMediaQuery from "@mui/material/useMediaQuery"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import IconButton from "@mui/material/IconButton"

const players = ["Bill", "Brendan", "Jared", "Sean"]
const maxPage = 4
const clamp = (num: number) => Math.min(Math.max(num, 0), maxPage)

function color(n: number) {
  switch (n) {
    case 0:
      return "primary.dark"
    case 1:
      return "secondary.dark"
    case 2:
      return "primary.light"
    case 3:
      return "secondary.light"
    default:
      return "primary.main"
  }
}

function WrappedPage(props: { player: string | null; page: number }) {
  if (props.player === null) {
    return (
      <Typography variant="h2">Select your name for your wrapped</Typography>
    )
  }
  if (props.page < 1) {
    return (
      <Typography variant="h2">
        {props.player + " Welcome to your Generals 2022 Wrapped."}
      </Typography>
    )
  }
  if (props.page == 1) {
    return (
      <Stack spacing={8} direction="column">
        <Typography variant="h2">
          Wow you have played ?? games of Generals.
        </Typography>
        <Typography variant="h2"> Thats ?? Hours of your life.</Typography>
      </Stack>
    )
  }
  if (props.page == 2) {
    return (
      <Stack spacing={8} direction="column">
        <Typography variant="h2">Your most played General is ??.</Typography>{" "}
        <Typography variant="h2">
          {" "}
          You have a winrate of ??% with ??.
        </Typography>
      </Stack>
    )
  }
  if (props.page == 3) {
    return (
      <Stack spacing={8} direction="column">
        <Typography variant="h2">Your most built unit is ??</Typography>{" "}
        <Typography variant="h2">
          {" "}
          That is ?? more than anyone else and ?? total cost.
        </Typography>
      </Stack>
    )
  }
  if (props.page > 3) {
    return (
      <Stack spacing={8} direction="column">
        <Typography variant="h2">
          Your best General is ?? with a winrate of ??
        </Typography>{" "}
        <Typography variant="h2">
          {" "}
          Compared to the average for ?? of ??{" "}
        </Typography>
      </Stack>
    )
  }
  return <Typography variant="h2">Select your name for your wrapped</Typography>
}

export default function Wrapped() {
  const [player, setPlayer] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [page, setPage] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setPage(clamp(page + 1))
          return 0
        } else {
          return prevProgress + 1
        }
      })
    }, 100)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Paper>
      <Stack spacing={2} direction="column">
        <Stack
          spacing={8}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          {players.map((p) => (
            <Button
              variant="contained"
              onClick={() => {
                setPlayer(p)
                setProgress(0)
                setPage(0)
              }}
            >
              {p}
            </Button>
          ))}
        </Stack>
        <Stack spacing={2} direction="column">
          <Box
            sx={{
              height: "80%",
              minHeight: "30vw",
              backgroundColor: color(page),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WrappedPage player={player} page={page} />
          </Box>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <IconButton
              disabled={page <= 0}
              color="primary"
              onClick={() => {
                setPage(clamp(page - 1))
                setProgress(0)
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography>{page + "/" + maxPage}</Typography>
            <CircularProgress variant="determinate" value={progress} />
            <IconButton
              disabled={page >= maxPage}
              color="primary"
              onClick={() => {
                setPage(clamp(page + 1))
                setProgress(0)
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

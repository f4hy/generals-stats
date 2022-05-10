import AdapterDateFns from "@mui/lab/AdapterDateFns"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import enLocale from "date-fns/locale/en-US"
import * as React from "react"
import {
  General,
  generalFromJSON,
  MatchInfo,
  Player,
  Team,
} from "./proto/match"

function saveMatch(match: MatchInfo) {
  const mybytes = MatchInfo.encode(match).finish()
  console.log("mybytes? " + mybytes)
  fetch("http://localhost:5000/api/saveMatch", {
    method: "POST",
    headers: { "Content-Type": "application/x-protobuf" },
    body: mybytes,
  }).then((r) => alert(r.text()))
}

const allowed_players = ["Brendan", "Jared", "Sean", "Bill"]

export default function AddMatch() {
  const [id, setId] = React.useState<number>(1)
  const [players, setPlayers] = React.useState<string[]>([
    "Brendan",
    "Jared",
    "Sean",
    "Bill",
  ])
  const [teams, setTeams] = React.useState<Team[]>([1, 1, 3, 3])
  const [generals, setGenerals] = React.useState<(General | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ])
  const [date, setDate] = React.useState<Date | null>(new Date())
  const [winner, setWinner] = React.useState<1 | 2 | 3 | 4>(1)
  const [map, setMap] = React.useState<string>("")
  const [passcode, setPasscode] = React.useState<string>("")
  const idx4 = [0, 1, 2, 3]

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passcode !== "qwer1234") {
      alert("must have the pass code to save")
      return
    }
    if (!date) {
      alert("date unset")
      return
    }
    const myplayers: Player[] = idx4.map((i) => ({
      name: players[i],
      general: generals[i] ?? General.UNRECOGNIZED,
      team: teams[i],
    }))
    const match: MatchInfo = {
      id: id,
      timestamp: date,
      map: map,
      winningTeam: winner,
      players: myplayers,
      durationMinutes: 0.0 /* Not updated */,
    }
    saveMatch(match)
    alert("saved")
  }

  return (
    <Paper>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
        <form onSubmit={handleSubmit}>
          {idx4.map((i) => (
            <FormControl sx={{ m: 1, minWidth: 140 }} id="test">
              <InputLabel>{`Player${i + 1}`}</InputLabel>
              <Select
                labelId={`player${i}-label`}
                value={players[i]}
                label={`Player${i}`}
                name={`player${i}`}
                onChange={(event) => {
                  const newPlayers = [...players]
                  newPlayers[i] = event.target.value
                  setPlayers(newPlayers)
                }}
              >
                {allowed_players.map((p) => (
                  <MenuItem value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <Divider />
          {idx4.map((i) => (
            <FormControl sx={{ m: 1, minWidth: 140 }}>
              <InputLabel>{`Team${i + 1}`}</InputLabel>
              <Select
                labelId={`team${i}-label`}
                id={`team${i}`}
                value={teams[i]}
                label={`team${i}`}
                name={`team${i}`}
                onChange={(event) => {
                  const newTeams = [...teams]
                  newTeams[i] = +event.target.value
                  setTeams(newTeams)
                }}
              >
                {[1, 2, 3, 4].map((p) => (
                  <MenuItem value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <Divider />
          {idx4.map((i) => (
            <FormControl sx={{ m: 1, minWidth: 140 }}>
              <InputLabel id={`general${i}`}>{`General${i + 1}`}</InputLabel>
              <Select
                labelId={`general${i}-label`}
                id={`general${i}`}
                label={`General${i}`}
                name={`general${i}`}
                value={generals[i]}
                onChange={(event) => {
                  const newGenerals = [...generals]
                  const parsed = generalFromJSON(event.target.value)
                  newGenerals[i] = parsed
                  setGenerals(newGenerals)
                }}
              >
                {Object.keys(General)
                  .filter((key) => isNaN(Number(key)))
                  .map((g) => (
                    <MenuItem value={g}>{g}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          ))}
          <Divider />
          <FormControl>
            <FormLabel id="winner">Winner</FormLabel>
            <RadioGroup
              row
              name="winner"
              value={winner}
              onChange={(event) =>
                setWinner(+event.target.value as 1 | 2 | 3 | 4)
              }
            >
              {[1, 2, 3, 4].map((i) => (
                <FormControlLabel
                  value={i}
                  control={<Radio />}
                  label={`Team ${i}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <Divider />
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <DesktopDatePicker
              label="Date desktop"
              inputFormat="MM/dd/yyyy"
              value={date}
              onChange={setDate}
              renderInput={(params: any) => <TextField {...params} />}
            />
          </FormControl>
          <Divider />
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <TextField
              id="map"
              label="Map"
              variant="outlined"
              value={map}
              onChange={(event) => setMap(event.target.value)}
            />
          </FormControl>
          <Divider />
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <TextField
              id="passcode"
              type="password"
              label="passcode"
              variant="outlined"
              helperText="Must enter the passcode to save matches"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
            />
          </FormControl>
          <Divider />
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <TextField
              id="id"
              label="id"
              variant="outlined"
              value={id}
              onChange={(event) => setId(+event.target.value)}
            />
          </FormControl>
          <Divider />
          <Typography>{"id set to " + id}</Typography>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </form>
      </LocalizationProvider>
    </Paper>
  )
}

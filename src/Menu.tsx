/* Copied from https://mui.com/components/drawers/ and modified */
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ListIcon from "@mui/icons-material/List"
import MapIcon from "@mui/icons-material/Map"
import MenuIcon from "@mui/icons-material/Menu"
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech"
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import PeopleIcon from "@mui/icons-material/People"
import PersonIcon from "@mui/icons-material/Person"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import Divider from "@mui/material/Divider"
import MuiDrawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { CSSObject, styled, Theme, useTheme } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import * as React from "react"
import DisplayGeneralStats from "./GeneralStats"
import DisplayMapStats from "./MapStats"
import DisplayPairStats from "./PairStats"
import DisplayMatches from "./Matches"
import DisplayPlayerStats from "./PlayerStats"
import DisplayTeamStats from "./TeamStats"

const drawerWidth = 240

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}))

type Selection =
  | "Matches"
  | "GeneralStats"
  | "PlayerStats"
  | "TeamStats"
  | "MapStats"
  | "PairStats"
/* | "AddMatch" */

interface MenuItemProps {
  open: boolean
  value: Selection
  text: string
  icon: React.ReactNode
  callback: (s: Selection) => void
}

function Main(props: { selection: Selection }) {
  switch (props.selection) {
    /* case "AddMatch":
     *   return (<AddMatch />) */
    case "Matches":
      return <DisplayMatches />
    case "PlayerStats":
      return <DisplayPlayerStats />
    case "GeneralStats":
      return <DisplayGeneralStats />
    case "TeamStats":
      return <DisplayTeamStats />
    case "MapStats":
      return <DisplayMapStats />
    case "PairStats":
      return <DisplayPairStats />
    /* case "AddMatch":
     *   return <AddMatch />; */
    default:
      return <div>{props.selection}</div>
  }
}

function MenuItem(props: MenuItemProps) {
  const open = props.open
  return (
    <ListItemButton
      key={props.value}
      sx={{
        minHeight: 48,
        justifyContent: { open } ? "initial" : "center",
        px: 2.5,
      }}
      onClick={() => props.callback(props.value)}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: open ? 3 : "auto",
          justifyContent: "center",
        }}
      >
        {props.icon}
      </ListItemIcon>
      <ListItemText primary={props.text} sx={{ opacity: open ? 1 : 0 }} />
    </ListItemButton>
  )
}

export default function Menu() {
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [selection, setSelection] = React.useState<Selection>("Matches")

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {"Generals Stats - " + selection}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} sx={{width: 10 }}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <MenuItem
            value="Matches"
            text="Matches"
            open={open}
            icon={<ListIcon />}
            callback={setSelection}
          />
          <MenuItem
            value="PlayerStats"
            text="Player Stats"
            open={open}
            icon={<PersonIcon />}
            callback={setSelection}
          />
          <MenuItem
            value="TeamStats"
            text="Team Stats"
            open={open}
            icon={<PeopleIcon />}
            callback={setSelection}
          />
          <MenuItem
            value="GeneralStats"
            text="General Stats"
            open={open}
            icon={<MilitaryTechIcon />}
            callback={setSelection}
          />
          <MenuItem
            value="MapStats"
            text="Map Stats"
            open={open}
            icon={<MapIcon />}
            callback={setSelection}
          />
          <MenuItem
            value="PairStats"
            text="Pair Stats"
            open={open}
            icon={<LooksTwoIcon />}
            callback={setSelection}
          />
        </List>
        {/* <Divider />
        <List>
          <MenuItem
            value="AddMatch"
            text="Add Match"
            open={open}
            icon={<AddBoxIcon />}
            callback={setSelection}
          />
        </List> */}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader />
        <Main selection={selection} />
      </Box>
    </Box>
  )
}

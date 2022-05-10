import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Tooltip from "@mui/material/Tooltip"
import { MAPLIST } from "./maplist"

function getMapUrl(mapname: string) {
  return process.env.PUBLIC_URL + "/maps/" + mapname
}

export default function Map(props: { mapname: string }) {
  const mapname = props.mapname.split("/").slice(-1).pop() ?? ""
  const mapmatch = MAPLIST.find((m) => m.includes(mapname))
  const mapUrl = mapmatch ? getMapUrl(mapmatch) : ""

  return (
    <Tooltip title={mapname}>
      <Card>
        {/* <div>{mapUrl}</div>
        <div>{mapmatch}</div> */}
        <CardMedia component="img" image={mapUrl} height="200" alt={mapname} />
      </Card>
    </Tooltip>
  )
}

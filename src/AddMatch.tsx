import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { HelloReply, HelloRequest, Player, General } from "./proto/match"

export default function AddMatch() {
        const [response, setResponse] = React.useState<string>("");
    const hr: HelloReply = {message: "new testasdf"}
	const encoded = HelloReply.encode(hr).finish();
	const hr2 = HelloReply.decode(encoded)
  /* function test() {
    fetch("http://localhost:5000/api/test").then(r => r.text().then(s => {
*                 setResponse(s)
*         }))
* } */
        function test2() {
            const hreq: HelloRequest = {name: "owlbear"}
	    const mybytes = HelloRequest.encode(hreq).finish()
	    console.log("mybytes? " + mybytes)
			fetch("http://localhost:5000/api/pbmsg",
				{
					method: "POST",
					headers: { "Content-Type": "application/x-protobuf" },
					body: mybytes
                        }
                ).then(r => r.blob().then(b => b.arrayBuffer())
                        .then(j => {
                                console.log(j)
                                const a = new Uint8Array(j)
							const player = Player.decode(a)
							setResponse(" " + General[player.general] + " " + General[1]+ " " + JSON.stringify(player))

                        }))
        }

        return (<Paper>
                <Button variant="contained" onClick={() => test2()} >Hello World</Button>
                <Typography>{"Response " + response}</Typography>
                <Typography>{"pb? " + hr}</Typography>
                <Typography>{"pb? " + hr.message}</Typography>
                <Typography>{"pb2? " + JSON.stringify(hr2)}</Typography>
        </Paper>);
}

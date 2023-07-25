import express from "express";
import cors from "cors";
import { startGameBetWrapper } from ".";
import bodyParser from "body-parser";
import { start } from "repl";

const app = express();
const port = 3005;
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
    res.send("This is the backend API gateway for RoBet");
});

app.post("/start", async (req, res) => {
    console.log(req.body);
    const { p1, p2, p1bet, p2bet } = req.body;
    startGameBetWrapper(p1, p2, p1bet, p2bet)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (error) {
            const response = {
                "error": error
            };
            return res.status(error).json(response);
        })
    
});

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default server;
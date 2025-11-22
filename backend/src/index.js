import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import axios from "axios"

const app = express();
dotenv.config();

import { BalldontlieAPI } from "@balldontlie/sdk"
const nba_api = new BalldontlieAPI({});

app.get("/", (req, res) => {
    res.send("Server radi")
})

app.get("/nba", async (req, res) => {
  try {
    const response = await axios.get("https://api.balldontlie.io/v1/teams", {
      headers: {
        Authorization: `Bearer ${process.env.NBA_API}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/football", async (req, res) => {
    try {
        const response = await axios.get("https://api.football-data.org/v4/matches",
            {
                headers: {"X-Auth-Token": process.env.FOOTBALL_API}
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error");
    }
});

const PORT = 5000
app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`)
})
const express = require("express")
const app = express();
const axios = require("axios")
require("dotenv").config()

app.get("/", (req, res) => {
    res.send("Server radi")
})

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
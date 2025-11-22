const express = require("express")
const app = express();

app.get("/", (req, res) => {
    res.send("Server radi")
})

const PORT = 5000
app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`)
})
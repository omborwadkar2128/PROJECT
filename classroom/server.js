const express = require("express");
const app = express();

app.get("/" , (req , res) => {
    res.send("Hi , I am Root");
});

app.listen(4000 , () => {
    console.log("Server is running on port 4000");
});
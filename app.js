require("dotenv").config();
const express = require("express");
const router = require("./router/router");
const app = express();
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT || 8001;
require('../server/db/connect')
const cors = require("cors")

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static('./uploads'));
app.use("/files",express.static("./public/files"));
app.use(router);

app.listen(PORT,()=>{
    console.log(`listening to the port ${PORT}`)
})
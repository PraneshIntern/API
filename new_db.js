var createError = require("http-errors");
const express = require('express');
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
const mysql = require('mysql');
const morgan=require('morgan');
const app = express();
const port = 4042;

const https = require("https");
const fs = require("fs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(morgan());
const routes = require("./routes/allroutes");

const PORT = process.env.PORT || 4043;
app.use("/", routes)


app.use(function (req, res, next) {
  console.log("api running at port 4043");
})


app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}.`);
});




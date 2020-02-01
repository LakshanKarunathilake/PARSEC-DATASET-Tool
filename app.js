const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { createInitialJSON } = require("./JSONHandler");
const {traversInParameterCombination} =require("./TaskRunner");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hi There");
});

app.get("/getCSV", (req, res) => {
  res.download("./parameter-combination.csv");
});

app.post("/result", function(request, response) {
  var query1 = request.body.var1;
  var query2 = request.body.var2;
});

app.listen(8888, err => {
  if (err) {
    console.log("Error occured in app listening", err);
    return;
  }
  console.log("Connected to port 8888");
});

createInitialJSON()
    .then(()=>{
        traversInParameterCombination()

    })


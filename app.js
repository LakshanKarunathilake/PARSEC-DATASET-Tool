const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { createInitialCSV } = require("./CSVHandler");
require("./TaskRunner");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hi There");
});

app.get("/getCSV", (req, res) => {
  res.download("./out.csv");
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

// createInitialCSV()

const { exec } = require("child_process");

// exec("ping 8.8.8.8", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log("execution done");
//     console.log(`stdout: ${stdout}`);
// });

const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const {createInitialCSV} = require('./CSVHandler')
const {getDeployments} = require('./TaskRunner')

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hi There')
})

app.get('/getCSV', (req, res) => {
    res.download('./out.csv')
})

app.post('/result', function (request, response) {
    var query1 = request.body.var1;
    var query2 = request.body.var2;
});


app.listen(8888, () => {
    console.log('Connected to port 8080')
})

// createInitialCSV()
getDeployments()

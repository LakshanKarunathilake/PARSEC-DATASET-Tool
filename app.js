const express = require('express');
const app = express();

const {createInitialCSV} = require('./CSVHandler')
app.get('/', (req, res) => {
    res.send('Hi There')
})

app.listen(8888, () => {
    console.log('Connected to port 8080')
})

createInitialCSV()
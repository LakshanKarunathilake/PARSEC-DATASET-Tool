const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'name', title: 'Name'},
        {id: 'thread', title: 'Thread'},
        {id: 'compiler', title: 'Compiler'},
        {id: 'input', title: 'Input'},
        {id: 'real', title: 'Real'},
        {id: 'sys', title: 'Sys'},
        {id: 'usr', title: 'Usr'},
    ]
});

const applications = ['ferret', 'dedup']
const threads = [1, 2, 4, 8, 16, 32, 64, 128]
const input = ['test', 'simdev', 'simsmall', 'simmedium', 'simlargeand', 'native']
const compilers = {ferret: ['gcc', 'gcc-pthreads'], dedup: ['gcc', 'gcc-pthreads', 'tbb']}

/**
 * Create the initial CSV file for the dataset preparation
 */
function createInitialCSV() {
    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
}


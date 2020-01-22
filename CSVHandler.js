const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        {id: 'name', title: 'Name'},
        {id: 'threads', title: 'Threads'},
        {id: 'compiler', title: 'Compiler'},
        {id: 'input', title: 'Input'},
        {id: 'real', title: 'Real'},
        {id: 'sys', title: 'Sys'},
        {id: 'usr', title: 'Usr'},
    ],
    append:true
});

const applications = ['ferret', 'dedup']
const compilers = {ferret: ['gcc', 'gcc-pthreads','tbb'], dedup: ['gcc', 'gcc-pthreads', ]}
const inputSets = ['test', 'simdev', 'simsmall', 'simmedium', 'simlarge', 'native']
const threads = [1, 2, 4, 8, 16, 32, 64, 128]

/**
 * Create the initial CSV file for the dataset preparation
 */
function createInitialCSV() {
    console.log('calling')
    const DATA = [];
    const record = {name: '', input: '', compiler: '', threads: '', real: '', usr: '', sys: ''}

    applications.forEach(application => {
        record.name = application;
        const availableCompilers = compilers[application];
        availableCompilers.forEach(compiler => {
            record.compiler = compiler;
            inputSets.forEach(input => {
                record.input = input;
                threads.forEach(number => {
                    record.threads = number;
                    DATA.push(record)
                    console.log('record',record)
                    csvWriter
                        .writeRecords([record])
                        .then(() => console.log('The CSV file was written successfully'));
                })
            })
        })
        // console.log('record data', DATA)

    })
}



module.exports = {createInitialCSV}


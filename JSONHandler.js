const fs = require("fs");

const applications = ["ferret", "dedup"];
const compilers = {
  ferret: ["gcc", "gcc-pthreads", "tbb"],
  dedup: ["gcc", "gcc-pthreads"]
};
const inputSets = [
  "test",
  "simdev",
  "simsmall",
  "simmedium",
  "simlarge",
  "native"
];
const threads = [1, 2, 4, 8, 16, 32, 64, 128];

/**
 * Create the initial CSV file for the dataset preparation
 */
function createInitialJSON() {
  const DATA = {};
  const record = {
    id: "",
    name: "",
    input: "",
    compiler: "",
    threads: "",
    real: 0,
    usr: 0,
    sys: 0
  };
  let row_index = 1;
  applications.forEach(application => {
    const availableCompilers = compilers[application];
    availableCompilers.forEach(compiler => {
      inputSets.forEach(input => {
        threads.forEach(number => {
          for (let i = 1; i <= 2; i = i + 1) {
            record.name = application;
            record.compiler = compiler;
            record.input = input;
            record.threads = number;
            record.cores = i;
            record.id = row_index++;
            DATA[row_index] = record;
          }
        });
      });
    });
  });
  return new Promise((resolve, reject) => {
    fs.writeFile("./parameter-combination.json", JSON.stringify(DATA), err => {
      if (err) {
        console.log("error occured", err);
        reject("Failure in writing the file");
      }
      console.log("Parameter combinations are generated successfully");
      resolve("Done");
    });
  });
}

module.exports = { createInitialJSON };

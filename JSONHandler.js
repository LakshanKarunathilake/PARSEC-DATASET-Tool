const fs = require("fs");

const applications = ["ferret", "dedup", "x264"];
const compilers = {
  ferret: ["gcc", "gcc-pthreads", "gcc-tbb"],
  dedup: ["gcc", "gcc-pthreads"],
  x264: ["gcc", "gcc-pthreads"]
};
const inputSets = ["simdev", "simsmall", "simmedium", "simlarge", "native"];
const threads = [1, 2, 4, 8, 16, 32];
const DATA = {};
let results;
/**
 * Create the initial CSV file for the dataset preparation
 */
function createInitialJSON() {
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
        record.name = application;
        record.compiler = compiler;
        record.input = input;
        if (compiler === "gcc") {
          for (let i = 1; i <= 1; i = i + 1) {
            record.threads = 1;
            record.cores = i;
            record.id = row_index++;
            DATA[record.id] = { ...record };
          }
        } else {
          threads.forEach(number => {
            for (let i = 1; i <= 32; i = i + 1) {
              record.threads = number;
              record.cores = i;
              record.id = row_index++;
              DATA[record.id] = { ...record };
            }
          });
        }
      });
    });
  });
  results = DATA;
  writeTheResultsToFile("./parameter-combination.json", JSON.stringify(DATA));
}

function writeToResult({ id, name }, user, real, sys) {
  results[id].usr = user;
  results[id].real = real;
  results[id].sys = sys;
}

/**
 * Writing data to a file
 * @param path
 * @param data
 */
function writeTheResultsToFile(
  path = "./results.json",
  data = JSON.stringify(results)
) {
  try {
    fs.writeFileSync(path, data);
  } catch (e) {
    console.log("Error creation file in the location", path, e);
  }
}

module.exports = {
  createInitialJSON,
  writeToResult,
  writeTheResultsToFile
};

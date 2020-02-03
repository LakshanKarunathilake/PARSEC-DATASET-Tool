const fs = require("fs");

const applications = ["ferret", "dedup"];
const compilers = {
  ferret: ["gcc", "gcc-pthreads", "gcc-tbb"],
  dedup: ["gcc", "gcc-pthreads"]
};
const inputSets = ["test", "simdev"];
// const inputSets = [
//   "test",
//   "simdev",
//   "simsmall",
//   "simmedium",
//   "simlarge",
//   "native"
// ];
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
          }
        } else {
          for (let threads = 1; threads <= 2; threads++) {
            for (let i = 1; i <= 1; i = i + 1) {
              record.threads = threads;
              record.cores = i;
            }
          }
        }
        record.id = row_index++;
        DATA[record.id] = { ...record };
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

function writeToResultJSONOutput({ id, name }, user, real, sys) {
  if (!results) {
    results = { ...DATA };
  }
  results[id].user = user.replace("\t", "");
  results[id].real = real.replace("\t", "");
  results[id].sys = sys.replace("\t", "");
  if (id === Object.keys(DATA).length) {
    return new Promise((resolve, reject) => {
      fs.writeFile("./results.json", JSON.stringify(results), err => {
        if (err) {
          console.log("error occured", err);
          reject("Failure in writing the file");
        }
        console.log("Parameter combinations are generated successfully");
        resolve("Done");
      });
    });
  }
}

module.exports = { createInitialJSON, writeToResultJSONOutput };

const Client = require("kubernetes-client").Client;
const fs = require("fs");
const { exec } = require("child_process");
const { writeTheResultsToFile, writeToResult } = require("./JSONHandler");
let combinations;

/**
 * Reading from the csv file that includes the combinations of the
 */
async function traversInParameterCombination() {
  // Reading from the csv file
  fs.readFile("parameter-combination.json", async (err, data) => {
    if (err) {
      console.log("Error reading json file", err);
    }
    combinations = JSON.parse(data);

    let iteration = 1;
    let promises = [];
    let resolvedCombinations = [];

    for (const combination of Object.values(combinations)) {
      console.log("combination", combination);
      try {
        promises.push(createTask(combination));
        resolvedCombinations.push(combination);
        if (promises.length === 50) {
          await Promise.all(promises);
          startReadingJobs(resolvedCombinations);
          resolvedCombinations = [];
          promises = [];
        }
        if (Object.keys(combinations).length === iteration) {
          console.log("===========================================");
          console.log("Combinations finished");
          console.log("===========================================");
        }
        iteration++;
      } catch (e) {
        console.log("Error occured while task creation", e);
        return;
      }
    }
  });
}

function createTask({ name, input, compiler, threads, cores, id }) {
  const job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: `${name}-${id}`
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: "parsec",
              image: "spirals/parsec-3.0",
              command: [
                "./run",
                "-S",
                "parsec",
                "-a",
                "run",
                "-p",
                name,
                "-c",
                compiler,
                "-i",
                input,
                "-t",
                `${threads}`
              ],
              resources: {
                limits: {
                  cpu: cores
                },
                requests: {
                  cpu: cores
                }
              }
            }
          ],
          restartPolicy: "Never"
        }
      },
      backoffLimit: 0
    }
  };
  const client = new Client({ version: "1.9" });
  return client.apis.batch.v1.namespaces("default").jobs.post({ body: job });
}

function startReadingJobs(resolovedCombinations) {
  let unCompletedCombinations = [];
  let pendingCombinations = resolovedCombinations;
  do {
    for (const combination of pendingCombinations) {
      getLogsOfJob(combination.name, combination.id)
        .then(data => {
          return readProcessingTimes(combination, data);
        })
        .catch(e => {
          console.log("Error in reading jobs", e);
          if (!e) {
            unCompletedCombinations.push(combinations[combination.id]);
          }
        })
        .finally(() => {
          if (combination.id === pendingCombinations.length) {
            console.log("===========================================");
            console.log("One round finished");
            console.log("===========================================");
            pendingCombinations = unCompletedCombinations;
            unCompletedCombinations = [];
          }
        });
    }
  } while (pendingCombinations.length > 0);
  console.log("===========================================");
  console.log("Finished reading logs");
  console.log("===========================================");
}

async function getLogsOfJob(name, id) {
  const client = new Client({ version: "1.9" });
  client.apis.batch.v1
    .namespaces("default")
    .jobs(`${name}-${id}`)
    .status.get()
    .then(response => {
      return new Promise((resolve, reject) => {
        if (response.body.status.completionTime) {
          exec(`kubectl logs jobs/${name}-${id}`, (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              reject(error);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            resolve(stdout);
            // console.log(`stdout: ${stdout}`);
          });
        } else {
          reject(false);
        }
      });
    });
}

function readProcessingTimes(combination, log) {
  const { name, id } = combination;
  const userVal = log
    .substr(log.indexOf("user"), 15)
    .substr(4, 9)
    .replace("\t", "");
  const sysVal = log
    .substr(log.indexOf("sys"), 15)
    .substr(4, 8)
    .replace("\t", "");
  const realVal = log
    .substr(log.indexOf("real"), 15)
    .substr(4, 9)
    .replace("\t", "");
  const client = new Client({ version: "1.9" });
  try {
    client.apis.batch.v1
      .namespaces("default")
      .jobs(`${name}-${id}`)
      .delete();
    console.log(id, "userValue", userVal, "sysVal", sysVal, "realVal", realVal);
    writeToResult(combination, userVal, realVal, sysVal);
  } catch (e) {
    console.log("Error occured in writing output and deletion");
  }
}
async function reRunErrorfullCombinations() {
  // Reading from the csv file
  fs.readFile("results.json", async (err, data) => {
    if (err) {
      console.log("Error reading json file", err);
    }
    combinations = JSON.parse(data);

    let iteration = 0;
    let promises = [];
    let resolvedPromises = [];
    const emptyCombinations = Object.values(combinations).filter(
      combination => combination.real === 0 && combination.real === ""
    );
    for (const combination of emptyCombinations) {
      console.log("creating job", combination.id);
      try {
        promises.push(createTask(combination));
        resolvedPromises.push(combination);
        if (
          promises.length === 50 ||
          emptyCombinations.length - iteration < 50
        ) {
          console.log("+=============== Resolveing promises");
          await Promise.all(promises);
          console.log("=================Resolved Promises");
          await startReadingJobs(resolvedPromises, true);
          writeTheResultsToFile();
          promises = [];
          resolvedPromises = [];
        }
        iteration++;
      } catch (e) {
        console.log("Error occured while task creation", e);
        writeTheResultsToFile();
      }
    }
    console.log("===========================================");
    console.log("Combinations finished");
    console.log("===========================================");
    writeTheResultsToFile();

    //  Re run combinations if there are still pending combinations
    await checkIfEmptyRecordsExist();
  });
}

async function checkIfEmptyRecordsExist() {
  const data = fs.readFileSync("results.json");
  const emptyCombinations = Object.values(data).filter(
    combination => combination.real === 0 && combination.real === ""
  );
  if (emptyCombinations.length > 0) {
    await reRunErrorfullCombinations();
  } else {
    console.log("Empty combinations can not be found");
  }
}

module.exports = {
  traversInParameterCombination
};

const Client = require("kubernetes-client").Client;
const fs = require("fs");
const { exec } = require("child_process");
const { writeToResult, writeTheResultsToFile } = require("./JSONHandler");
let combinations;
let unCompletedCombinations = [];
let combinationsFinished = false;

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
    let resolvedPromises = [];
    for (const combination of Object.values(combinations)) {
      console.log("creating job", combination.id);
      try {
        promises.push(createTask(combination));
        resolvedPromises.push(combination);
        if (promises.length === 100) {
          console.log("+=============== Resolveing promises");
          await Promise.all(promises);
          console.log("=================Resolved Promises");
          await startReadingJobs(resolvedPromises);
          promises = [];
          resolvedPromises = [];
        }
        if (Object.keys(combinations).length === iteration) {
          console.log("===========================================");
          console.log("Combinations finished");
          console.log("===========================================");
          writeTheResultsToFile();
        }
        iteration++;
      } catch (e) {
        console.log("Error occured while task creation", e);
        writeTheResultsToFile();
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
      backoffLimit: 2
    }
  };
  const client = new Client({ version: "1.9" });
  return client.apis.batch.v1.namespaces("default").jobs.post({ body: job });
}

async function startReadingJobs(resolvedPromises) {
  let pendingCombinations = resolvedPromises.concat(unCompletedCombinations);
  let iteration = 1;
  do {
    let promises = [];
    let unresolvedPromises = [];
    let index = 1;
    for (const combination of pendingCombinations) {
      promises.push(getLogsOfJob(combination));
      if (index === pendingCombinations.length) {
        console.log("===========================================");
        console.log(
          `${iteration} round finished,promises count ${promises.length}`
        );
        console.log("===========================================");
        try {
          const results = await Promise.all(
            promises.map(p =>
              p.catch(e => {
                return e;
              })
            )
          );
          unresolvedPromises = results
            .filter(row => row.state === "error")
            .map(row => row.data);
        } catch (e) {
          console.log("Error occured in inner round", e);
        }
      }
      index++;
    }
    pendingCombinations = unresolvedPromises;
    iteration++;
  } while (pendingCombinations.length > 50 || combinationsFinished);
  unCompletedCombinations = pendingCombinations;
  console.log("===========================================");
  console.log("Finished reading logs");
  console.log("Still Pending logs of : ", unCompletedCombinations.length);
  console.log("===========================================");
}

async function getLogsOfJob(combination) {
  const { id, name } = combination;
  const client = new Client({ version: "1.9" });
  const response = await client.apis.batch.v1
    .namespaces("default")
    .jobs(`${name}-${id}`)
    .status.get();
  return new Promise((resolve, reject) => {
    if (response.body.status.completionTime) {
      exec(`kubectl logs jobs/${name}-${id}`, async (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          resolve({ state: "error", data: combination });
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          resolve({ state: "error", data: combination });
          return;
        }
        readProcessingTimes(combination, stdout);
        resolve({ state: "success", data: combination });
      });
    } else {
      resolve({ state: "error", data: combination });
    }
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

module.exports = {
  traversInParameterCombination
};

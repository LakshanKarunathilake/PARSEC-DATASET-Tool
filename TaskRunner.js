const Client = require("kubernetes-client").Client;
const fs = require("fs");
const { exec } = require("child_process");
let combinations;
let unCompletedCombinations = [];

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
    unCompletedCombinations = Object.keys(combinations);

    let iteration = 1;
    for (const combination of Object.values(combinations)) {
      console.log("combination", combination);
      try {
        await createTask(combination);
        if (Object.keys(combinations).length === iteration) {
          console.log("===========================================");
          console.log("Combinations finished");
          console.log("===========================================");
          await startReadingJobs();
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
  // await client.api.v1.namespaces.post({body:'parsec'})
  return client.apis.batch.v1.namespaces("default").jobs.post({ body: job });
}

async function startReadingJobs() {
  let pendingCombinations = Object.values(combinations);
  do {
    for (const combination of pendingCombinations) {
      try {
        const data = await getLogsOfJob(combination.name, combination.id);
        readProcessingTimes(data);
      } catch (e) {
        console.log("Error in reading jobs", e);
        if (!e) {
          unCompletedCombinations.push(combinations[combination.id]);
        }
      } finally {
        if (combination.id === pendingCombinations.length) {
          console.log("===========================================");
          console.log("One round finished");
          console.log("===========================================");
          pendingCombinations = unCompletedCombinations;
          unCompletedCombinations = [];
        }
      }
    }
  } while (pendingCombinations.length > 0);
}

async function getLogsOfJob(name, id) {
  const client = new Client({ version: "1.9" });
  const response = await client.apis.batch.v1
    .namespaces("default")
    .jobs(`${name}-${id}`)
    .status.get();
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
}

function readProcessingTimes(log) {
  console.log("type", typeof log);
  const indexOfUserParam = log.indexOf("user");
  const indexOfSysParam = log.indexOf("sys");
  const indexOfRealParam = log.indexOf("real");
  console.log("userValue", log.substr(indexOfUserParam, 15));
  console.log("sysValue", log.substr(indexOfSysParam, 15));
  console.log("realValue", log.substr(indexOfRealParam, 15));
}

module.exports = {
  traversInParameterCombination
};

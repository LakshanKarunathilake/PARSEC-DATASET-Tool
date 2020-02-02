const Client = require("kubernetes-client").Client;
const fs = require("fs");
const { exec } = require("child_process");
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
    await startReadingJobs();

    // let iteration = 1;
    // for (const combination of Object.values(combinations)) {
    //   console.log("combination", combination);
    //   try {
    //     await createTask(combination);
    //     if (Object.keys(combinations).length === iteration) {
    //       console.log("Combinations finished");
    //     }
    //     iteration++;
    //   } catch (e) {
    //     console.log("Error occured while task creation", e);
    //     return;
    //   }
    // }
  });
}

function createTask({ name, input, compiler, threads, cores, id }) {
  const job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: `job-${id}`
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

async function getStatusOfJob() {
  const client = new Client({ version: "1.9" });
  const jobCreation = await client.apis.batch.v1
    .namespaces("parsec")
    .jobs("example-job")
    .status.get();
  console.log("status", jobCreation);
}

async function startReadingJobs() {
  for (const combination of Object.values(combinations)) {
    const data = await getLogsOfJob(combination.id);
    console.log("data", data);
  }
}

async function getLogsOfJob(id) {
  const client = new Client({ version: "1.9" });
  const response = await client.apis.batch.v1
    .namespaces("default")
    .jobs(`job-${id}`)
    .status.get();
  if (response.body.status.completionTime) {
    return new Promise((resolve, reject) => {
      exec(`kubectl logs jobs/job-${id}`, (error, stdout, stderr) => {
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
        console.log(`stdout: ${stdout}`);
      });
    });
  }
}

module.exports = {
  traversInParameterCombination
};

const Client = require("kubernetes-client").Client;
const fs = require("fs");
const { exec } = require("child_process");

/**
 * Reading from the csv file that includes the combinations of the
 */
async function traversInParameterCombination() {
  // Reading from the csv file
  // fs.readFile("parameter-combination.json", (err, data) => {
  //   if (err) {
  //     console.log("Error reading json file", err);
  //   }
  //   let combinations = JSON.parse(data);
  //   Object.values(combinations).forEach(combination => {
  const combination = {
        "id": 1,
        "name": "ferret",
        "input": "test",
        "compiler": "gcc",
        "threads": 1,
        "real": 0,
        "usr": 0,
        "sys": 0,
        "cores": 1
      };
      createTask(combination)
        .then(() => {
          console.log("Done");
          // getLogsOfJob(combination.id);
        })
        .catch(err => {
          console.log("Error in Job Creating", err);
        });
//     });
//   });
}

async function createTask({ name, input, compiler, threads, cores, id }) {
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
              // command: [
              //   "-S",
              //   "parsec",
              //   "-a",
              //   "run",
              //   "-p",
              //   "dedup",
              //   "-c",
              //   "gcc-pthreads",
              //   "-i",
              //   "native",
              //   "-t",
              //   "1"
              // ],
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
      backoffLimit: 1
    }
  };
  console.log("job", job);
  const client = new Client({ version: "1.9" });
  // await client.api.v1.namespaces.post({body:'parsec'})
  await client.apis.batch.v1.namespaces("default").jobs.post({ body: job });
}

async function getStatusOfJob() {
  const client = new Client({ version: "1.9" });
  const jobCreation = await client.apis.batch.v1
    .namespaces("parsec")
    .jobs("example-job")
    .status.get();
  console.log("status", jobCreation);
}

function getLogsOfJob(id) {
  const client = new Client({ version: "1.9" });
  client.apis.batch.v1
    .namespaces("default")
    .jobs(`job-${id}`)
    .status.get()
    .then(data => {
      console.log("status", data);
      exec(`kubectl logs jobs/job-${id}`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    });
}

module.exports = {
  traversInParameterCombination
};

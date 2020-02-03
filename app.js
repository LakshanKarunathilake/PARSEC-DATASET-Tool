const { createInitialJSON } = require("./JSONHandler");
const { traversInParameterCombination } = require("./TaskRunner");
const { exec } = require("child_process");

const command1 =
  "gcloud container clusters get-credentials parsec-runner --zone us-central1-a --project pipeline-concurrency ";
const command2 = "kubectl cluster-info";

runCommand(command1)
  .then(() => {
    return runCommand(command2);
  })
  .then(() => {
    createInitialJSON();
  })
  .then(value => {
    traversInParameterCombination();
  });

setInterval(() => {
  runCommand(command1, runCommand(command2)).then(async () => {
  });
}, 60000);

async function runCommand(command, callback) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(stderr);
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  }, callback);
}

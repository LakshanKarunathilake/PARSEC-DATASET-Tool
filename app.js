const { createInitialJSON, writeTheResultsToFile } = require("./JSONHandler");
const { traversInParameterCombination } = require("./TaskRunner");
const { execSync } = require("child_process");
const keyFile = require("./pipeline-concurrency");
const config = require("./Config");

const command0 = `gcloud auth activate-service-account ${keyFile.client_email}  --key-file=./pipeline-concurrency.json --project=${config.projectName}`;

const command1 = `gcloud container clusters get-credentials parsec-runner --zone us-central1-a --project=${config.projectName} `;
const command2 = "kubectl cluster-info";

runCommand()
  .then(() => {
    createInitialJSON();
  })
  .then(() => {
    traversInParameterCombination();
  });

setInterval(async () => {
  await runCommand();
}, 60000);
// }, 3000000);

async function runCommand() {
  return new Promise((resolve, reject) => {
    try {
      const d0 = execSync(command0).toString();
      console.log("run1", d0);
      const d1 = execSync(command1).toString();
      console.log("run2", d1);
      const d2 = execSync(command2).toString();
      console.log("run3", d2);
      resolve();
    } catch (e) {
      console.log("error", e);
      reject(e);
    }
  });
}

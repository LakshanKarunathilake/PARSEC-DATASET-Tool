const { createInitialJSON } = require("./JSONHandler");
const { traversInParameterCombination } = require("./TaskRunner");
const { execSync } = require("child_process");

const command1 =
  "gcloud container clusters get-credentials parsec-runner --zone us-central1-a --project pipeline-concurrency ";
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
}, 600000);

async function runCommand() {
  return new Promise((resolve, reject) => {
    try {
      console.log("run1");
      const d1 = execSync(command1).toString();
      console.log("run2",d1);
      const d2 = execSync(command2).toString();
      console.log("run3",d2);
      resolve();
    } catch (e) {
      console.log("error", e);
      reject(e);
    }
  });
}

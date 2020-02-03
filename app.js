const { createInitialJSON } = require("./JSONHandler");
const { traversInParameterCombination } = require("./TaskRunner");
const { exec } = require("child_process");

createInitialJSON().then(() => {
  traversInParameterCombination();
});

setInterval(() => {
  exec("kubectl cluster-info", (error, stdout, stderr) => {
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
}, 60000);

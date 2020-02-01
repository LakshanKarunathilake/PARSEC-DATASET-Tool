const Client = require("kubernetes-client").Client;
const fs = require('fs');

/**
 * Reading from the csv file that includes the combinations of the
 */
function traversInParameterCombination() {

    // Reading from the csv file
    fs.readFile('parameter-combination.json', (err, data) => {
        if (err) {
            console.log('Error reading json file', err)
        }
        ;
        let combinations = JSON.parse(data);
        Object.values(combinations).forEach( async combination  => {
            await createTask(combination);
        });
    });
}

async function createTask({name, input, compiler, threads, cores}) {
    const job = {
        "apiVersion": "batch/v1",
        "kind": "Job",
        "metadata": {
            "name": `${name}-${compiler}-${input}-${cores}-${threads}`
        },
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {
                            "name": "parsec-3-0",
                            "image": "spirals/parsec-3.0",
                            "resources": {
                                "limits": {
                                    "cpu": cores
                                }
                            },
                            "imagePullPolicy": "IfNotPresent",
                            "command": [
                                "-a", "run", "-p", name, "-c", compiler, "-i", input, "-t", threads
                            ]
                        }
                    ],
                    "restartPolicy": "Never"
                }
            },
            "backoffLimit": 2
        }
    }

    const client = new Client({ version: "1.13" });
    // await client.api.v1.namespaces.post({body:'parsec'})
    const jobCreation = await client.apis.batch.v1
      .namespaces("default")
      .jobs.post({ body: job });
  console.log('jobcreation',jobCreation)
}

async function getStatusOfJob() {
    const client = new Client({version: "1.9"});
    const jobCreation = await client.apis.batch.v1
        .namespaces("parsec")
        .jobs("example-job")
        .status.get();
    console.log("status", jobCreation);
}

module.exports = {
    traversInParameterCombination
}

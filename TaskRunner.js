const Client = require("kubernetes-client").Client;

async function main() {
  try {
    const client = new Client({ version: "1.9" });

    //
    // Get all the Namespaces.
    //
    const namespaces = await client.api.v1.pods.get();
    console.log("Namespaces: ", namespaces);
  } catch (err) {
    console.error("Error: ", err);
  }
}

// main();

async function createTask() {
  const job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: "example-job"
    },
    spec: {
      template: {
        metadata: {
          name: "example-job"
        },
        spec: {
          containers: [
            {
              name: "pi",
              image: "perl",
              command: ["perl"],
              args: ["-Mbignum=bpi", "-wle", "print bpi(2000)"]
            }
          ],
          restartPolicy: "Never"
        }
      }
    }
  };

  const client = new Client({ version: "1.9" });
  const jobCreation = await client.apis.batch.v1
    .namespaces("parsec")
    .jobs.post({ body: job });
  console.log("done");
  console.log("job", jobCreation);
}

async function getStatusOfJob() {
  const client = new Client({ version: "1.9" });
  const jobCreation = await client.apis.batch.v1
    .namespaces("parsec")
    .jobs("example-job")
    .status.get();
  console.log("status", jobCreation);
}

// createTask()
getStatusOfJob();

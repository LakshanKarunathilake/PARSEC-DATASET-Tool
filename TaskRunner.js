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

main();

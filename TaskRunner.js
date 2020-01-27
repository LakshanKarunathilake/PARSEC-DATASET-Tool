const { KubeConfig, Client } = require("kubernetes-client");
const kubeconfig = new KubeConfig();
const Request = require("kubernetes-client/backends/request");

// Should match the kubeconfig file format exactly
const config = {
  apiVersion: "v1",
  clusters: [
    {
      cluster: {
        "certificate-authority-data": "DATA+OMITTED",
        server: "https://35.188.149.198"
      },
      name: "gke_pipeline-concurrency_us-central1-a_parsec-runner"
    },
    {
      cluster: {
        "certificate-authority-data": "DATA+OMITTED",
        server: "https://104.197.179.49"
      },
      name: "gke_pipeline-concurrency_us-central1-a_test"
    }
  ],
  contexts: [
    {
      context: {
        cluster: "gke_pipeline-concurrency_us-central1-a_parsec-runner",
        user: "gke_pipeline-concurrency_us-central1-a_parsec-runner"
      },
      name: "gke_pipeline-concurrency_us-central1-a_parsec-runner"
    },
    {
      context: {
        cluster: "gke_pipeline-concurrency_us-central1-a_test",
        user: "gke_pipeline-concurrency_us-central1-a_test"
      },
      name: "gke_pipeline-concurrency_us-central1-a_test"
    }
  ],
  "current-context": "gke_pipeline-concurrency_us-central1-a_parsec-runner",
  kind: "Config",
  preferences: {},
  users: [
    {
      name: "gke_pipeline-concurrency_us-central1-a_parsec-runner",
      user: {
        "auth-provider": {
          config: {
            "cmd-args": "config config-helper --format=json",
            "cmd-path":
              "C:\\Users\\lakshan\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
            "expiry-key": "{.credential.token_expiry}",
            "token-key": "{.credential.access_token}"
          },
          name: "gcp"
        }
      }
    },
    {
      name: "gke_pipeline-concurrency_us-central1-a_test",
      user: {
        "auth-provider": {
          config: {
            "access-token":
              "ya29.Ima7B7KdCqHHOoRf9IQ4FdfiWUXArptUqasVrm44IlvfXCV_gPGbPhFeWAS_mviPilqN9BaHf88-lAV-8YFl4ZeWkDFCem0uILQnZLrdw3HZiwye3V_CXxT0Rh025Do_bOCfcjFWAxg",
            "cmd-args": "config config-helper --format=json",
            "cmd-path":
              "C:\\Users\\lakshan\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
            expiry: "2020-01-27T18:47:36Z",
            "expiry-key": "{.credential.token_expiry}",
            "token-key": "{.credential.access_token}"
          },
          name: "gcp"
        }
      }
    }
  ]
};

async function getNamespaces() {
  kubeconfig.loadFromString(JSON.stringify(config));
  const backend = new Request({ kubeconfig });
  const client = new Client({ backend, version: "1.13" });
  const namespaces = await client.api.v1.namespaces.get();
  console.log("Namespaces: ", namespaces);
}

module.exports = { getNamespaces };

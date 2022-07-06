import { describe, it, watchPath, list, create, V1Deployment, V1ReplicaSet, V1Pod, sleep } from "../test-env-framework/api";

describe("Deployment", () => {
  it("automatically create a ReplicaSet when a Deployment is created", async () => {
    await watchPath('/apis/apps/v1/deployments', async (phase: string, apiObj: V1Deployment, watchObj?: any) => {
      console.log('Deployment is updated:', phase, apiObj, watchObj);

      if (!apiObj.metadata?.namespace || !apiObj.metadata?.name) {
        return;
      }

      // const replicaSet = await list('apps/v1', 'ReplicaSet', apiObj.metadata.namespace);

      // Create new replicaset
      const newReplicaSet: V1ReplicaSet = {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        metadata: {
          namespace: apiObj.metadata.namespace,
          generateName: apiObj.metadata.name + '-',
          ownerReferences: apiObj.apiVersion && apiObj.kind && apiObj.metadata.uid ? [{
            apiVersion: apiObj.apiVersion,
            kind: apiObj.kind,
            name: apiObj.metadata.name,
            uid: apiObj.metadata.uid,
          }] : [],
          labels: {
            app: apiObj.metadata.name,
            deployment: apiObj.metadata.name,
          },
        },
        spec: {
          replicas: apiObj.spec?.replicas || 1,
          selector: apiObj.spec?.selector!,
          template: apiObj.spec?.template,
        },
      }

      await sleep(5000);
      await create(newReplicaSet)
    });
  });
});

describe("ReplicaSet", () => {
  it("automatically create a Pod when a ReplicaSet is created", async () => {
    await watchPath('/apis/apps/v1/replicasets', async (phase: string, apiObj: V1ReplicaSet, watchObj?: any) => {
      console.log('ReplicaSet is updated:', phase, apiObj, watchObj);

      if (!apiObj.metadata?.namespace || !apiObj.metadata?.name) {
        return;
      }

      const expectedReplicas = apiObj.spec?.replicas || 1;

      // const pods = await list('v1', 'Pod', apiObj.metadata.namespace);

      // Create new pods
      for (let i = 0; i < expectedReplicas; i++) {
        const newPod: V1Pod = {
          apiVersion: 'v1',
          kind: 'Pod',
          metadata: {
            ...apiObj.spec?.template?.metadata,
            namespace: apiObj.metadata.namespace,
            generateName: apiObj.metadata.name + '-',
            ownerReferences: apiObj.apiVersion && apiObj.kind && apiObj.metadata.uid ? [{
              apiVersion: apiObj.apiVersion,
              kind: apiObj.kind,
              name: apiObj.metadata.name,
              uid: apiObj.metadata.uid,
            }] : [],
          },
          spec: apiObj.spec?.template?.spec!,
          // TODO: Update this after a second...
          status: {
            phase: 'Running',
          },
        }

        await sleep(2000);
        await create(newPod);
      }
    });
  });
});

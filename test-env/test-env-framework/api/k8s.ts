import {
  ApiType,
  CoreV1Api,
  KubeConfig,
  KubernetesObject,
  KubernetesObjectApi,
  Watch,
} from "@kubernetes/client-node";

export * from "@kubernetes/client-node";

let sharedKubeConfig: KubeConfig;

export const createKubeConfig = (apiServer: string) => {
  const kc = new KubeConfig();
  kc.addCluster({
    name: "test-env-cluster",
    server: apiServer,
    skipTLSVerify: true,
  });
  kc.addContext({
    name: "test-env-context",
    cluster: "test-env-cluster",
    user: "",
  });
  kc.setCurrentContext("test-env-context");
  return kc;
};

export const setupSharedKubeConfig = (apiServer: string) => {
  sharedKubeConfig = createKubeConfig(apiServer);
};

export const getSharedKubeConfig = () => {
  if (!sharedKubeConfig) {
    throw new Error(
      "Shared KubeConfig is not configured yet. Please call setupSharedKubeConfig first."
    );
  }
  return sharedKubeConfig;
};

export const getObjectApi = () =>
  KubernetesObjectApi.makeApiClient(getSharedKubeConfig());

export const create = (resource: KubernetesObject) =>
  getObjectApi().create(resource);

export const list = (apiVersion: string, kind: string, namespace?: string) =>
  getObjectApi().list(apiVersion, kind, namespace);

export const getWatcher = () => new Watch(getSharedKubeConfig());

type ApiConstructor<T extends ApiType> = new (server: string) => T;

export const getAPI = <T extends ApiType>(apiClientType: ApiConstructor<T>) =>
  getSharedKubeConfig().makeApiClient(apiClientType);

export const watchPath = async (
  path: string,
  callback: (phase: string, apiObj: any, watchObj?: any) => void | Promise<void>,
) => {
  const result = await getWatcher().watch(
    path,
    {},
    async (phase: string, apiObj: any, watchObj?: any) => {
      if (phase === 'ADDED') {
        console.log('new object:');
      } else if (phase === 'MODIFIED') {
        console.log('changed object:');
      } else if (phase === 'DELETED') {
        console.log('deleted object:');
      } else if (phase === 'BOOKMARK') {
        console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
      } else {
        console.log('unknown phase: ' + phase);
      }
      await callback(phase, apiObj, watchObj);
    },
    (err) => {
      // tslint:disable-next-line:no-console
      console.log(err);
    }
  );
}

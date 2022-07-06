import { KubeConfig, CoreV1Api, Watch } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.addCluster({
  name: 'test-env-cluster',
  server: 'https://127.0.0.1:37277',
  skipTLSVerify: true,
});

kc.addContext({
  name: 'test-env-context',
  cluster: 'test-env-cluster',
  user: '',
});

kc.setCurrentContext('test-env-context');

const apiClient = kc.makeApiClient(CoreV1Api);

apiClient.listNamespace().then((res) => {
  const namespaces = res.body.items.map(v1Namespace => v1Namespace.metadata.name);
  console.log(namespaces);

    const watcher = new Watch(kc);
    watcher.watch('/api/v1/pods',
        // optional query parameters can go here.
        {
            allowWatchBookmarks: true,
        },
        // callback is called for each received object.
        (type, apiObj, watchObj) => {
            if (type === 'ADDED') {
                console.log('new object:');
            } else if (type === 'MODIFIED') {
                console.log('changed object:');
            } else if (type === 'DELETED') {
                console.log('deleted object:');
            } else if (type === 'BOOKMARK') {
                console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
            } else {
                console.log('unknown type: ' + type);
            }
            console.log(apiObj);
        },
        // done callback is called if the watch terminates normally
        (err) => {
            // tslint:disable-next-line:no-console
            console.log(err);
        })
    .then((req) => {
        // watch returns a request object which you can use to abort the watch.
        setTimeout(() => { req.abort(); }, 30 * 1000);
    });

});

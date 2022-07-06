
describe('LoadTest 1', () => {
  it('should automatically create 1000 deployments', () => {
  
    for (let index = 0; index < 1000; index++) {
      createResource({
        kind: 'Deployment',
        metadata: {
          name: `d-${index}`,
        },
        spec: {
          replicas: 3,
        },
      })
    }
  });
});

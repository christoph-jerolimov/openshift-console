
describe('LoadTest 1', () => {
    it('should automatically create 100 deployments', () => {
  
      for (let index = 0; index < 100; index++) {
        createResource({
            kind: 'Deployment',
            metadata: {
                name: `d-${index}`,
            }
        })
      }
  
    });
  });
  
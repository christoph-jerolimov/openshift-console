import * as React from 'react';
import { DualListSelector } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  getGroupVersionKindForModel,
  K8sResourceCommon,
  ResourceIcon,
} from '@console/dynamic-plugin-sdk/src/lib-core';
import { useK8sWatchResource } from '@console/dynamic-plugin-sdk/src/utils/k8s/hooks/useK8sWatchResource';
import { ClusterRoleModel } from '@console/internal/models';

const ProjectAccessRolesConfiguration: React.FC = () => {
  const { t } = useTranslation();

  const [allClusterRoles, allClusterRolesLoaded /* allClusterRolesError */] = useK8sWatchResource<
    K8sResourceCommon[]
  >({
    groupVersionKind: getGroupVersionKindForModel(ClusterRoleModel),
    isList: true,
  });

  const [availableOptions, setAvailableOptions] = React.useState<React.ReactNode[]>([]);
  const [chosenOptions, setChosenOptions] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    if (allClusterRolesLoaded && Array.isArray(allClusterRoles)) {
      setAvailableOptions(
        allClusterRoles.map((clusterRole) => {
          const displayName =
            clusterRole.metadata.annotations?.['console.openshift.io/display-name'];

          return (
            <div key={clusterRole.metadata.name} style={{ display: 'flex', alignItems: 'center' }}>
              <ResourceIcon groupVersionKind={getGroupVersionKindForModel(ClusterRoleModel)} />
              <div>
                <div>{displayName || clusterRole.metadata.name}</div>
              </div>
            </div>
          );
        }),
      );
    }
  }, [allClusterRoles, allClusterRolesLoaded]);

  const onListChange = (
    newAvailableOptions: React.ReactNode[],
    newChosenOptions: React.ReactNode[],
  ) => {
    setAvailableOptions(newAvailableOptions);
    setChosenOptions(newChosenOptions);
  };

  return (
    <DualListSelector
      availableOptionsTitle={t('devconsole~Available Cluster Roles')}
      chosenOptionsTitle={t('devconsole~Chosen Cluster Roles')}
      isSearchable
      availableOptions={availableOptions}
      chosenOptions={chosenOptions}
      onListChange={onListChange}
    />
  );
};

export default ProjectAccessRolesConfiguration;

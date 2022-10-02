import * as React from 'react';
import { QuickStart } from '@patternfly/quickstarts';
import { DualListSelector } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  getGroupVersionKindForModel,
  ResourceIcon,
} from '@console/dynamic-plugin-sdk/src/lib-core';
import { useK8sWatchResource } from '@console/dynamic-plugin-sdk/src/utils/k8s/hooks/useK8sWatchResource';
import { k8sPatchResource } from '@console/dynamic-plugin-sdk/src/utils/k8s/k8s-resource';
import { ConsoleOperatorConfigModel } from '@console/internal/models';
import { QuickStartModel } from '../../models';
// import useConsoleOperatorConfig from '../cluster-configuration/useConsoleOperatorConfig';

const useAllQuickStarts = () =>
  useK8sWatchResource<QuickStart[]>({
    groupVersionKind: getGroupVersionKindForModel(QuickStartModel),
    isList: true,
  });

// const useDisabledQuickStarts = () => {
//   const [
//     consoleOperatorConfig,
//     consoleOperatorConfigLoaded,
//     consoleOperatorConfigError,
//   ] = useConsoleOperatorConfig();
//   const disabledQuickStarts =
//     consoleOperatorConfig?.spec?.customization?.quickStarts?.disabled || [];
//   return [disabledQuickStarts, consoleOperatorConfigLoaded, consoleOperatorConfigError];
// };

const patch = (disabledQuickStarts: string[]) =>
  k8sPatchResource({
    model: ConsoleOperatorConfigModel,
    resource: {
      metadata: {
        name: 'cluster',
      },
    },
    data: [
      {
        op: 'set',
        path: '/spec/customization/quickStarts/disabled',
        value: disabledQuickStarts,
      },
    ],
  });

const QuickStartConfiguration: React.FC = () => {
  const { t } = useTranslation();

  const [allQuickStarts, allQuickStartsLoaded /* ,allQuickStartsError */] = useAllQuickStarts();
  // const [
  //   disabledQuickStarts,
  //   disabledQuickStartsLoaded,
  //   disabledQuickStartsError,
  // ] = useDisabledQuickStarts();

  const [availableOptions, setAvailableOptions] = React.useState<React.ReactNode[]>([]);
  const [chosenOptions, setChosenOptions] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    if (allQuickStartsLoaded && Array.isArray(allQuickStarts)) {
      setAvailableOptions(
        allQuickStarts.map((quickStart) => (
          <div key={quickStart.metadata.name} style={{ display: 'flex', alignItems: 'center' }}>
            <ResourceIcon groupVersionKind={getGroupVersionKindForModel(QuickStartModel)} />
            <div>
              <div>{quickStart.spec.displayName || quickStart.metadata.name}</div>
              {quickStart.spec.displayName ? <div>{quickStart.metadata.name}</div> : null}
            </div>
          </div>
        )),
      );
    }
  }, [allQuickStarts, allQuickStartsLoaded]);

  const onListChange = (newAvailableOptions: string[], newChosenOptions: string[]) => {
    setAvailableOptions(newAvailableOptions.sort());
    setChosenOptions(newChosenOptions.sort());

    patch(newChosenOptions)
      .then(() => {})
      .catch(() => {});
  };

  return (
    <DualListSelector
      availableOptionsTitle={t('console-app~Enabled Quick starts')}
      chosenOptionsTitle={t('console-app~Disabled Quick starts')}
      isSearchable
      availableOptions={availableOptions}
      chosenOptions={chosenOptions}
      onListChange={onListChange}
    />
  );
};

export default QuickStartConfiguration;

import * as React from 'react';
import { DualListSelector } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { CatalogItemType, isCatalogItemType } from '@console/dynamic-plugin-sdk/src/extensions';
import { useResolvedExtensions } from '@console/dynamic-plugin-sdk/src/lib-core';
import { k8sPatchResource } from '@console/dynamic-plugin-sdk/src/utils/k8s/k8s-resource';
import { ConsoleOperatorConfigModel } from '@console/internal/models';
import { useGetAllDisabledSubCatalogs } from '../../utils/catalog-utils';
// import useConsoleOperatorConfig from '../cluster-configuration/useConsoleOperatorConfig';

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

const CatalogTypesConfiguration: React.FC = () => {
  const { t } = useTranslation();

  const [catalogTypesExtensions, catalogTypesExtensionsLoaded] = useResolvedExtensions<
    CatalogItemType
  >(isCatalogItemType);
  const [disabledSubCatalogs] = useGetAllDisabledSubCatalogs();

  const [availableOptions, setAvailableOptions] = React.useState<React.ReactNode[]>([]);
  const [chosenOptions, setChosenOptions] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    if (catalogTypesExtensionsLoaded && Array.isArray(catalogTypesExtensions)) {
      const disabledExtensions =
        catalogTypesExtensionsLoaded &&
        catalogTypesExtensions?.filter((ex) =>
          disabledSubCatalogs.find((ob) => ex?.properties?.type === ob),
        );
      const enabledExtensions =
        catalogTypesExtensionsLoaded &&
        catalogTypesExtensions?.filter(
          (ex) => !disabledSubCatalogs.find((ob) => ex?.properties?.type === ob),
        );
      setAvailableOptions(enabledExtensions.map((type) => <div>{type.properties.title}</div>));
      setChosenOptions(
        disabledExtensions.map(
          (type) => type.properties.title && <div>{type.properties.title}</div>,
        ),
      );
    }
  }, [
    catalogTypesExtensions,
    catalogTypesExtensionsLoaded,
    window.SERVER_FLAGS.developerCatalogTypes,
  ]);

  const onListChange = (
    newAvailableOptions: React.ReactNode[],
    newChosenOptions: React.ReactNode[],
  ) => {
    setAvailableOptions(newAvailableOptions);
    setChosenOptions(newChosenOptions);

    /*patch(newChosenOptions)
      .then(() => {})
      .catch(() => {});*/
  };

  return (
    <DualListSelector
      availableOptionsTitle={t('devconsole~Enabled Catalog types')}
      chosenOptionsTitle={t('devconsole~Disabled Catalog types')}
      isSearchable
      availableOptions={availableOptions}
      chosenOptions={chosenOptions}
      onListChange={onListChange}
    />
  );
};

export default CatalogTypesConfiguration;

import * as React from 'react';
import { DualListSelector, DualListSelectorTreeItemData } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  AddAction,
  AddActionGroup,
  isAddAction,
  isAddActionGroup,
  useResolvedExtensions,
} from '@console/dynamic-plugin-sdk/src';

const AddPageConfiguration: React.FC = () => {
  const { t } = useTranslation();

  const [allAddActionGroupExtensions, allAddActionGroupsResolved] = useResolvedExtensions<
    AddActionGroup
  >(isAddActionGroup);
  const [allAddActionExtensions, allAddActionsResolved] = useResolvedExtensions<AddAction>(
    isAddAction,
  );

  const [availableOptions, setAvailableOptions] = React.useState<DualListSelectorTreeItemData[]>(
    [],
  );
  const [chosenOptions, setChosenOptions] = React.useState<DualListSelectorTreeItemData[]>([]);

  const loaded = allAddActionGroupsResolved && allAddActionsResolved;

  React.useEffect(() => {
    if (loaded) {
      setAvailableOptions(
        allAddActionExtensions.map<DualListSelectorTreeItemData>((addAction) => {
          // return addAction.properties.label;
          return {
            id: addAction.properties.id,
            text: addAction.properties.label,
            isChecked: true,
          };
        }),
      );
    }
  }, [loaded, allAddActionGroupExtensions, allAddActionExtensions]);

  const onListChange = (
    newAvailableOptions: DualListSelectorTreeItemData[],
    newChosenOptions: DualListSelectorTreeItemData[],
  ) => {
    setAvailableOptions(newAvailableOptions.sort());
    setChosenOptions(newChosenOptions.sort());
  };

  return (
    <DualListSelector
      availableOptionsTitle={t('devconsole~Enabled add page options')}
      chosenOptionsTitle={t('devconsole~Disabled add page options')}
      isSearchable
      availableOptions={availableOptions}
      chosenOptions={chosenOptions}
      onListChange={onListChange}
    />
  );
};

export default AddPageConfiguration;

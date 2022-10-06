import * as React from 'react';
import { DualListSelector, DualListSelectorTreeItemData } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { AddAction, isAddAction, useResolvedExtensions } from '@console/dynamic-plugin-sdk/src';
import './AddCardItem.scss';
import { useAddActionExtensions } from '../../utils/useAddActionExtensions';

const AddPageConfiguration: React.FC = () => {
  const { t } = useTranslation();

  const [allAddActionExtensions, allAddActionsResolved] = useResolvedExtensions<AddAction>(
    isAddAction,
  );
  const [addActionExtensions, addActionExtensionsResolved] = useAddActionExtensions();

  const [availableOptions, setAvailableOptions] = React.useState<React.ReactNode[]>([]);
  const [chosenOptions, setChosenOptions] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    if (addActionExtensionsResolved && allAddActionsResolved) {
      const disabledActions = allAddActionExtensions.filter((addAction) => {
        return !addActionExtensions.find(
          (action) => addAction.properties.id === action.properties.id,
        );
      });
      setAvailableOptions(
        addActionExtensions.map((addAction) => {
          return (
            <div key={addAction.uid} style={{ display: 'flex', alignItems: 'center' }}>
              {typeof addAction.properties.icon === 'string' ? (
                <img
                  className="odc-add-card-item__icon odc-add-card-item__img-icon"
                  src={addAction.properties.icon}
                  alt={addAction.properties.label}
                  aria-hidden="true"
                />
              ) : typeof addAction.properties.icon !== 'string' &&
                React.isValidElement(addAction.properties.icon) ? (
                <span className="odc-add-card-item__icon" aria-hidden="true">
                  {addAction.properties.icon}
                </span>
              ) : null}
              <div>{addAction.properties.label}</div>
            </div>
          );
        }),
      );
      setChosenOptions(
        disabledActions.map((addAction) => {
          return (
            <div key={addAction.uid} style={{ display: 'flex', alignItems: 'center' }}>
              {typeof addAction.properties.icon === 'string' ? (
                <img
                  className="odc-add-card-item__icon odc-add-card-item__img-icon"
                  src={addAction.properties.icon}
                  alt={addAction.properties.label}
                  aria-hidden="true"
                />
              ) : typeof addAction.properties.icon !== 'string' &&
                React.isValidElement(addAction.properties.icon) ? (
                <span className="odc-add-card-item__icon" aria-hidden="true">
                  {addAction.properties.icon}
                </span>
              ) : null}
              <div>{addAction.properties.label}</div>
            </div>
          );
        }),
      );
    }
  }, [addActionExtensionsResolved, addActionExtensions]);

  const onListChange = (
    newAvailableOptions: DualListSelectorTreeItemData[],
    newChosenOptions: DualListSelectorTreeItemData[],
  ) => {
    setAvailableOptions(newAvailableOptions);
    setChosenOptions(newChosenOptions);
  };

  return (
    <DualListSelector
      availableOptionsTitle={t('devconsole~Enabled Add page options')}
      chosenOptionsTitle={t('devconsole~Disabled Add page options')}
      isSearchable
      availableOptions={availableOptions}
      chosenOptions={chosenOptions}
      onListChange={onListChange}
    />
  );
};

export default AddPageConfiguration;

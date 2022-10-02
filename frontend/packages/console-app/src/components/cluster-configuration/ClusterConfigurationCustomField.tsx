import * as React from 'react';
// import { UserPreferenceCustomField as CustomFieldType } from '@console/dynamic-plugin-sdk/src';
import { ClusterConfigurationCustomField } from '@console/dynamic-plugin-sdk/src';
import { ResolvedCodeRefProperties } from '@console/dynamic-plugin-sdk/src/types';
import { ErrorBoundaryInline } from '@console/shared/src/components/error';
import { ResolvedClusterConfigurationItem } from './types';

type ClusterConfigurationCustomFieldProps = {
  item: ResolvedClusterConfigurationItem;
  field: ResolvedCodeRefProperties<ClusterConfigurationCustomField>;
};

const ClusterConfigurationCustomField: React.FC<ClusterConfigurationCustomFieldProps> = ({
  item,
  field,
}) => {
  const CustomComponent = field.component;

  return (
    <ErrorBoundaryInline>
      {CustomComponent ? <CustomComponent {...field.props} readonly={item.readonly} /> : null}
    </ErrorBoundaryInline>
  );
};

export default ClusterConfigurationCustomField;

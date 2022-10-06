import * as React from 'react';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  isPerspective,
  Perspective as PerspectiveExtension,
  AccessReviewResourceAttributes,
} from '@console/dynamic-plugin-sdk/src';
import { LoadedExtension, useExtensions } from '@console/plugin-sdk/src';

export enum PerspectiveVisibilityState {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
  AccessReview = 'AccessReview',
}

type PerspectiveAccessReview = {
  required?: AccessReviewResourceAttributes[];
  missing?: AccessReviewResourceAttributes[];
};

export type PerspectiveVisibility = {
  state: PerspectiveVisibilityState;
  accessReview?: PerspectiveAccessReview;
};

export type Perspective = {
  id: string;
  visibility: PerspectiveVisibility;
};

const PerspectiveConfiguration: React.FC = () => {
  const perspectiveExtensions = useExtensions<PerspectiveExtension>(isPerspective);
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = React.useState<Record<string, string>>(() => {
    let obj: Record<string, string> = {};
    if (!window.SERVER_FLAGS.perspectives) {
      obj = perspectiveExtensions.reduce(
        (acc: Record<string, string>, ex: LoadedExtension<PerspectiveExtension>) => {
          acc[ex.properties.id] = null;
          return acc;
        },
        {},
      );
    } else {
      const perspectives: Perspective[] = JSON.parse(window.SERVER_FLAGS.perspectives);
      obj = perspectiveExtensions.reduce((acc, perspectiveExtension) => {
        const perspective = perspectives?.find((p) => p.id === perspectiveExtension.properties.id);

        if (perspective?.visibility?.state === PerspectiveVisibilityState.Enabled) {
          acc[perspectiveExtension.properties.id] = 'Enabled';
        } else if (perspective?.visibility?.state === PerspectiveVisibilityState.Disabled) {
          acc[perspectiveExtension.properties.id] = 'Disabled';
        } else if (perspective?.visibility?.state === PerspectiveVisibilityState.AccessReview) {
          if (
            perspective.visibility.accessReview?.missing?.length > 0 &&
            perspective.visibility.accessReview.missing.find((ob) => ob.resource === 'namespaces')
          ) {
            acc[perspectiveExtension.properties.id] = 'AccessReviewMissing';
          } else if (
            perspective.visibility.accessReview?.required?.length > 0 &&
            perspective.visibility.accessReview.required.find((ob) => ob.resource === 'namespaces')
          ) {
            acc[perspectiveExtension.properties.id] = 'AccessReviewRequired';
          }
        }
        return acc;
      }, {});
    }
    return obj;
  });

  const handleOnChange = React.useCallback(
    (id: string, value: string) => {
      setIsChecked((oldResults: Record<string, string>) => {
        if (oldResults[id] === value) {
          return oldResults;
        }
        return {
          ...oldResults,
          [id]: value,
        };
      });
    },
    [setIsChecked],
  );
  return (
    <FormGroup fieldId="perspectives" label="Perspectives" data-test="perspectives field">
      <div className="pf-c-form__helper-text">{t('console-app~Show or hide perspective(s).')}</div>
      {perspectiveExtensions.map((ex) => (
        <>
          <h5>{ex.properties.name}</h5>
          <Checkbox
            className="nested"
            label="Enabled"
            name={ex.properties.name}
            id={`${ex.properties.id}-enabled`}
            isChecked={isChecked[ex.properties.id] === 'Enabled'}
            onChange={() => handleOnChange(ex.properties.id, 'Enabled')}
          />
          <Checkbox
            id={`${ex.properties.id}-priviledged`}
            className="nested"
            label="Only visible for privileged users"
            name={ex.properties.name}
            isChecked={isChecked[ex.properties.id] === 'AccessReviewRequired'}
            onChange={() => handleOnChange(ex.properties.id, 'AccessReviewRequired')}
          />
          <Checkbox
            id={`${ex.properties.id}-unpriviledged`}
            className="nested"
            label="Only visible for unprivileged users"
            name={ex.properties.name}
            isChecked={isChecked[ex.properties.id] === 'AccessReviewMissing'}
            onChange={() => handleOnChange(ex.properties.id, 'AccessReviewMissing')}
          />
          <Checkbox
            id={`${ex.properties.id}-disabled`}
            className="nested"
            label="Disabled"
            name={ex.properties.name}
            isChecked={isChecked[ex.properties.id] === 'Disabled'}
            onChange={() => handleOnChange(ex.properties.id, 'Disabled')}
          />
        </>
      ))}
    </FormGroup>
  );
};

export default PerspectiveConfiguration;

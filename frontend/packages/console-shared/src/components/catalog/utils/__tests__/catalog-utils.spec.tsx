import { useResolvedExtensions } from '@console/dynamic-plugin-sdk';
import {
  CatalogItem,
  CatalogItemMetadataProviderFunction,
} from '@console/dynamic-plugin-sdk/src/extensions';
import { HELM_CHART_CATALOG_TYPE_ID } from '@console/helm-plugin/src/const';
import { testHook } from '../../../../../../../__tests__/utils/hooks-utils';
import {
  applyCatalogItemMetadata,
  useGetAllDisabledCatalogTypes,
  isCatalogTypeEnabled,
  useIsDeveloperCatalogEnabled,
} from '../catalog-utils';
import { mockExtensions } from './catalogTypeExtensions.data';

jest.mock('@console/dynamic-plugin-sdk/src/api/useResolvedExtensions', () => ({
  useResolvedExtensions: jest.fn(),
}));

const useResolvedExtensionsMock = useResolvedExtensions as jest.Mock;

describe('catalog-utils#applyCatalogItemMetadata', () => {
  it('should merge metadata with catalog items', () => {
    const catalogItems: CatalogItem[] = [
      {
        uid: '1',
        type: 'type1',
        name: 'Item 1',
      },
      {
        uid: '2',
        type: 'type2',
        name: 'Item 2',
      },

      {
        uid: '3',
        type: 'type1',
        name: 'Item 3',
        attributes: {
          bindable: true,
        },
        tags: ['tag1'],
        badges: [
          {
            text: 'badge1',
          },
        ],
      },
    ];
    const metadataProviderMap: {
      [type: string]: { [id: string]: CatalogItemMetadataProviderFunction };
    } = {
      type1: {
        '@console/dev-console[49]': () => ({
          tags: ['foo', 'bar'],
          attributes: {
            foo: 'bar',
            asdf: 'qwerty',
          },
          badges: [
            {
              text: 'foo',
              color: 'red',
              variant: 'filled',
            },
          ],
        }),
      },
    };

    const result = applyCatalogItemMetadata(catalogItems, metadataProviderMap);

    expect(result[0].tags).toEqual(['foo', 'bar']);
    expect(result[0].attributes).toEqual({
      foo: 'bar',
      asdf: 'qwerty',
    });
    expect(result[0].badges).toEqual([
      {
        text: 'foo',
        color: 'red',
        variant: 'filled',
      },
    ]);
    expect(result[1]).toEqual(catalogItems[1]);
    expect(result[2].tags).toEqual(['tag1', 'foo', 'bar']);
    expect(result[2].attributes).toEqual({
      bindable: true,
      foo: 'bar',
      asdf: 'qwerty',
    });
    expect(result[2].badges).toEqual([
      {
        text: 'badge1',
      },
      {
        text: 'foo',
        color: 'red',
        variant: 'filled',
      },
    ]);
  });
});

describe('isCatalogTypeEnabled', () => {
  beforeEach(() => {
    delete window.SERVER_FLAGS.developerCatalogTypes;
    useResolvedExtensionsMock.mockReturnValue([mockExtensions, true]);
  });

  it('should show HelmChart catalog type as enabled when dev catalog types are not configured', () => {
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as enabled when enabled list is empty', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": [] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as disabled when disabled list is empty', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" , "disabled": [] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(false);
  });
  it('should show HelmChart catalog type as enabled when HelmChart is added in enabled list', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": ["HelmChart"] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as disabled when HelmChart is added in disabled list', () => {
    window.SERVER_FLAGS.developerCatalogTypes =
      '{"state" : "Disabled" , "disabled": ["HelmChart"] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(false);
  });
  it('should show HelmChart catalog type as disabled when HelmChart is not added in enabled list', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": ["Devfile"] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(false);
  });
  it('should show HelmChart catalog type as enabled when HelmChart is not added in disabled list', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" , "disabled": ["Devfile"] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as enabled when HelmChart is added in enabled list along with other sub-catalog', () => {
    window.SERVER_FLAGS.developerCatalogTypes =
      '{"state" : "Enabled" , "enabled": ["Devfile","HelmChart"] }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as enabled when enabled attribute is not added', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(true);
  });
  it('should show HelmChart catalog type as disabled when disabled attribute is not added', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" }';
    const isEnabled = isCatalogTypeEnabled(HELM_CHART_CATALOG_TYPE_ID);
    expect(isEnabled).toBe(false);
  });
});

describe('useIsDeveloperCatalogEnabled', () => {
  beforeEach(() => {
    delete window.SERVER_FLAGS.developerCatalogTypes;
    useResolvedExtensionsMock.mockReturnValue([mockExtensions, true]);
  });

  it('should show developer catalog as enabled when enabled list is empty', () => {
    testHook(() => {
      window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": [] }';
      const isEnabled = useIsDeveloperCatalogEnabled();
      expect(isEnabled).toBe(true);
    });
  });
  it('should show developer catalog as disabled when disabled list is empty', () => {
    testHook(() => {
      window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" , "disabled": [] }';
      const isEnabled = useIsDeveloperCatalogEnabled();
      expect(isEnabled).toBe(false);
    });
  });
  it('should show developer catalog as enabled when enabled list is not empty', () => {
    testHook(() => {
      window.SERVER_FLAGS.developerCatalogTypes =
        '{"state" : "Enabled" , "enabled": ["HelmChart"] }';
      const isEnabled = useIsDeveloperCatalogEnabled();
      expect(isEnabled).toBe(true);
    });
  });
  it('should show developer catalog as disabled when all sub-catalogs are disabled', () => {
    testHook(() => {
      window.SERVER_FLAGS.developerCatalogTypes =
        '{"state" : "Disabled" , "disabled": ["HelmChart","Devfile","EventSource","EventSink","OperatorBackedService","Sample","Template","BuilderImage"]}';
      const isEnabled = useIsDeveloperCatalogEnabled();
      expect(isEnabled).toBe(false);
    });
  });
  it('should show developer catalog as enabled when enabled attribute is not added', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" }';
    const isEnabled = useIsDeveloperCatalogEnabled();
    expect(isEnabled).toBe(true);
  });
  it('should show developer catalog as enabled when enabled attribute is not added', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" }';
    const isEnabled = useIsDeveloperCatalogEnabled();
    expect(isEnabled).toBe(false);
  });
});

describe('useGetAllDisabledCatalogTypes', () => {
  beforeEach(() => {
    delete window.SERVER_FLAGS.developerCatalogTypes;
    useResolvedExtensionsMock.mockReturnValue([mockExtensions, true]);
  });

  it('should return no sub-catalog is disabled when dev catalog types are not configured', () => {
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(0);
    });
  });
  it('should return no sub-catalog is disabled when HelmChart is added in disabled list', () => {
    window.SERVER_FLAGS.developerCatalogTypes =
      '{"state" : "Disabled" , "disabled": ["HelmChart"] }';
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(1);
    });
  });
  it('should return all sub-catalogs are disabled when disabled list is empty', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Disabled" , "disabled": [] }';
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(8);
    });
  });
  it('should return no sub-catalogs are disabled when enabled list is empty', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": [] }';
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(0);
    });
  });
  it('should return five sub-catalogs are disabled when enabled list is having three sub-catalogs', () => {
    window.SERVER_FLAGS.developerCatalogTypes =
      '{"state" : "Enabled" , "enabled": ["Devfile","HelmChart","Sample"] }';
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(5);
    });
  });
  it('should return seven sub-catalogs are disabled when enabled list is having one sub-catalog', () => {
    window.SERVER_FLAGS.developerCatalogTypes = '{"state" : "Enabled" , "enabled": ["Devfile"] }';
    testHook(() => {
      const disabledCatalogTypes = useGetAllDisabledCatalogTypes();
      expect(disabledCatalogTypes.length).toBe(7);
    });
  });
});

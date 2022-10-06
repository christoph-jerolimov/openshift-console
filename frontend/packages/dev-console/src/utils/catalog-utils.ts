import {
  CatalogItemType,
  isCatalogItemType,
  useResolvedExtensions,
} from '@console/dynamic-plugin-sdk';

enum CatalogVisibilityState {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

export const useGetAllDisabledSubCatalogs = () => {
  const [catalogExtensionsArray] = useResolvedExtensions<CatalogItemType>(isCatalogItemType);
  const catalogTypeExtensions = catalogExtensionsArray.map((type) => {
    return type.properties.type;
  });

  if (window.SERVER_FLAGS.developerCatalogTypes) {
    const developerCatalogTypes = JSON.parse(window.SERVER_FLAGS.developerCatalogTypes);
    if (
      developerCatalogTypes?.state === CatalogVisibilityState.Enabled &&
      developerCatalogTypes?.enabled?.length > 0
    ) {
      const disabledSubCatalogs = catalogTypeExtensions.filter(
        (val) => !developerCatalogTypes?.enabled.includes(val),
      );
      return [disabledSubCatalogs, catalogTypeExtensions];
    }
    if (developerCatalogTypes?.state === CatalogVisibilityState.Disabled) {
      if (developerCatalogTypes?.disabled?.length > 0) {
        return [developerCatalogTypes?.disabled, catalogTypeExtensions];
      }
      return [catalogTypeExtensions, catalogTypeExtensions];
    }
  }
  return [[], catalogTypeExtensions];
};

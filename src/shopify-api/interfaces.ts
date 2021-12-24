import { ModuleMetadata, Type } from '@nestjs/common';
import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { SessionStorage } from '@shopify/shopify-api/dist/auth/session';

export interface ShopifyApiOptions {
  apiKey: string;
  apiSecret: string;
  scopes: string[] | AuthScopes;
  apiVersion: ApiVersion;
  hostName: string;
  isEmbeddedApp: boolean;
  sessionStorage?: SessionStorage;
}

export interface ShopifyApiOptionsFactory {
  createShopifyApiOptions(): Promise<ShopifyApiOptions> | ShopifyApiOptions;
}

export interface ShopifyApiAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<ShopifyApiOptionsFactory>;
  useClass?: Type<ShopifyApiOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<ShopifyApiOptions> | ShopifyApiOptions;
  inject?: any[];
}

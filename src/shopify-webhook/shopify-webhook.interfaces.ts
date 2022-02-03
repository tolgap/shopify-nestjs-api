import { ModuleMetadata, Type } from '@nestjs/common';

export interface ShopifyWebhookOptions {
  path: string;
  topics: string[];
  handler: ShopifyWebhookHandler;
}

export interface ShopifyWebhookHandler {
  process: (topic: string, shop_domain: string, body: string) => Promise<void>;
}

export interface ShopifyWebhookAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<ShopifyWebhookOptionsFactory>;
  useClass?: Type<ShopifyWebhookOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<ShopifyWebhookOptions> | ShopifyWebhookOptions;
  inject?: any[];
}

export interface ShopifyWebhookOptionsFactory {
  createShopifyWebhookOptions():
    | Promise<ShopifyWebhookOptions>
    | ShopifyWebhookOptions;
}

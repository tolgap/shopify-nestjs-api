import { Provider } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  SHOPIFY_WEBHOOK_CONTROLLER_PATH_HACK,
  SHOPIFY_WEBHOOK_OPTIONS,
} from './shopify-webhook.constants';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import {
  ShopifyWebhookAsyncOptions,
  ShopifyWebhookOptions,
  ShopifyWebhookOptionsFactory,
} from './shopify-webhook.interfaces';

export function createShopifyWebhookAsyncOptionsProviders(
  options: ShopifyWebhookAsyncOptions,
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [
      createShopifyWebhookAsyncOptionsProvider(options),
      shopifyWebhookControllerPathHackProvider,
    ];
  }

  if (options.useClass) {
    return [
      createShopifyWebhookAsyncOptionsProvider(options),
      { provide: options.useClass, useClass: options.useClass },
      shopifyWebhookControllerPathHackProvider,
    ];
  }

  throw new Error(
    'Invalid ShopifyWebhook options: one of `useClass`, `useExisting` or `useFactory` should be defined.',
  );
}

export function createShopifyWebhookAsyncOptionsProvider(
  options: ShopifyWebhookAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      provide: SHOPIFY_WEBHOOK_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  const inject = [];

  if (options.useClass || options.useExisting) {
    inject.push(options.useClass ?? options.useExisting);
  }

  return {
    provide: SHOPIFY_WEBHOOK_OPTIONS,
    useFactory: async (optionsFactory: ShopifyWebhookOptionsFactory) =>
      await optionsFactory.createShopifyWebhookOptions(),
    inject,
  };
}

export const shopifyWebhookControllerPathHackProvider: Provider = {
  provide: SHOPIFY_WEBHOOK_CONTROLLER_PATH_HACK,
  useFactory: (options: ShopifyWebhookOptions) => {
    Reflect.defineMetadata(
      PATH_METADATA,
      options.path,
      ShopifyWebhookController,
    );
  },
  inject: [SHOPIFY_WEBHOOK_OPTIONS],
};

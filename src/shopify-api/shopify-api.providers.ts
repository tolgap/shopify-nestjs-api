import { Provider } from '@nestjs/common';
import { SHOPIFY_API_OPTIONS } from './shopify-api.constants';
import {
  ShopifyApiAsyncOptions,
  ShopifyApiOptionsFactory,
} from './shopify-api.interfaces';

export function createShopifyApiAsyncOptionsProviders(
  options: ShopifyApiAsyncOptions,
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createShopifyApiAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [
      createShopifyApiAsyncOptionsProvider(options),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  throw new Error(
    'Invalid ShopifyApi options: one of `useClass`, `useExisting` or `useFactory` should be defined.',
  );
}

export function createShopifyApiAsyncOptionsProvider(
  options: ShopifyApiAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      provide: SHOPIFY_API_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  const inject = [];

  if (options.useClass || options.useExisting) {
    inject.push(options.useClass ?? options.useExisting);
  }

  return {
    provide: SHOPIFY_API_OPTIONS,
    useFactory: async (optionsFactory: ShopifyApiOptionsFactory) =>
      await optionsFactory.createShopifyApiOptions(),
    inject,
  };
}

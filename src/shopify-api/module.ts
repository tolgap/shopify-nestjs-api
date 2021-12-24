import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { SHOPIFY_API_OPTIONS } from './constants';
import { ShopifyApiAsyncOptions, ShopifyApiOptions } from './interfaces';
import { createShopifyApiAsyncOptionsProviders } from './providers';

@Global()
@Module({})
export class ShopifyApiModule implements OnModuleInit {
  static async forRoot(options: ShopifyApiOptions): Promise<DynamicModule> {
    return {
      module: ShopifyApiModule,
      global: true,
      providers: [{ provide: SHOPIFY_API_OPTIONS, useValue: options }],
    };
  }

  static async forRootAsync(
    options: ShopifyApiAsyncOptions,
  ): Promise<DynamicModule> {
    return {
      module: ShopifyApiModule,
      global: true,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createShopifyApiAsyncOptionsProviders(options),
      ],
    };
  }

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    const options = this.moduleRef.get<string, ShopifyApiOptions>(
      SHOPIFY_API_OPTIONS,
    );

    Shopify.Context.initialize({
      API_KEY: options.apiKey,
      API_SECRET_KEY: options.apiSecret,
      API_VERSION: options.apiVersion,
      SCOPES: options.scopes,
      HOST_NAME: options.hostName,
      IS_EMBEDDED_APP: options.isEmbeddedApp,
      SESSION_STORAGE: options.sessionStorage,
    });
  }
}

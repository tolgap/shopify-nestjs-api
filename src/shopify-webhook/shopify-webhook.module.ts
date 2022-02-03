import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ModuleRef } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { SHOPIFY_WEBHOOK_OPTIONS } from './shopify-webhook.constants';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import {
  ShopifyWebhookAsyncOptions,
  ShopifyWebhookOptions,
} from './shopify-webhook.interfaces';
import {
  createShopifyWebhookAsyncOptionsProviders,
  shopifyWebhookControllerPathHackProvider,
} from './shopify-webhook.providers';
import { ShopifyWebhookService } from './shopify-webhook.service';

@Module({})
export class ShopifyWebhookModule implements OnModuleInit {
  static forRoot(options: ShopifyWebhookOptions): DynamicModule {
    return {
      module: ShopifyWebhookModule,
      providers: [
        {
          provide: SHOPIFY_WEBHOOK_OPTIONS,
          useValue: options,
        },
        shopifyWebhookControllerPathHackProvider,
        ShopifyWebhookService,
      ],
      controllers: [ShopifyWebhookController],
      exports: [SHOPIFY_WEBHOOK_OPTIONS, ShopifyWebhookService],
    };
  }

  static forRootAsync(options: ShopifyWebhookAsyncOptions): DynamicModule {
    return {
      module: ShopifyWebhookModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createShopifyWebhookAsyncOptionsProviders(options),
        ShopifyWebhookService,
      ],
      controllers: [ShopifyWebhookController],
      exports: [SHOPIFY_WEBHOOK_OPTIONS, ShopifyWebhookService],
    };
  }

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    const options = this.moduleRef.get<ShopifyWebhookOptions>(
      SHOPIFY_WEBHOOK_OPTIONS,
      {
        strict: true,
      },
    );

    options.topics.forEach((topic) => {
      Shopify.Webhooks.Registry.addHandler(topic, {
        path: options.path,
        webhookHandler: async (topic, shop, body) =>
          await options.handler.process(topic, shop, body),
      });
    });
  }
}

# shopify-nestjs-api

[![Node.js CI](https://github.com/tolgap/shopify-nestjs-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/tolgap/shopify-nestjs-api/actions/workflows/node.js.yml)

A wrapper for [@shopify/shopify-node-api](https://github.com/Shopify/shopify-node-api) to setup your Shopify context in a NestJS application.

# Installation

Install package using NPM:

```
npm i @shopify/shopify-api shopify-nestjs-api
```

or using Yarn:

```
yarn add @shopify/shopify-api shopify-nestjs-api
```

# Usage

From your application root module, import the `ShopifyApiModule` using `forRoot`, or if you have dynamic config using `forRootAsync`:

```ts
// app.module.ts
@Module({
  imports: [
    ShopifyApiModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
  ],
})
export class App {}
```

or if you want to inject your configuration dynamically (maybe using `@nestjs/config`), use `forRootAsync`:

```ts
// app.module.ts
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ShopifyApiModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('SHOPIFY_API_KEY'),
          apiSecret: configService.get('SHOPIFY_API_SECRET'),
          apiVersion: ApiVersion.Unstable,
          hostName: configService.get('HOST').replace(/https:\/\//, ''),
          isEmbeddedApp: true,
          scopes: ['test_scope'],
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class App {}
```

# Custom session storage

The library allows your to inject your own session storage. For instance, if you use Redis based session storage. You could create an `@Injectable()` class that implements the `SessionStorage` interface. And use this injected class in your config:

```ts
// app.module.ts
import { ConfigService } from '@nestjs/config';
import { MyRedisSessionStorage } from './my-redis-session-storage';

@Module({
  imports: [
    ShopifyApiModule.forRootAsync({
      useFactory: async (
        configService: ConfigService,
        sessionStorage: MyRedisSessionStorage,
      ) => {
        return {
          apiKey: configService.get('SHOPIFY_API_KEY'),
          apiSecret: configService.get('SHOPIFY_API_SECRET'),
          apiVersion: ApiVersion.Unstable,
          hostName: configService.get('HOST').replace(/https:\/\//, ''),
          isEmbeddedApp: true,
          scopes: ['test_scope'],
          sessionStorage,
        };
      },
      provide: [MyRedisSessionStorage],
      inject: [ConfigService, MyRedisSessionStorage],
    }),
  ],
})
export class App {}
```

```ts
// my-redis-session-storage.ts
import { Injectable } from '@nestjs/common';
import {
  SessionStorage,
  SessionInterface,
} from '@shopify/shopify-api/dist/auth/session';

@Injectable()
export class MyRedisSessionStorage implements SessionStorage {
  async storeSession(session: SessionInterface): Promise<boolean> {
    // ... implement your redis store logic
  }

  async loadSession(id: string): Promise<SessionInterface | undefined> {
    // ... implement your redis load logic
  }

  async deleteSession(id: string): Promise<boolean> {
    // ... implement your redis delete logic
  }
}
```

## Webhooks

There is a separate module for registering webhooks called `ShopifyWebhookModule`. Import this module at the root level after `ShopifyApiModule`:

```ts
// app.module.ts
import { MyHandler } from './my.handler.ts';

@Module({
  imports: [
    ShopifyApiModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhookModule.forRoot({
      path: '/webhooks',
      topics: ['PRODUCTS_CREATE', 'CUSTOMERS_UPDATE'],
      handler: new MyHandler(),
    }),
  ],
  providers: [MyHandler],
})
export class App {}
```

This module requires a handler that will be invoked with a `.process()` function for _every_ incoming webhook:

```ts
// my.handler.ts
import { ShopifyWebhookHandler } from 'shopify-nestjs-api';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyHandler implements ShopifyWebhookHandler {
  async process(topic: string, shop: string, body: string): Promise<void> {
    switch (topic) {
      case 'products/create':
        // handle product creation logic
        break;
      case 'customers/update':
        // handle customer update logic
        break;
    }
  }
}
```

You can also import the `ShopifyWebhookModule` with `useFactory`, `useClass` or `useExisting` when importing the module using `.forRootAsync()`. This allows you to inject a webhook handler within the context of dependency injection in your application:

```ts
// app.module.ts
import { MyHandler } from './my.handler.ts';

@Module({
  imports: [
    ShopifyApiModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhookModule.forRootAsync({
      useFactory: (handler: MyHandler) => ({
        path: '/webhooks',
        topics: ['PRODUCTS_CREATE', 'CUSTOMERS_UPDATE'],
        handler,
      }),
      inject: [MyHandler],
    }),
  ],
  providers: [MyHandler],
})
export class App {}
```

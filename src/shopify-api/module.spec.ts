import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Shopify, { ApiVersion, ContextParams } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { UninitializedContextError } from '@shopify/shopify-api/dist/error';
import {
  MemorySessionStorage,
  SessionStorage,
} from '@shopify/shopify-api/dist/auth/session';
import { ShopifyApiOptions } from './interfaces';
import { ShopifyApiModule } from './module';

const requiredOptions: ShopifyApiOptions = {
  apiKey: 'foo',
  apiSecret: 'bar',
  apiVersion: ApiVersion.Unstable,
  hostName: 'localhost:8081',
  isEmbeddedApp: true,
  scopes: ['test_scope'],
};

@Injectable()
class MyCustomSessionStorage extends MemorySessionStorage {}

describe('ShopifyApiModule', () => {
  let moduleRef: TestingModule;

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyApiModule.forRoot({
            ...requiredOptions,
          }),
        ],
      }).compile();
    });

    it('should initialize Shopify.Context', async () => {
      await moduleRef.init();

      expect(() => Shopify.Context.throwIfUninitialized()).not.toThrowError(
        UninitializedContextError,
      );
    });

    it('should set the parameters to Shopify.Context', async () => {
      await moduleRef.init();

      expect(Shopify.Context).toEqual(
        expect.objectContaining<ContextParams>({
          API_KEY: 'foo',
          API_SECRET_KEY: 'bar',
          API_VERSION: ApiVersion.Unstable,
          HOST_NAME: 'localhost:8081',
          IS_EMBEDDED_APP: true,
          SCOPES: new AuthScopes(['test_scope']),
        }),
      );
    });
  });

  describe('#forRootAsync', () => {
    it('allows :useFactory option', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyApiModule.forRootAsync({
            useFactory: () => {
              return {
                ...requiredOptions,
              };
            },
          }),
        ],
      }).compile();

      await moduleRef.init();

      expect(Shopify.Context).toEqual(
        expect.objectContaining<ContextParams>({
          API_KEY: 'foo',
          API_SECRET_KEY: 'bar',
          API_VERSION: ApiVersion.Unstable,
          HOST_NAME: 'localhost:8081',
          IS_EMBEDDED_APP: true,
          SCOPES: new AuthScopes(['test_scope']),
        }),
      );
    });

    it('allows to inject custom session storage', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyApiModule.forRootAsync({
            useFactory: async (sessionStorage: SessionStorage) => {
              return {
                ...requiredOptions,
                sessionStorage,
              };
            },
            providers: [MyCustomSessionStorage],
            inject: [MyCustomSessionStorage],
          }),
        ],
      }).compile();

      await moduleRef.init();

      expect(Shopify.Context.SESSION_STORAGE).toBeInstanceOf(
        MyCustomSessionStorage,
      );
    });
  });
});

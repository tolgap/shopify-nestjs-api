import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Shopify from '@shopify/shopify-api';
import { ShopifyWebhookHandler } from './shopify-webhook.interfaces';
import { ShopifyWebhookModule } from './shopify-webhook.module';

const processMock = jest.fn().mockResolvedValue(undefined);
const handlerMock = { process: processMock } as ShopifyWebhookHandler;

@Injectable()
class MyHandler implements ShopifyWebhookHandler {
  async process(topic: string, shop: string, body: string): Promise<void> {
    await processMock(topic, shop, body);
  }
}

describe('ShopifyWebhookModule', () => {
  let moduleRef: TestingModule;

  afterEach(() => {
    processMock.mockReset();
  });

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhookModule.forRoot({
            path: '/mywebhooks',
            topics: ['PRODUCTS_CREATE'],
            handler: handlerMock,
          }),
        ],
      }).compile();

      await moduleRef.init();
    });

    afterEach(async () => {
      await moduleRef.close();
    });

    it('should add webhook to registry', async () => {
      expect(
        Shopify.Webhooks.Registry.webhookRegistry['PRODUCTS_CREATE'],
      ).toHaveProperty('path', '/mywebhooks');
    });
  });

  describe('#forRootAsync', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhookModule.forRootAsync({
            useFactory: (handler: ShopifyWebhookHandler) => ({
              path: '/mywebhooks2',
              topics: ['PRODUCTS_UPDATE', 'CUSTOMERS_UPDATE'],
              handler,
            }),
            providers: [MyHandler],
            inject: [MyHandler],
          }),
        ],
      }).compile();

      await moduleRef.init();
    });

    afterEach(async () => {
      await moduleRef.close();
    });

    it('should add webhook to registry', async () => {
      expect(
        Shopify.Webhooks.Registry.webhookRegistry['PRODUCTS_UPDATE'],
      ).toHaveProperty('path', '/mywebhooks2');

      expect(
        Shopify.Webhooks.Registry.webhookRegistry['CUSTOMERS_UPDATE'],
      ).toHaveProperty('path', '/mywebhooks2');
    });
  });
});

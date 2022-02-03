import * as request from 'supertest';
import { createHmac } from 'crypto';
import { Test } from '@nestjs/testing';
import { INestApplication, Injectable } from '@nestjs/common';
import Shopify, { ApiVersion, ShopifyHeader } from '@shopify/shopify-api';
import { ShopifyWebhookModule } from '../src/shopify-webhook/shopify-webhook.module';
import { ShopifyWebhookHandler } from '../src/shopify-webhook/shopify-webhook.interfaces';

function hmac(secret: string, body: string) {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64');
}

@Injectable()
class MyHandler implements ShopifyWebhookHandler {
  async process(
    topic: string,
    shopDomain: string,
    body: string,
  ): Promise<void> {
    if (!topic || !shopDomain || !body) {
      throw new Error('Missing webhook parameters');
    }
  }
}

describe('ShopifyWebhookModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ShopifyWebhookModule.forRootAsync({
          useFactory: async (handler: ShopifyWebhookHandler) => ({
            path: '/webhooks',
            topics: ['PRODUCTS_CREATE'],
            handler,
          }),
          providers: [MyHandler],
          inject: [MyHandler],
        }),
      ],
    }).compile();

    Shopify.Context.initialize({
      API_KEY: 'crux',
      API_SECRET_KEY: 'foobar',
      API_VERSION: ApiVersion.Unstable,
      HOST_NAME: 'https://localhost',
      IS_EMBEDDED_APP: true,
      SCOPES: ['products_write'],
    });

    app = moduleRef.createNestApplication(undefined, { bodyParser: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const rawBody = '{"foo": "bar"}';
  test('POST /webhooks', async () => {
    await request(app.getHttpServer())
      .post('/webhooks')
      .set({
        [ShopifyHeader.Hmac]: hmac('foobar', rawBody),
        [ShopifyHeader.Topic]: 'products/create',
        [ShopifyHeader.Domain]: 'myshop.myshopify.io',
      })
      .send(rawBody)
      .expect(200);
  });
});

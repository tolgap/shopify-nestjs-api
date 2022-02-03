import { Injectable, Logger } from '@nestjs/common';
import Shopify, { ShortenedRegisterOptions } from '@shopify/shopify-api';

@Injectable()
export class ShopifyWebhookService {
  private readonly logger = new Logger(ShopifyWebhookService.name);

  async registerWebhooks(options: ShortenedRegisterOptions) {
    const { accessToken, shop, deliveryMethod } = options;
    const response = await Shopify.Webhooks.Registry.registerAll({
      accessToken,
      shop,
      deliveryMethod,
    });

    Object.keys(response).forEach((topic: string) => {
      if (response[topic].success) {
        this.logger.debug(`Registered webhook ${topic} successfully.`);
      } else {
        this.logger.warn(
          `Failed to register webhook ${topic}: ${response.result}`,
        );
      }
    });
  }
}

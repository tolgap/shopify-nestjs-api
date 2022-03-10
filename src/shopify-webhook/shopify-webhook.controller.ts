// Based on work at Shopify: https://github.com/Shopify/shopify-node-api/blob/9a3f59d5cd51b50ddad093741dfbaab1f32a6d93/src/webhooks/registry.ts
// Modified for usage in NestJS.

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import Shopify, { ShopifyHeader } from '@shopify/shopify-api';
import { createHmac } from 'crypto';
import safeCompare from './safe-compare.utils';

@Controller('shopify/webhooks')
export class ShopifyWebhookController {
  @Post()
  @HttpCode(200)
  async handle(
    @Headers(ShopifyHeader.Hmac) hmac: string,
    @Headers(ShopifyHeader.Topic) topic: string,
    @Headers(ShopifyHeader.Domain) domain: string,
    @Body() body: any,
  ) {
    if (!body) {
      throw new BadRequestException(
        'No body was received when processing webhook',
      );
    }

    const missingHeaders = [];
    if (!hmac) {
      missingHeaders.push(ShopifyHeader.Hmac);
    }
    if (!topic) {
      missingHeaders.push(ShopifyHeader.Topic);
    }
    if (!domain) {
      missingHeaders.push(ShopifyHeader.Domain);
    }
    if (missingHeaders.length) {
      throw new BadRequestException(
        `Missing on or more of the required HTTP headers to process webhooks: [${missingHeaders.join(
          ', ',
        )}]`,
      );
    }

    const generatedHash = createHmac('sha256', Shopify.Context.API_SECRET_KEY)
      .update(JSON.stringify(body), 'utf8')
      .digest('base64');

    if (!safeCompare(generatedHash, hmac)) {
      throw new ForbiddenException(
        `Could not validate request for topic ${topic}. Invalid HMAC.`,
      );
    }

    const graphqlTopic = (topic as string).toUpperCase().replace(/\//g, '_');
    const webhookEntry = Shopify.Webhooks.Registry.getHandler(graphqlTopic);

    if (!webhookEntry) {
      throw new ForbiddenException(`No webhook is registered for ${topic}`);
    }

    await webhookEntry.webhookHandler(graphqlTopic, domain as string, body);
  }
}

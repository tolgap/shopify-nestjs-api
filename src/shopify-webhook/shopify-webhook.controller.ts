import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';

@Controller('shopify/webhooks')
export class ShopifyWebhookController {
  @Post()
  async handle(@Req() req, @Res() res) {
    await Shopify.Webhooks.Registry.process(req, res);
  }
}

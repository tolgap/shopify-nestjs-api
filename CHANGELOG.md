# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

# 3.0.0

### Fixed

- ⚠️ [Breaking] Fix webhook HMAC secret validation.

  This adds the requirement of installing `body-parser` back. You will have to disable the `bodyParser` logic of NextJS just to use this package.

  Example:

  ```ts
  // main.ts
  import { NestFactory } from '@nestjs/core';
  import { json } from 'body-parser';
  import { AppModule } from './app.module';

  async function bootstrap() {
    const jsonParseMiddleware = json();
    const app = await NestFactory.create(AppModule, { bodyParser: false });
    app.use((req, res, next) => {
      // NOTE: Make sure this is the same `path` you pass to the `ShopifyWebhookModule`.
      if (req.path.indexOf('/webhooks') === 0) {
        next();
      } else {
        jsonParseMiddleware(req, res, next);
      }
    });

    await app.listen(3000);
  }
  bootstrap();
  ```

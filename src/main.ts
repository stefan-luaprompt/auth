import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

async function bootstrap() {

  // Set up Elasticsearch transport options for Winston
  const esTransportOpts = {
    level: 'debug',
    clientOpts: {
      node: 'http://localhost:9200', // Update with your Elasticsearch URL
      auth: {
        username: 'elastic',          // Use credentials if security is enabled
        password: 'changeme',         // Set your password for Elasticsearch
      },
    },
    indexPrefix: 'nestjs-logs',        // Set the prefix for the Elasticsearch index
  };

  // Create the NestJS application with a custom Winston logger
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple()
          ),
        }),
        new ElasticsearchTransport(esTransportOpts),  // Correct usage
      ],
    }),
  });

  // Set up Pug as the view engine
  app.setViewEngine('pug');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));


  await app.listen(process.env.PORT || 3000);
}
bootstrap();

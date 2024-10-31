import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

async function bootstrap() {

  

  // Create the NestJS application with a custom Winston logger
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    
  });

  // Set up Pug as the view engine
  app.setViewEngine('pug');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));


  await app.listen(process.env.PORT || 3000);
}
bootstrap();

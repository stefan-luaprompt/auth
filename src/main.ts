import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';


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

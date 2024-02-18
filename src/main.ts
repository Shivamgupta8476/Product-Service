import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'body-parser';
const port = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Product_Service')
    .setDescription('Product Service Backend APIS')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}/`, 'Local Server')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
      scheme: 'bearer',
    })

    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {});

  // It Enables Cors For All Domain
  app.enableCors();

  // Helmet helps you secure your Express apps by setting various HTTP headers.
  app.use(helmet());
  app.use(json({ limit: '50mb' }));
  // app.useGlobalInterceptors(new NewrelicInterceptor);
  await app.listen(port);
  Logger.log(`🚀  Server is listening on port ${port}`, 'Bootstrap');
}
bootstrap();

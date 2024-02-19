import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { AuthenticationMiddleware, AuthorizationMiddleware } from './middleware/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModel, ProductSchema } from './product/product.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
   MongooseModule.forFeature([{ name: ProductModel.name, schema: ProductSchema }]),
   ClientsModule.register([
    {
      name: 'PRODUCT_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBIT_URI],
        queue: 'Customer_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  ]),
  ],
  controllers: [ProductController],
  providers: [ProductService,Logger],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude()
      .forRoutes('*');

      consumer
      .apply(AuthorizationMiddleware)
      .forRoutes(
       // { path: '/customer/:CustomerId', method: RequestMethod.GET },
        );
  }
  
}


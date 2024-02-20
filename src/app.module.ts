import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import {
  AuthenticationMiddleware,
  AuthorizationMiddleware,
} from './middleware/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModel, ProductSchema } from './product/product.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from './middleware/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: ProductModel.name, schema: ProductSchema },
    ]),
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Customer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, Logger, JwtAuthGuard],
})
// export class AppModule{}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude().forRoutes('*');

    consumer
    .apply(AuthorizationMiddleware)
    .forRoutes(
      { path: '/product/create', method: RequestMethod.POST },
      { path: '/product/deleteProducts/:id', method: RequestMethod.DELETE },
      { path: '/product/updateProducts/:id', method: RequestMethod.PUT },
    );
}
}

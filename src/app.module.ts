import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { AuthenticationMiddleware, AuthorizationMiddleware } from './middleware/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModel, ProductSchema } from './product/product.schema';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://Shivamgupta:fIffetcE6AVPQRAG@cluster0.hulfv.mongodb.net/e-commerce"),
   MongooseModule.forFeature([{ name: ProductModel.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService,Logger],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // .apply(AuthenticationMiddleware)
      // .exclude()
      // .forRoutes('*');

      // consumer
      // .apply(AuthorizationMiddleware)
      // .forRoutes(
      //  // { path: '/customer/:CustomerId', method: RequestMethod.GET },
      //   );
  }
  
}


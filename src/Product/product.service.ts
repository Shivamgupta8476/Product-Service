import { HttpException, HttpStatus, Inject, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  { Model, isValidObjectId} from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductDto, ProductUpdateDto } from './product.dto';
import { ProductModel } from './product.schema';
import * as AWS from 'aws-sdk';
import { ClientProxy } from '@nestjs/microservices';
require('dotenv').config();

@Injectable()
@ApiBearerAuth()
export class ProductService {
  private readonly s3: AWS.S3;
  constructor(
    private readonly logger: Logger,
    @InjectModel(ProductModel.name)
    private readonly productServiceModel: Model<ProductModel>,
    @Inject('CUSTOMER_SERVICE') private readonly product2Customer: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly product2Order: ClientProxy
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    });
  }

  async createProduct(
    data: ProductDto,
    file: Express.Multer.File,
    req: any,
  ): Promise<any> {
    this.logger.log('Entered into createProduct', ProductService.name);
    try {
      if (!file || file.size <= 0) {
        return new HttpException('Invalid file', HttpStatus.BAD_REQUEST);
      }
      const location = await this.uploadToS3(file);
      this.product2Order.emit('Product_created', {
        ...data,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        imageUrl: location,
        adminId: req['user']['id'],
      });
      const newProduct = await this.productServiceModel.create({
        ...data,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        imageUrl: location,
        adminId: req['user']['id'],
      });
      return {
        message: 'Product created successfully',
        success: true,
        data: newProduct,
      };
    } catch (error) {
      return error.message;
    }
  }

  private async uploadToS3(file: Express.Multer.File): Promise<string | null> {
    try {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Body: file.buffer,
        Key: file.originalname,
        REGION: 'ap-south-1',
      };
      const response = await this.s3.upload(params).promise();
      return response.Location;
    } catch (error) {
      console.log('Error uploading file to S3:', error);
      return null;
    }
  }

  async getProducts(id: string) {
    try {
      return await this.productServiceModel.find({ _id: id });
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async getAllProducts() {
    try {
      return await this.productServiceModel.find({});
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async deleteProduct(id: string, req: any) {
    try {
      let userId = req['user']['id'];
      if (!isValidObjectId(id)) {
        throw new HttpException('Not a valid user id', HttpStatus.BAD_REQUEST);
      }
      const findProduct = await this.productServiceModel
        .findOneAndDelete({ _id: id })
        .exec();

      if (userId !== findProduct.adminId) {
        throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
      }
      this.product2Order.emit('Product_deleted',id);
      return await this.productServiceModel.findByIdAndDelete(id);
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async updateProduct(id: string, data: ProductUpdateDto) {
    try {
        this.logger.log('Entered into updateProductData', ProductService.name);

      const findproduct = await this.productServiceModel.findById(id);

      if (!findproduct) {
        throw new Error('Product not found');
      }
      if (data?.name) {
        findproduct.name = data.name;
      }
      if (data?.description) {
        findproduct.description = data.description;
      }
      if (data?.isactive) {
        findproduct.isactive = data.isactive;
      }
      if (data?.brand) {
        findproduct.brand = data.brand;
      }
      if (data?.price) {
        findproduct.price = data.price;
      }
      if (data?.stockQuantity) {
        findproduct.stockQuantity += data.stockQuantity;
      }
      if (data?.availability && ["yes" , "no"].includes(data.availability)) {
        findproduct.availability = data.availability;
      }
     
      findproduct.updatedAt = new Date();
      this.product2Order.emit('Product_updated',findproduct);

      await findproduct.save();
      return findproduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProductByUserID(id: string) {
    try {
      return await this.productServiceModel.deleteMany({adminId:id});
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }
}

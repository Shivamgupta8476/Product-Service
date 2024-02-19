import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductDto } from './product.dto';
import { ProductModel } from './product.schema';
import * as AWS from 'aws-sdk';
import { ClientProxy} from '@nestjs/microservices';
require('dotenv').config();


@Injectable()
@ApiBearerAuth()
export class ProductService {
    private readonly s3: AWS.S3;
    private readonly client: ClientProxy;

    constructor(
        private readonly logger: Logger,
        @InjectModel(ProductModel.name) private readonly productServiceModel: Model<ProductModel>,
    ) {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY
        });
    }

    async createProduct(data: ProductDto, file: Express.Multer.File,req:any): Promise<any> {
        this.logger.log("Entered into createProduct", ProductService.name);
        try {
            if (!file || file.size <= 0) {
                return new HttpException("Invalid file", HttpStatus.BAD_REQUEST);
            }
            const location = await this.uploadToS3(file);
            const newProduct = await this.productServiceModel.create({...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
                imageUrl: location ,
                adminId:req['decodedToken']['id']

            });
            return {
                message: 'Product created successfully',
                success: true,
                data: newProduct
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
                REGION :'ap-south-1'
            };
            const response = await this.s3.upload(params).promise();
            return response.Location;
        } catch (error) {
            console.log("Error uploading file to S3:", error);
            return null;
        }
    }
}

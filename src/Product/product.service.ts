import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  { Model,Types } from 'mongoose';
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

    async getProducts(id: string) {
        try{
        return await this.productServiceModel.find({_id:id});
        }catch(e){
            throw new HttpException(e.message, 404);
        }

    }

    async getAllProducts() {
        try{
        return await this.productServiceModel.find({});
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }

    async deleteProduct(id: string,userId:string) { 
        try{
        if(userId !== id){
            throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
        }
        return await this.productServiceModel.findByIdAndDelete(id);
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }
    
    async updateProduct(id: string, data: ProductDto) {
        try { 
            const product = await this.productServiceModel.findById(id);
            
            if (!product) {
                throw new Error("Product not found");
            } 
            product.stockQuantity += data.stockQuantity;
            product.updatedAt = new Date();
     
            await product.save();
            return product;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    }
    
    
}

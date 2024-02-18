import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';

import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductDto } from './product.dto';
import { FileInterceptor} from '@nestjs/platform-express';

@ApiTags('Product')
@Controller('/product')
@ApiBearerAuth()
export class ProductController {
  constructor(
    private service: ProductService,
    private readonly logger: Logger,
  ) {}
  @Post('/create')
  @ApiOkResponse({ description: 'craeteproduct ' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body() createProductReq: ProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<any> {
    this.logger.log('Request made to create Product');
    try {
      console.log(file.originalname)
      if (!file.originalname.match(/\.(jpeg|jpg)$/)) {
				return new HttpException("Only image files are allowed!", 500)
			}
      return await this.service.createProduct(createProductReq,file,req);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      throw new HttpException('Internal Server Error', 500);
    }
  }

  @Get('getProducts/:id')
 async getProducts(@Param('id') id: string) {
   try{
     let data =await this.service.getProducts(id);
     if(data){
      return data
     }else{
     throw new HttpException('Product not found', 404);
     }
   }
    catch(e){
     throw new HttpException(e.message, 500);
    }
  }

  @Get('getAllProducts')
  async getAllProducts() {
    try{
      let data =await this.service.getAllProducts();
      if(data){
       return data
      }else{
      throw new HttpException('Product not found', 404);
      }
    }
     catch(e){
      throw new HttpException(e.message, 500);
     }
   }


   @Delete('deleteProducts/:id')
   async deleteProduct(req: Request,@Param('id') id: string) {
     try{
       let userId = req['decodedToken']['id'];
       let data =await this.service.deleteProduct(id,userId);
       if(data){
        return data
       }else{
       throw new HttpException('Product not found', 404);
       }
     }
      catch(e){
       throw new HttpException(e.message, 500);
      }
    }

    @Put('updateProducts/:id')
    async updateProduct( @Param('id') id: string, @Body() productDto: ProductDto) {
      try{
        let data =await this.service.updateProduct(id,productDto);
        if(data){
         return data
        }
       }
       catch(e){
        throw new HttpException(e.message, 500);
       }

    }



}

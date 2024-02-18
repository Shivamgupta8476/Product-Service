import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
				throw new HttpException("Only image files are allowed!", 500)
			}
      return await this.service.createProduct(createProductReq,file,req);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      throw new HttpException('Internal Server Error', 500);
    }
  }
}

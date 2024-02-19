import {
  Body,
  Controller,
  HttpException,
  Inject,
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
import { ClientProxy, EventPattern } from '@nestjs/microservices';

@ApiTags('Product')
@Controller('/product')
@ApiBearerAuth()
export class ProductController {
  @EventPattern('login_created')
	async handleOrderCreated(data: Record<string, unknown>) {
		console.log('login_created', data);
  }
  constructor(
    private service: ProductService,
    private readonly logger: Logger,
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy
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
      this.client.emit('order_created', createProductReq);
      return await this.service.createProduct(createProductReq,file,req);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      throw new HttpException('Internal Server Error', 500);
    }
  }
}

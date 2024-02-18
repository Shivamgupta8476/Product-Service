import { ApiBody, ApiProperty } from '@nestjs/swagger'; 
import { IsNotEmpty, IsEnum } from 'class-validator';

enum Availability {
    YES = 'yes',
    NO = 'no',
  }

export class ProductDto {
 
    @ApiProperty({ description: 'Product_type' })
    @IsNotEmpty() 
    Product_type: string;
    
    @ApiProperty({ description: 'name' })
    @IsNotEmpty() 
    name: string;
    
    @ApiProperty({ description: 'description' })
    description: string;

    @ApiProperty({ description: 'isActive',default:true })
    isactive: boolean;
    
    @ApiProperty({ description: 'price' })
    @IsNotEmpty()
    price: number;
    
    @ApiProperty({ description: 'brand' })
    brand: string;
    
    @ApiProperty({ description: 'stockQuantity' })
    @IsNotEmpty()
    stockQuantity: number;

    @ApiProperty({ type: 'file', format: 'binary' })
     file: any;
     
     @ApiProperty({ description: 'availability', enum: Availability,default:"yes" })
     @IsEnum(Availability)
     availability: Availability;
        
    @ApiProperty({ description: 'createdAt',required:false,default: new Date() })
    createdAt: Date
   
    @ApiProperty({ description: 'updatedAt',required:false,default: new Date()})
    updatedAt: Date;

}
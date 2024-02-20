import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUrl,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';

@Schema()
export class ProductModel {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  Product_type: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  isactive: boolean;

  @Prop({ required: true })
  @IsString()
  @IsOptional()
  description: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Prop({ required: true })
  @IsString()
  @IsOptional()
  brand: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  stockQuantity: number;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  availability: string;

  @Prop({ default: Date.now })
  @ApiProperty({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  @ApiProperty({ default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductModel);

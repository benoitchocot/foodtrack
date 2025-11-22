import { IsOptional, IsEnum, IsArray, IsInt, Min, IsString } from 'class-validator';
import { DietType, Difficulty } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class RecipeQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(DietType, { each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    dietTypes?: DietType[];

    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    maxPrepTime?: number;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',') || []))
    toolsRequired?: string[];

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',') || []))
    tags?: string[];

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 20;
}

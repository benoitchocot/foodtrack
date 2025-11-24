import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsInt,
    IsNumber,
    Min,
    IsArray,
    ValidateNested,
    IsOptional,
    IsUrl,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DietType, Difficulty, Unit } from '@prisma/client';

class RecipeIngredientDto {
    @IsString()
    @IsNotEmpty()
    ingredientId: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsEnum(Unit)
    unit: Unit;

    @IsOptional()
    optional?: boolean;
}

class RecipeStepDto {
    @IsInt()
    @Min(1)
    stepNumber: number;

    @IsString()
    @IsNotEmpty()
    instruction: string;
}

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @IsInt()
    @Min(1)
    prepTime: number;

    @IsInt()
    @Min(0)
    cookTime: number;

    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsInt()
    @Min(1)
    servings: number;

    @IsBoolean()
    @IsOptional()
    isAdaptable?: boolean;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsArray()
    @IsOptional()
    toolsRequired?: string[];

    @IsArray()
    @IsEnum(DietType, { each: true })
    @IsOptional()
    dietTypes?: DietType[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients: RecipeIngredientDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeStepDto)
    steps: RecipeStepDto[];
}

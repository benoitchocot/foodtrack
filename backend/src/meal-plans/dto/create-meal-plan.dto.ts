import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateMealPlanDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @IsOptional()
    recipeIds?: string[];
}

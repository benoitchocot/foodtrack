import { IsInt, Min, Max, IsOptional, IsEnum, IsArray } from 'class-validator';
import { DietType, Difficulty } from '@prisma/client';

export class GenerateMealPlanDto {
    @IsInt()
    @Min(1)
    @Max(21)
    numberOfMeals: number;

    // Optional overrides for user settings
    @IsArray()
    @IsEnum(DietType, { each: true })
    @IsOptional()
    dietPreferences?: DietType[];

    @IsEnum(Difficulty)
    @IsOptional()
    maxDifficulty?: Difficulty;

    @IsInt()
    @Min(5)
    @Max(240)
    @IsOptional()
    maxPrepTime?: number;

    @IsArray()
    @IsOptional()
    toolsAvailable?: string[];
}

import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddRecipeToPlanDto {
    @IsString()
    @IsNotEmpty()
    recipeId: string;

    @IsInt()
    @Min(1)
    servings: number;
}

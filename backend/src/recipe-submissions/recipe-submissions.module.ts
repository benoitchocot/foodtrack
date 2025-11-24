import { Module } from '@nestjs/common';
import { RecipeSubmissionsService } from './recipe-submissions.service';
import { RecipeSubmissionsController } from './recipe-submissions.controller';
import { EmailService } from './email.service';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
    imports: [RecipesModule],
    controllers: [RecipeSubmissionsController],
    providers: [RecipeSubmissionsService, EmailService],
    exports: [RecipeSubmissionsService, EmailService],
})
export class RecipeSubmissionsModule {}


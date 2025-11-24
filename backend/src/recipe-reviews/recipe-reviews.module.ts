import { Module } from '@nestjs/common';
import { RecipeReviewsService } from './recipe-reviews.service';
import { RecipeReviewsController, ReviewAdminController } from './recipe-reviews.controller';
import { RecipeSubmissionsModule } from '../recipe-submissions/recipe-submissions.module';

@Module({
    imports: [RecipeSubmissionsModule],
    controllers: [RecipeReviewsController, ReviewAdminController],
    providers: [RecipeReviewsService],
    exports: [RecipeReviewsService],
})
export class RecipeReviewsModule {}


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';
import { HistoryModule } from './history/history.module';
import { RecipeSubmissionsModule } from './recipe-submissions/recipe-submissions.module';
import { RecipeReviewsModule } from './recipe-reviews/recipe-reviews.module';
import { UploadModule } from './upload/upload.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        IngredientsModule,
        RecipesModule,
        MealPlansModule,
        ShoppingListsModule,
        HistoryModule,
        RecipeSubmissionsModule,
        RecipeReviewsModule,
        UploadModule,
    ],
})
export class AppModule { }

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RecipesService } from '../recipes/recipes.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { AddRecipeToPlanDto } from './dto/add-recipe-to-plan.dto';
import { Difficulty } from '@prisma/client';

@Injectable()
export class MealPlansService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private recipesService: RecipesService,
    ) { }

    async create(userId: string, createMealPlanDto: CreateMealPlanDto) {
        const mealPlan = await this.prisma.mealPlan.create({
            data: {
                userId,
                title: createMealPlanDto.title,
            },
            include: {
                recipes: {
                    include: {
                        recipe: true,
                    },
                },
            },
        });

        // Add recipes if provided
        if (createMealPlanDto.recipeIds && createMealPlanDto.recipeIds.length > 0) {
            for (const recipeId of createMealPlanDto.recipeIds) {
                await this.addRecipe(mealPlan.id, userId, {
                    recipeId,
                    servings: 4, // default servings
                });
            }
        }

        return this.findOne(mealPlan.id, userId);
    }

    async generate(userId: string, generateDto: GenerateMealPlanDto) {
        // Get user settings
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const settings = user.settings;

        // Use provided overrides or fall back to user settings
        const dietPreferences = generateDto.dietPreferences || settings?.dietPreferences || [];
        const maxDifficulty = generateDto.maxDifficulty || settings?.difficultyPreference || Difficulty.HARD;
        const maxPrepTime = generateDto.maxPrepTime || settings?.maxPrepTime || 120;
        const toolsAvailable = generateDto.toolsAvailable || settings?.toolsAvailable || [];

        // Create a simple title based on creation date
        const today = new Date();
        const title = `Menu du ${today.toLocaleDateString('fr-FR')}`;

        // Create meal plan
        const mealPlan = await this.prisma.mealPlan.create({
            data: {
                userId,
                title,
            },
        });

        // Select recipes using intelligent algorithm
        const selectedRecipes = await this.selectRecipes(
            generateDto.numberOfMeals,
            dietPreferences,
            maxDifficulty,
            maxPrepTime,
            toolsAvailable,
        );

        // Add selected recipes to meal plan (without date planning)
        for (const recipe of selectedRecipes) {
            await this.prisma.mealPlanRecipe.create({
                data: {
                    mealPlanId: mealPlan.id,
                    recipeId: recipe.id,
                    servings: settings?.householdSize || 4,
                },
            });
        }

        return this.findOne(mealPlan.id, userId);
    }

    private async selectRecipes(
        numberOfMeals: number,
        dietPreferences: any[],
        maxDifficulty: Difficulty,
        maxPrepTime: number,
        toolsAvailable: string[],
    ) {
        // Strategy: Try with strict constraints first, then relax if needed
        let selectedRecipes = [];

        // Attempt 1: Strict constraints
        selectedRecipes = await this.trySelectRecipes(
            numberOfMeals,
            dietPreferences,
            maxDifficulty,
            maxPrepTime,
            toolsAvailable,
            true,
        );

        // Attempt 2: Relax difficulty constraint
        if (selectedRecipes.length < numberOfMeals) {
            selectedRecipes = await this.trySelectRecipes(
                numberOfMeals,
                dietPreferences,
                Difficulty.HARD,
                maxPrepTime,
                toolsAvailable,
                true,
            );
        }

        // Attempt 3: Relax prep time by 50%
        if (selectedRecipes.length < numberOfMeals) {
            selectedRecipes = await this.trySelectRecipes(
                numberOfMeals,
                dietPreferences,
                Difficulty.HARD,
                Math.floor(maxPrepTime * 1.5),
                toolsAvailable,
                true,
            );
        }

        // Attempt 4: Only respect diet preferences
        if (selectedRecipes.length < numberOfMeals) {
            selectedRecipes = await this.trySelectRecipes(
                numberOfMeals,
                dietPreferences,
                Difficulty.HARD,
                999,
                [],
                false,
            );
        }

        // Last resort: Get any recipes
        if (selectedRecipes.length < numberOfMeals) {
            const allRecipes = await this.prisma.recipe.findMany({
                take: numberOfMeals,
            });
            return allRecipes;
        }

        return selectedRecipes;
    }

    private async trySelectRecipes(
        numberOfMeals: number,
        dietPreferences: any[],
        maxDifficulty: Difficulty,
        maxPrepTime: number,
        toolsAvailable: string[],
        checkTools: boolean,
    ) {
        const where: any = {};

        // Diet preferences (must match ALL)
        if (dietPreferences && dietPreferences.length > 0) {
            where.dietTypes = {
                hasEvery: dietPreferences,
            };
        }

        // Difficulty
        const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };
        const maxDifficultyValue = difficultyOrder[maxDifficulty];
        const allowedDifficulties = Object.entries(difficultyOrder)
            .filter(([_, value]) => value <= maxDifficultyValue)
            .map(([key]) => key);

        where.difficulty = {
            in: allowedDifficulties,
        };

        // Tools (only if checkTools is true and tools are specified)
        if (checkTools && toolsAvailable && toolsAvailable.length > 0) {
            where.OR = [
                { toolsRequired: { isEmpty: true } },
                { toolsRequired: { hasSome: toolsAvailable } },
            ];
        }

        // Fetch matching recipes
        const matchingRecipes = await this.prisma.recipe.findMany({
            where,
            take: numberOfMeals * 5, // Get more than needed for variety and time filtering
        });

        // Filter by total time (prepTime + cookTime) since frontend displays total time
        const timeFilteredRecipes = matchingRecipes.filter(
            (recipe) => recipe.prepTime + recipe.cookTime <= maxPrepTime
        );

        // Shuffle and ensure diversity
        const shuffled = this.shuffleArray(timeFilteredRecipes);
        const selected = [];
        const usedTags = new Set<string>();
        const usedDifficulties = new Set<string>();

        for (const recipe of shuffled) {
            if (selected.length >= numberOfMeals) break;

            // Ensure variety in tags and difficulty
            const hasNewTag = recipe.tags.some((tag: string) => !usedTags.has(tag));
            const hasNewDifficulty = !usedDifficulties.has(recipe.difficulty);

            if (selected.length < 3 || hasNewTag || hasNewDifficulty) {
                selected.push(recipe);
                recipe.tags.forEach((tag: string) => usedTags.add(tag));
                usedDifficulties.add(recipe.difficulty);
            }
        }

        return selected;
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async findAll(userId: string) {
        return this.prisma.mealPlan.findMany({
            where: { userId },
            include: {
                recipes: {
                    include: {
                        recipe: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, userId: string) {
        const mealPlan = await this.prisma.mealPlan.findUnique({
            where: { id },
            include: {
                recipes: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: {
                                    include: {
                                        ingredient: true,
                                    },
                                },
                                steps: {
                                    orderBy: {
                                        stepNumber: 'asc',
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        plannedFor: 'asc',
                    },
                },
            },
        });

        if (!mealPlan) {
            throw new NotFoundException('Meal plan not found');
        }

        if (mealPlan.userId !== userId) {
            throw new ForbiddenException('You do not have access to this meal plan');
        }

        return mealPlan;
    }

    async update(id: string, userId: string, updateMealPlanDto: UpdateMealPlanDto) {
        await this.findOne(id, userId); // Check access

        return this.prisma.mealPlan.update({
            where: { id },
            data: {
                title: updateMealPlanDto.title,
            },
            include: {
                recipes: {
                    include: {
                        recipe: true,
                    },
                },
            },
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId); // Check access

        return this.prisma.mealPlan.delete({
            where: { id },
        });
    }

    async addRecipe(mealPlanId: string, userId: string, addRecipeDto: AddRecipeToPlanDto) {
        await this.findOne(mealPlanId, userId); // Check access

        // Verify recipe exists
        await this.recipesService.findOne(addRecipeDto.recipeId);

        // Check if recipe already in plan
        const existing = await this.prisma.mealPlanRecipe.findFirst({
            where: {
                mealPlanId,
                recipeId: addRecipeDto.recipeId,
            },
        });

        if (existing) {
            // Update servings if already exists
            return this.prisma.mealPlanRecipe.update({
                where: { id: existing.id },
                data: {
                    servings: addRecipeDto.servings,
                    plannedFor: addRecipeDto.plannedFor ? new Date(addRecipeDto.plannedFor) : undefined,
                },
                include: {
                    recipe: true,
                },
            });
        }

        return this.prisma.mealPlanRecipe.create({
            data: {
                mealPlanId,
                recipeId: addRecipeDto.recipeId,
                servings: addRecipeDto.servings,
                plannedFor: addRecipeDto.plannedFor ? new Date(addRecipeDto.plannedFor) : undefined,
            },
            include: {
                recipe: true,
            },
        });
    }

    async removeRecipe(mealPlanId: string, recipeId: string, userId: string) {
        await this.findOne(mealPlanId, userId); // Check access

        const mealPlanRecipe = await this.prisma.mealPlanRecipe.findFirst({
            where: {
                mealPlanId,
                recipeId,
            },
        });

        if (!mealPlanRecipe) {
            throw new NotFoundException('Recipe not found in meal plan');
        }

        return this.prisma.mealPlanRecipe.delete({
            where: { id: mealPlanRecipe.id },
        });
    }
}

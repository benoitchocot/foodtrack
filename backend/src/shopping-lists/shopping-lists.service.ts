import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { GenerateFromMealPlanDto } from './dto/generate-from-meal-plan.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ShoppingListStatus } from '@prisma/client';

interface AggregatedIngredient {
    ingredientId: string;
    quantity: number;
    unit: string;
    ingredient?: any;
}

@Injectable()
export class ShoppingListsService {
    constructor(
        private prisma: PrismaService,
        private mealPlansService: MealPlansService,
    ) { }

    async create(userId: string, createShoppingListDto: CreateShoppingListDto) {
        return this.prisma.shoppingList.create({
            data: {
                userId,
                title: createShoppingListDto.title,
                mealPlanId: createShoppingListDto.mealPlanId,
                status: ShoppingListStatus.DRAFT,
            },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    async generateFromMealPlan(userId: string, generateDto: GenerateFromMealPlanDto) {
        // Verify meal plan exists and belongs to user
        const mealPlan = await this.mealPlansService.findOne(generateDto.mealPlanId, userId);

        // Generate title if not provided
        const title =
            generateDto.title ||
            `Liste de courses - ${mealPlan.title || `Menu - ${new Date().toISOString().split('T')[0]}`}`;

        // Create shopping list
        const shoppingList = await this.prisma.shoppingList.create({
            data: {
                userId,
                title,
                mealPlanId: mealPlan.id,
                status: ShoppingListStatus.DRAFT,
            },
        });

        // Aggregate ingredients from meal plan
        const aggregatedIngredients = await this.aggregateIngredientsFromMealPlan(mealPlan);

        // Create shopping list items
        for (const item of aggregatedIngredients) {
            await this.prisma.shoppingListItem.create({
                data: {
                    shoppingListId: shoppingList.id,
                    ingredientId: item.ingredientId,
                    quantity: item.quantity,
                    unit: item.unit as any,
                    checked: false,
                },
            });
        }

        return this.findOne(shoppingList.id, userId);
    }

    private async aggregateIngredientsFromMealPlan(mealPlan: any): Promise<AggregatedIngredient[]> {
        const ingredientMap = new Map<string, AggregatedIngredient>();

        // Process each recipe in the meal plan
        for (const mealPlanRecipe of mealPlan.recipes) {
            const recipe = mealPlanRecipe.recipe;
            const recipeServings = recipe.servings;
            const mealPlanServings = mealPlanRecipe.servings;

            // Calculate serving ratio
            const ratio = mealPlanServings / recipeServings;

            // Process each ingredient in the recipe
            for (const recipeIngredient of recipe.ingredients) {
                const ingredientId = recipeIngredient.ingredientId;
                const adjustedQuantity = Number(recipeIngredient.quantity) * ratio;
                const unit = recipeIngredient.unit;

                // Consolidate ingredients
                if (ingredientMap.has(ingredientId)) {
                    const existing = ingredientMap.get(ingredientId)!;
                    // Only sum if units match (future: add unit conversion)
                    if (existing.unit === unit) {
                        existing.quantity += adjustedQuantity;
                    } else {
                        // For now, create separate entry if units differ
                        // In production, would implement unit conversion
                        const key = `${ingredientId}-${unit}`;
                        if (ingredientMap.has(key)) {
                            ingredientMap.get(key)!.quantity += adjustedQuantity;
                        } else {
                            ingredientMap.set(key, {
                                ingredientId,
                                quantity: adjustedQuantity,
                                unit,
                            });
                        }
                    }
                } else {
                    ingredientMap.set(ingredientId, {
                        ingredientId,
                        quantity: adjustedQuantity,
                        unit,
                    });
                }
            }
        }

        return Array.from(ingredientMap.values());
    }

    async findAll(userId: string) {
        return this.prisma.shoppingList.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                },
                mealPlan: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, userId: string) {
        const shoppingList = await this.prisma.shoppingList.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                    orderBy: {
                        ingredient: {
                            name: 'asc',
                        },
                    },
                },
                mealPlan: true,
            },
        });

        if (!shoppingList) {
            throw new NotFoundException('Shopping list not found');
        }

        if (shoppingList.userId !== userId) {
            throw new ForbiddenException('You do not have access to this shopping list');
        }

        return shoppingList;
    }

    async findOneGrouped(id: string, userId: string) {
        const shoppingList = await this.findOne(id, userId);

        // Group items by ingredient category
        const grouped = shoppingList.items.reduce((acc: any, item: any) => {
            const category = item.ingredient.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        return {
            ...shoppingList,
            itemsGrouped: grouped,
        };
    }

    async update(id: string, userId: string, updateShoppingListDto: UpdateShoppingListDto) {
        await this.findOne(id, userId); // Check access

        return this.prisma.shoppingList.update({
            where: { id },
            data: {
                title: updateShoppingListDto.title,
            },
            include: {
                items: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId); // Check access

        return this.prisma.shoppingList.delete({
            where: { id },
        });
    }

    async updateItem(shoppingListId: string, itemId: string, userId: string, updateItemDto: UpdateItemDto) {
        await this.findOne(shoppingListId, userId); // Check access

        const item = await this.prisma.shoppingListItem.findUnique({
            where: { id: itemId },
        });

        if (!item || item.shoppingListId !== shoppingListId) {
            throw new NotFoundException('Item not found in shopping list');
        }

        return this.prisma.shoppingListItem.update({
            where: { id: itemId },
            data: {
                checked: updateItemDto.checked,
                quantity: updateItemDto.quantity,
            },
            include: {
                ingredient: true,
            },
        });
    }

    async removeItem(shoppingListId: string, itemId: string, userId: string) {
        await this.findOne(shoppingListId, userId); // Check access

        const item = await this.prisma.shoppingListItem.findUnique({
            where: { id: itemId },
        });

        if (!item || item.shoppingListId !== shoppingListId) {
            throw new NotFoundException('Item not found in shopping list');
        }

        return this.prisma.shoppingListItem.delete({
            where: { id: itemId },
        });
    }
}

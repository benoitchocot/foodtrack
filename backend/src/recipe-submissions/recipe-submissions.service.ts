import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecipesService } from '../recipes/recipes.service';
import { SubmitRecipeDto } from './dto/submit-recipe.dto';
import { RecipeSubmissionStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecipeSubmissionsService {
    constructor(
        private prisma: PrismaService,
        private recipesService: RecipesService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) {}

    async submit(userId: string, submitDto: SubmitRecipeDto) {
        // If recipeId is provided, verify the recipe exists
        if (submitDto.recipeId) {
            const recipe = await this.prisma.recipe.findUnique({
                where: { id: submitDto.recipeId },
            });
            if (!recipe) {
                throw new NotFoundException('Recipe not found');
            }
        }

        // Generate unique approval token
        const approvalToken = randomBytes(32).toString('hex');

        // Create submission
        const submission = await this.prisma.recipeSubmission.create({
            data: {
                userId,
                approvalToken,
                status: RecipeSubmissionStatus.PENDING,
                recipeId: submitDto.recipeId || null,
                title: submitDto.title,
                description: submitDto.description,
                imageUrl: submitDto.imageUrl,
                prepTime: submitDto.prepTime,
                cookTime: submitDto.cookTime,
                difficulty: submitDto.difficulty,
                servings: submitDto.servings,
                tags: submitDto.tags || [],
                toolsRequired: submitDto.toolsRequired || [],
                dietTypes: submitDto.dietTypes || [],
                ingredients: {
                    create: await Promise.all(
                        submitDto.ingredients.map(async (ing) => {
                            // Try to find existing ingredient by name
                            let ingredientId = ing.ingredientId;
                            if (!ingredientId) {
                                const existing = await this.prisma.ingredient.findFirst({
                                    where: {
                                        name: {
                                            equals: ing.ingredientName,
                                            mode: 'insensitive',
                                        },
                                    },
                                });
                                if (existing) {
                                    ingredientId = existing.id;
                                }
                            }

                            return {
                                ingredientId,
                                ingredientName: ing.ingredientName,
                                quantity: ing.quantity,
                                unit: ing.unit,
                                optional: ing.optional || false,
                            };
                        }),
                    ),
                },
                steps: {
                    create: submitDto.steps.map((step) => ({
                        stepNumber: step.stepNumber,
                        instruction: step.instruction,
                    })),
                },
            },
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
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Send approval email
        const approvalUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3001'}/recipe-submissions/approve/${approvalToken}`;
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        
        if (adminEmail) {
            await this.emailService.sendApprovalEmail(
                adminEmail,
                submission.id,
                submission.title,
                submission.user.email || 'Unknown',
                approvalUrl,
            );
        }

        return submission;
    }

    async findByToken(token: string) {
        const submission = await this.prisma.recipeSubmission.findUnique({
            where: { approvalToken: token },
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
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!submission) {
            throw new NotFoundException('Recipe submission not found');
        }

        return submission;
    }

    async approve(token: string) {
        const submission = await this.findByToken(token);

        if (submission.status !== RecipeSubmissionStatus.PENDING) {
            throw new BadRequestException('This submission has already been reviewed');
        }

        // Create ingredients that don't exist yet
        const ingredientMap = new Map<string, string>();
        for (const subIng of submission.ingredients) {
            if (!subIng.ingredientId && subIng.ingredientName) {
                // Check if ingredient already exists
                let ingredient = await this.prisma.ingredient.findFirst({
                    where: {
                        name: {
                            equals: subIng.ingredientName,
                            mode: 'insensitive',
                        },
                    },
                });

                if (!ingredient) {
                    // Create new ingredient (default category and unit)
                    ingredient = await this.prisma.ingredient.create({
                        data: {
                            name: subIng.ingredientName,
                            category: 'OTHER', // Default category
                            defaultUnit: 'PIECE', // Default unit
                        },
                    });
                }
                ingredientMap.set(subIng.id, ingredient.id);
            } else if (subIng.ingredientId) {
                ingredientMap.set(subIng.id, subIng.ingredientId);
            }
        }

        // If this is an edit submission, update the existing recipe; otherwise create a new one
        let recipe;
        if (submission.recipeId) {
            // Update existing recipe
            recipe = await this.recipesService.update(submission.recipeId, {
                title: submission.title,
                description: submission.description || undefined,
                imageUrl: submission.imageUrl || undefined,
                prepTime: submission.prepTime,
                cookTime: submission.cookTime,
                difficulty: submission.difficulty,
                servings: submission.servings,
                tags: submission.tags,
                toolsRequired: submission.toolsRequired,
                dietTypes: submission.dietTypes,
                ingredients: submission.ingredients.map((subIng: any) => {
                    const ingredientId = ingredientMap.get(subIng.id);
                    if (!ingredientId) {
                        throw new BadRequestException(`Ingredient not found for ${subIng.ingredientName}`);
                    }
                    return {
                        ingredientId,
                        quantity: Number(subIng.quantity),
                        unit: subIng.unit,
                        optional: subIng.optional,
                    };
                }),
                steps: submission.steps.map((step: any) => ({
                    stepNumber: step.stepNumber,
                    instruction: step.instruction,
                })),
            });
        } else {
            // Create new recipe
            recipe = await this.recipesService.create({
                title: submission.title,
                description: submission.description || undefined,
                imageUrl: submission.imageUrl || undefined,
                prepTime: submission.prepTime,
                cookTime: submission.cookTime,
                difficulty: submission.difficulty,
                servings: submission.servings,
                tags: submission.tags,
                toolsRequired: submission.toolsRequired,
                dietTypes: submission.dietTypes,
                ingredients: submission.ingredients.map((subIng: any) => {
                    const ingredientId = ingredientMap.get(subIng.id);
                    if (!ingredientId) {
                        throw new BadRequestException(`Ingredient not found for ${subIng.ingredientName}`);
                    }
                    return {
                        ingredientId,
                        quantity: Number(subIng.quantity),
                        unit: subIng.unit,
                        optional: subIng.optional,
                    };
                }),
                steps: submission.steps.map((step: any) => ({
                    stepNumber: step.stepNumber,
                    instruction: step.instruction,
                })),
            });
        }

        // Update submission status
        await this.prisma.recipeSubmission.update({
            where: { id: submission.id },
            data: {
                status: RecipeSubmissionStatus.APPROVED,
                reviewedAt: new Date(),
            },
        });

        return recipe;
    }

    async reject(token: string, rejectionReason?: string) {
        const submission = await this.findByToken(token);

        if (submission.status !== RecipeSubmissionStatus.PENDING) {
            throw new BadRequestException('This submission has already been reviewed');
        }

        await this.prisma.recipeSubmission.update({
            where: { id: submission.id },
            data: {
                status: RecipeSubmissionStatus.REJECTED,
                reviewedAt: new Date(),
                rejectionReason,
            },
        });

        return { message: 'Recipe submission rejected' };
    }
}


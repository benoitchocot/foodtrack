import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createRecipeDto: CreateRecipeDto) {
    const slug = this.generateSlug(createRecipeDto.title);

    // Check if slug already exists
    const existing = await this.prisma.recipe.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('A recipe with this title already exists');
    }

    // Create recipe with nested ingredients and steps
    return this.prisma.recipe.create({
      data: {
        title: createRecipeDto.title,
        slug,
        description: createRecipeDto.description,
        imageUrl: createRecipeDto.imageUrl,
        prepTime: createRecipeDto.prepTime,
        cookTime: createRecipeDto.cookTime,
        difficulty: createRecipeDto.difficulty,
        servings: createRecipeDto.servings,
        tags: createRecipeDto.tags || [],
        toolsRequired: createRecipeDto.toolsRequired || [],
        dietTypes: createRecipeDto.dietTypes || [],
        ingredients: {
          create: createRecipeDto.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            optional: ing.optional || false,
          })),
        },
        steps: {
          create: createRecipeDto.steps.map((step) => ({
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
      },
    });
  }

  async findAll(query: RecipeQueryDto) {
    const { search, dietTypes, difficulty, maxPrepTime, toolsRequired, tags, page = 1, limit = 20 } = query;

    const where: any = {};

    // Search by title or description (case-insensitive)
    if (search && search.trim()) {
      where.OR = [
        {
          title: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filter by diet types (recipe must match ALL specified diet types)
    if (dietTypes && dietTypes.length > 0) {
      where.dietTypes = {
        hasEvery: dietTypes,
      };
    }

    // Filter by difficulty
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Filter by max prep time
    if (maxPrepTime) {
      where.prepTime = {
        lte: maxPrepTime,
      };
    }

    // Filter by tools required (recipe must not require tools user doesn't have)
    if (toolsRequired && toolsRequired.length > 0) {
      where.toolsRequired = {
        hasSome: toolsRequired,
      };
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      data: recipes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
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
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async findBySlug(slug: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
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
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    await this.findOne(id); // Check if exists

    const updateData: any = {
      title: updateRecipeDto.title,
      description: updateRecipeDto.description,
      imageUrl: updateRecipeDto.imageUrl,
      prepTime: updateRecipeDto.prepTime,
      cookTime: updateRecipeDto.cookTime,
      difficulty: updateRecipeDto.difficulty,
      servings: updateRecipeDto.servings,
      tags: updateRecipeDto.tags,
      toolsRequired: updateRecipeDto.toolsRequired,
      dietTypes: updateRecipeDto.dietTypes,
    };

    // Update slug if title changed
    if (updateRecipeDto.title) {
      updateData.slug = this.generateSlug(updateRecipeDto.title);
    }

    // If ingredients are provided, replace them
    if (updateRecipeDto.ingredients) {
      // Delete existing ingredients
      await this.prisma.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });

      updateData.ingredients = {
        create: updateRecipeDto.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          optional: ing.optional || false,
        })),
      };
    }

    // If steps are provided, replace them
    if (updateRecipeDto.steps) {
      // Delete existing steps
      await this.prisma.recipeStep.deleteMany({
        where: { recipeId: id },
      });

      updateData.steps = {
        create: updateRecipeDto.steps.map((step) => ({
          stepNumber: step.stepNumber,
          instruction: step.instruction,
        })),
      };
    }

    return this.prisma.recipe.update({
      where: { id },
      data: updateData,
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
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.recipe.delete({
      where: { id },
    });
  }

  // Helper method to adjust ingredient quantities based on servings
  async getRecipeWithAdjustedServings(id: string, targetServings: number) {
    const recipe = await this.findOne(id);
    const ratio = targetServings / recipe.servings;

    return {
      ...recipe,
      servings: targetServings,
      ingredients: recipe.ingredients.map((ri) => ({
        ...ri,
        quantity: Number(ri.quantity) * ratio,
      })),
    };
  }
}

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
        isAdaptable: createRecipeDto.isAdaptable !== undefined ? createRecipeDto.isAdaptable : true,
        tags: createRecipeDto.tags || [],
        toolsRequired: createRecipeDto.toolsRequired || [],
        dietTypes: createRecipeDto.dietTypes || [],
        calories: createRecipeDto.calories ?? null,
        carbohydrates: createRecipeDto.carbohydrates ?? null,
        fats: createRecipeDto.fats ?? null,
        proteins: createRecipeDto.proteins ?? null,
        fibers: createRecipeDto.fibers ?? null,
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
    const { search, dietTypes, difficulty, maxPrepTime, toolsRequired, tags, page = 1, limit = 20, sortBy = 'createdAt' } = query;

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

    // Handle sorting
    let orderBy: any = { createdAt: 'desc' }; // Default
    
    if (sortBy === 'rating') {
      // For rating sort, we need to calculate average rating
      // We'll fetch all matching recipes first, calculate ratings, then sort and paginate
      const allRecipes = await this.prisma.recipe.findMany({
        where,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      // Calculate average rating for each recipe
      const recipesWithRating = allRecipes.map(recipe => {
        const ratings = recipe.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;
        return {
          ...recipe,
          averageRating: avgRating,
          reviewCount: ratings.length,
        };
      });

      // Sort by average rating (descending)
      recipesWithRating.sort((a, b) => b.averageRating - a.averageRating);

      // Paginate
      const total = recipesWithRating.length;
      const paginatedRecipes = recipesWithRating.slice(skip, skip + limit);

      // Fetch full recipe details for paginated results
      const recipeIds = paginatedRecipes.map(r => r.id);
      const recipes = await this.prisma.recipe.findMany({
        where: {
          ...where,
          id: { in: recipeIds },
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
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      // Maintain sort order and add rating info
      const sortedRecipes = recipeIds.map(id => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return null;
        const ratings = recipe.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;
        return {
          ...recipe,
          averageRating: avgRating,
          reviewCount: ratings.length,
        };
      }).filter(Boolean);

      return {
        data: sortedRecipes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } else {
      // Standard sorting
      if (sortBy === 'title') {
        orderBy = { title: 'asc' };
      } else {
        orderBy = { createdAt: 'desc' };
      }

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
            reviews: {
              select: {
                rating: true,
              },
            },
          },
          orderBy,
        }),
        this.prisma.recipe.count({ where }),
      ]);

      // Calculate average rating for each recipe
      const recipesWithRating = recipes.map(recipe => {
        const ratings = recipe.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;
        const reviewCount = ratings.length;
        
        return {
          ...recipe,
          averageRating: avgRating,
          reviewCount,
        };
      });

      return {
        data: recipesWithRating,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
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
      isAdaptable: updateRecipeDto.isAdaptable,
      tags: updateRecipeDto.tags,
      toolsRequired: updateRecipeDto.toolsRequired,
      dietTypes: updateRecipeDto.dietTypes,
      calories: updateRecipeDto.calories !== undefined ? updateRecipeDto.calories : undefined,
      carbohydrates: updateRecipeDto.carbohydrates !== undefined ? updateRecipeDto.carbohydrates : undefined,
      fats: updateRecipeDto.fats !== undefined ? updateRecipeDto.fats : undefined,
      proteins: updateRecipeDto.proteins !== undefined ? updateRecipeDto.proteins : undefined,
      fibers: updateRecipeDto.fibers !== undefined ? updateRecipeDto.fibers : undefined,
    };
    
    // Remove undefined values to avoid overwriting with undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

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

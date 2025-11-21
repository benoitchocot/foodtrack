import { PrismaClient, IngredientCategory, Unit, Difficulty, DietType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data (only if tables exist)
    console.log('Clearing existing data...');
    try {
        await prisma.recipeStep.deleteMany();
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.log('⚠️  recipe_steps table does not exist yet, skipping...');
        } else {
            throw error;
        }
    }
    
    try {
        await prisma.recipeIngredient.deleteMany();
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.log('⚠️  recipe_ingredients table does not exist yet, skipping...');
        } else {
            throw error;
        }
    }
    
    try {
        await prisma.recipe.deleteMany();
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.log('⚠️  recipes table does not exist yet, skipping...');
        } else {
            throw error;
        }
    }
    
    try {
        await prisma.ingredient.deleteMany();
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.log('⚠️  ingredients table does not exist yet, skipping...');
        } else {
            throw error;
        }
    }

    // Seed Ingredients
    console.log('Seeding ingredients...');
    try {
        await prisma.ingredient.createMany({
            skipDuplicates: true,
            data: [
            // Fresh vegetables
            { name: 'tomate', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'oignon', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'ail', category: IngredientCategory.FRESH, defaultUnit: Unit.CLOVE },
            { name: 'carotte', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'poivron', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'courgette', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'aubergine', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'pomme de terre', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'salade', category: IngredientCategory.FRESH, defaultUnit: Unit.BUNCH },
            { name: 'champignon', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'brocoli', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'chou-fleur', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'épinard', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'poireau', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'céleri', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },
            { name: 'persil', category: IngredientCategory.FRESH, defaultUnit: Unit.BUNCH },
            { name: 'basilic', category: IngredientCategory.FRESH, defaultUnit: Unit.BUNCH },
            { name: 'coriandre', category: IngredientCategory.FRESH, defaultUnit: Unit.BUNCH },
            { name: 'citron', category: IngredientCategory.FRESH, defaultUnit: Unit.PIECE },

            // Meat
            { name: 'poulet', category: IngredientCategory.MEAT, defaultUnit: Unit.G },
            { name: 'boeuf haché', category: IngredientCategory.MEAT, defaultUnit: Unit.G },
            { name: 'lardons', category: IngredientCategory.MEAT, defaultUnit: Unit.G },
            { name: 'saucisse', category: IngredientCategory.MEAT, defaultUnit: Unit.PIECE },
            { name: 'jambon', category: IngredientCategory.MEAT, defaultUnit: Unit.SLICE },

            // Fish
            { name: 'saumon', category: IngredientCategory.FISH, defaultUnit: Unit.G },
            { name: 'thon', category: IngredientCategory.FISH, defaultUnit: Unit.G },
            { name: 'cabillaud', category: IngredientCategory.FISH, defaultUnit: Unit.G },

            // Dairy
            { name: 'lait', category: IngredientCategory.DAIRY, defaultUnit: Unit.ML },
            { name: 'crème fraîche', category: IngredientCategory.DAIRY, defaultUnit: Unit.ML },
            { name: 'beurre', category: IngredientCategory.DAIRY, defaultUnit: Unit.G },
            { name: 'fromage râpé', category: IngredientCategory.DAIRY, defaultUnit: Unit.G },
            { name: 'parmesan', category: IngredientCategory.DAIRY, defaultUnit: Unit.G },
            { name: 'mozzarella', category: IngredientCategory.DAIRY, defaultUnit: Unit.G },
            { name: 'yaourt', category: IngredientCategory.DAIRY, defaultUnit: Unit.G },
            { name: 'oeuf', category: IngredientCategory.DAIRY, defaultUnit: Unit.PIECE },

            // Pantry
            { name: 'pâtes', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'riz', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'farine', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'sucre', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'huile d\'olive', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'huile végétale', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'vinaigre', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'moutarde', category: IngredientCategory.PANTRY, defaultUnit: Unit.TSP },
            { name: 'miel', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'sauce soja', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'bouillon de légumes', category: IngredientCategory.PANTRY, defaultUnit: Unit.ML },
            { name: 'bouillon de poulet', category: IngredientCategory.PANTRY, defaultUnit: Unit.ML },
            { name: 'tomate concassée', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'pâte de tomate', category: IngredientCategory.PANTRY, defaultUnit: Unit.TBSP },
            { name: 'lentilles', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'pois chiches', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'haricots rouges', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'quinoa', category: IngredientCategory.PANTRY, defaultUnit: Unit.G },
            { name: 'pain', category: IngredientCategory.BAKERY, defaultUnit: Unit.SLICE },
            { name: 'pâte feuilletée', category: IngredientCategory.FROZEN, defaultUnit: Unit.PIECE },
            { name: 'petits pois', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'maïs', category: IngredientCategory.FRESH, defaultUnit: Unit.G },
            { name: 'crevettes', category: IngredientCategory.FISH, defaultUnit: Unit.G },
            { name: 'vanille', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
            { name: 'aneth', category: IngredientCategory.SPICES, defaultUnit: Unit.BUNCH },

            // Spices
            { name: 'sel', category: IngredientCategory.SPICES, defaultUnit: Unit.PINCH },
            { name: 'poivre', category: IngredientCategory.SPICES, defaultUnit: Unit.PINCH },
            { name: 'paprika', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
            { name: 'cumin', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
            { name: 'curry', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
            { name: 'thym', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
            { name: 'laurier', category: IngredientCategory.SPICES, defaultUnit: Unit.PIECE },
            { name: 'herbes de provence', category: IngredientCategory.SPICES, defaultUnit: Unit.TSP },
        ],
        });
        console.log('✅ Ingredients seeded');
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.log('⚠️  ingredients table does not exist yet, skipping seed...');
            return;
        } else {
            throw error;
        }
    }

    // Get all ingredients for recipes
    const allIngredients = await prisma.ingredient.findMany();
    const getIngredient = (name: string) => allIngredients.find((i) => i.name === name)!;

    // Seed Recipes
    console.log('Seeding recipes...');

    // Recipe 1: Pâtes Carbonara
    await prisma.recipe.create({
        data: {
            title: 'Pâtes Carbonara',
            slug: 'pates-carbonara',
            description: 'Un grand classique italien, crémeux et savoureux',
            prepTime: 10,
            cookTime: 15,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['quick', 'italian', 'comfort_food'],
            toolsRequired: ['casserole'],
            dietTypes: [],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('pâtes').id, quantity: 100, unit: Unit.G },
                    { ingredientId: getIngredient('lardons').id, quantity: 50, unit: Unit.G },
                    { ingredientId: getIngredient('oeuf').id, quantity: 1, unit: Unit.PIECE },
                    { ingredientId: getIngredient('parmesan').id, quantity: 25, unit: Unit.G },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Faire cuire les pâtes dans une grande casserole d\'eau bouillante salée.' },
                    { stepNumber: 2, instruction: 'Pendant ce temps, faire revenir les lardons dans une poêle sans matière grasse.' },
                    { stepNumber: 3, instruction: 'Dans un bol, battre les oeufs avec le parmesan râpé, du sel et du poivre.' },
                    { stepNumber: 4, instruction: 'Égoutter les pâtes en gardant un peu d\'eau de cuisson.' },
                    { stepNumber: 5, instruction: 'Mélanger les pâtes chaudes avec les lardons, retirer du feu et ajouter le mélange oeufs-parmesan. Mélanger rapidement.' },
                    { stepNumber: 6, instruction: 'Ajouter un peu d\'eau de cuisson si nécessaire pour obtenir une sauce crémeuse. Servir immédiatement.' },
                ],
            },
        },
    });

    // Recipe 2: Ratatouille
    await prisma.recipe.create({
        data: {
            title: 'Ratatouille Provençale',
            slug: 'ratatouille-provencale',
            description: 'Un plat végétarien aux saveurs du sud de la France',
            prepTime: 20,
            cookTime: 40,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['vegetarian', 'healthy', 'french'],
            toolsRequired: ['casserole'],
            dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('aubergine').id, quantity: 0.33, unit: Unit.PIECE },
                    { ingredientId: getIngredient('courgette').id, quantity: 0.33, unit: Unit.PIECE },
                    { ingredientId: getIngredient('poivron').id, quantity: 0.33, unit: Unit.PIECE },
                    { ingredientId: getIngredient('tomate').id, quantity: 0.67, unit: Unit.PIECE },
                    { ingredientId: getIngredient('oignon').id, quantity: 0.33, unit: Unit.PIECE },
                    { ingredientId: getIngredient('ail').id, quantity: 0.5, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('huile d\'olive').id, quantity: 0.67, unit: Unit.TBSP },
                    { ingredientId: getIngredient('herbes de provence').id, quantity: 0.33, unit: Unit.TSP },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Couper tous les légumes en dés de taille similaire.' },
                    { stepNumber: 2, instruction: 'Faire revenir l\'oignon et l\'ail dans l\'huile d\'olive.' },
                    { stepNumber: 3, instruction: 'Ajouter les aubergines et faire cuire 5 minutes.' },
                    { stepNumber: 4, instruction: 'Ajouter les courgettes et les poivrons, cuire 5 minutes supplémentaires.' },
                    { stepNumber: 5, instruction: 'Ajouter les tomates, les herbes, le sel et le poivre.' },
                    { stepNumber: 6, instruction: 'Couvrir et laisser mijoter 30 minutes à feu doux en remuant de temps en temps.' },
                ],
            },
        },
    });

    // Recipe 3: Poulet Rôti
    await prisma.recipe.create({
        data: {
            title: 'Poulet Rôti aux Herbes',
            slug: 'poulet-roti-aux-herbes',
            description: 'Un poulet doré et juteux, parfait pour un repas en famille',
            prepTime: 15,
            cookTime: 60,
            difficulty: Difficulty.MEDIUM,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['sunday_roast', 'family'],
            toolsRequired: ['oven'],
            dietTypes: [],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('poulet').id, quantity: 375, unit: Unit.G },
                    { ingredientId: getIngredient('beurre').id, quantity: 12.5, unit: Unit.G },
                    { ingredientId: getIngredient('ail').id, quantity: 1, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('thym').id, quantity: 0.5, unit: Unit.TSP },
                    { ingredientId: getIngredient('citron').id, quantity: 0.25, unit: Unit.PIECE },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Préchauffer le four à 200°C.' },
                    { stepNumber: 2, instruction: 'Mélanger le beurre ramolli avec l\'ail écrasé et le thym.' },
                    { stepNumber: 3, instruction: 'Glisser le beurre aux herbes sous la peau du poulet.' },
                    { stepNumber: 4, instruction: 'Placer le citron coupé en deux à l\'intérieur du poulet.' },
                    { stepNumber: 5, instruction: 'Saler et poivrer généreusement l\'extérieur du poulet.' },
                    { stepNumber: 6, instruction: 'Enfourner pour 1h en arrosant régulièrement avec le jus de cuisson.' },
                    { stepNumber: 7, instruction: 'Laisser reposer 10 minutes avant de découper.' },
                ],
            },
        },
    });

    // Recipe 4: Soupe de Lentilles
    await prisma.recipe.create({
        data: {
            title: 'Soupe de Lentilles Réconfortante',
            slug: 'soupe-de-lentilles-reconfortante',
            description: 'Une soupe nourrissante et saine, parfaite pour l\'hiver',
            prepTime: 10,
            cookTime: 35,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['soup', 'healthy', 'batch_cooking'],
            toolsRequired: ['casserole'],
            dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('lentilles').id, quantity: 50, unit: Unit.G },
                    { ingredientId: getIngredient('carotte').id, quantity: 0.5, unit: Unit.PIECE },
                    { ingredientId: getIngredient('oignon').id, quantity: 0.17, unit: Unit.PIECE },
                    { ingredientId: getIngredient('ail').id, quantity: 0.33, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('tomate concassée').id, quantity: 67, unit: Unit.G },
                    { ingredientId: getIngredient('bouillon de légumes').id, quantity: 167, unit: Unit.ML },
                    { ingredientId: getIngredient('cumin').id, quantity: 0.17, unit: Unit.TSP },
                    { ingredientId: getIngredient('huile d\'olive').id, quantity: 0.33, unit: Unit.TBSP },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Faire revenir l\'oignon et l\'ail émincés dans l\'huile d\'olive.' },
                    { stepNumber: 2, instruction: 'Ajouter les carottes coupées en dés et faire revenir 5 minutes.' },
                    { stepNumber: 3, instruction: 'Ajouter les lentilles rincées, les tomates concassées et le bouillon.' },
                    { stepNumber: 4, instruction: 'Ajouter le cumin, le sel et le poivre.' },
                    { stepNumber: 5, instruction: 'Porter à ébullition puis réduire le feu et laisser mijoter 30 minutes.' },
                    { stepNumber: 6, instruction: 'Mixer partiellement pour obtenir une texture crémeuse tout en gardant des morceaux.' },
                ],
            },
        },
    });

    // Recipe 5: Quiche Lorraine
    await prisma.recipe.create({
        data: {
            title: 'Quiche Lorraine',
            slug: 'quiche-lorraine',
            description: 'La quiche traditionnelle française aux lardons',
            prepTime: 15,
            cookTime: 40,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['french', 'classic'],
            toolsRequired: ['oven'],
            dietTypes: [],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('pâte feuilletée').id, quantity: 0.17, unit: Unit.PIECE },
                    { ingredientId: getIngredient('lardons').id, quantity: 33, unit: Unit.G },
                    { ingredientId: getIngredient('oeuf').id, quantity: 0.5, unit: Unit.PIECE },
                    { ingredientId: getIngredient('crème fraîche').id, quantity: 33, unit: Unit.ML },
                    { ingredientId: getIngredient('lait').id, quantity: 17, unit: Unit.ML },
                    { ingredientId: getIngredient('fromage râpé').id, quantity: 17, unit: Unit.G },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Préchauffer le four à 180°C.' },
                    { stepNumber: 2, instruction: 'Étaler la pâte dans un moule à tarte et piquer le fond avec une fourchette.' },
                    { stepNumber: 3, instruction: 'Faire revenir les lardons dans une poêle sans matière grasse.' },
                    { stepNumber: 4, instruction: 'Battre les oeufs avec la crème fraîche et le lait.' },
                    { stepNumber: 5, instruction: 'Disposer les lardons sur la pâte, verser le mélange oeufs-crème et parsemer de fromage.' },
                    { stepNumber: 6, instruction: 'Enfourner pour 35-40 minutes jusqu\'à ce que la quiche soit dorée.' },
                ],
            },
        },
    });

    // Continue with more recipes...
    // Recipe 6: Curry de Légumes
    await prisma.recipe.create({
        data: {
            title: 'Curry de Légumes',
            slug: 'curry-de-legumes',
            description: 'Un curry végétarien épicé et parfumé',
            prepTime: 15,
            cookTime: 25,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['vegetarian', 'spicy', 'indian'],
            toolsRequired: ['casserole'],
            dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('pomme de terre').id, quantity: 75, unit: Unit.G },
                    { ingredientId: getIngredient('carotte').id, quantity: 0.5, unit: Unit.PIECE },
                    { ingredientId: getIngredient('chou-fleur').id, quantity: 75, unit: Unit.G },
                    { ingredientId: getIngredient('pois chiches').id, quantity: 100, unit: Unit.G },
                    { ingredientId: getIngredient('tomate concassée').id, quantity: 100, unit: Unit.G },
                    { ingredientId: getIngredient('oignon').id, quantity: 0.25, unit: Unit.PIECE },
                    { ingredientId: getIngredient('ail').id, quantity: 0.5, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('curry').id, quantity: 0.5, unit: Unit.TBSP },
                    { ingredientId: getIngredient('huile végétale').id, quantity: 0.5, unit: Unit.TBSP },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Faire revenir l\'oignon et l\'ail dans l\'huile.' },
                    { stepNumber: 2, instruction: 'Ajouter le curry et faire revenir 1 minute.' },
                    { stepNumber: 3, instruction: 'Ajouter tous les légumes coupés en morceaux.' },
                    { stepNumber: 4, instruction: 'Ajouter les tomates concassées et les pois chiches égouttés.' },
                    { stepNumber: 5, instruction: 'Couvrir et laisser mijoter 20 minutes.' },
                    { stepNumber: 6, instruction: 'Servir avec du riz basmati.' },
                ],
            },
        },
    });

    // Recipe 7: Saumon Grillé
    await prisma.recipe.create({
        data: {
            title: 'Saumon Grillé au Citron',
            slug: 'saumon-grille-au-citron',
            description: 'Un plat de poisson simple et sain',
            prepTime: 5,
            cookTime: 15,
            difficulty: Difficulty.EASY,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['quick', 'healthy', 'fish'],
            toolsRequired: ['oven'],
            dietTypes: [DietType.PESCATARIAN],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('saumon').id, quantity: 150, unit: Unit.G },
                    { ingredientId: getIngredient('citron').id, quantity: 0.5, unit: Unit.PIECE },
                    { ingredientId: getIngredient('huile d\'olive').id, quantity: 0.5, unit: Unit.TBSP },
                    { ingredientId: getIngredient('ail').id, quantity: 0.5, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('persil').id, quantity: 0.25, unit: Unit.BUNCH },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Préchauffer le four à 200°C.' },
                    { stepNumber: 2, instruction: 'Placer les pavés de saumon dans un plat.' },
                    { stepNumber: 3, instruction: 'Arroser d\'huile d\'olive et de jus de citron.' },
                    { stepNumber: 4, instruction: 'Parsemer d\'ail émincé et de persil haché.' },
                    { stepNumber: 5, instruction: 'Saler, poivrer et enfourner pour 12-15 minutes.' },
                ],
            },
        },
    });

    // Recipe 8: Risotto aux Champignons
    await prisma.recipe.create({
        data: {
            title: 'Risotto aux Champignons',
            slug: 'risotto-aux-champignons',
            description: 'Un risotto crémeux et réconfortant',
            prepTime: 10,
            cookTime: 30,
            difficulty: Difficulty.MEDIUM,
            servings: 1, // Recipe for 1 person, quantities will be multiplied by householdSize
            tags: ['italian', 'comfort_food'],
            toolsRequired: ['casserole'],
            dietTypes: [DietType.VEGETARIAN],
            ingredients: {
                create: [
                    { ingredientId: getIngredient('riz').id, quantity: 75, unit: Unit.G },
                    { ingredientId: getIngredient('champignon').id, quantity: 100, unit: Unit.G },
                    { ingredientId: getIngredient('oignon').id, quantity: 0.25, unit: Unit.PIECE },
                    { ingredientId: getIngredient('ail').id, quantity: 0.5, unit: Unit.CLOVE },
                    { ingredientId: getIngredient('bouillon de légumes').id, quantity: 250, unit: Unit.ML },
                    { ingredientId: getIngredient('parmesan').id, quantity: 20, unit: Unit.G },
                    { ingredientId: getIngredient('beurre').id, quantity: 10, unit: Unit.G },
                    { ingredientId: getIngredient('huile d\'olive').id, quantity: 0.5, unit: Unit.TBSP },
                    { ingredientId: getIngredient('sel').id, quantity: 1, unit: Unit.PINCH },
                    { ingredientId: getIngredient('poivre').id, quantity: 1, unit: Unit.PINCH },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: 'Faire chauffer le bouillon et le maintenir chaud.' },
                    { stepNumber: 2, instruction: 'Faire revenir l\'oignon et l\'ail dans l\'huile et le beurre.' },
                    { stepNumber: 3, instruction: 'Ajouter les champignons émincés et faire revenir 5 minutes.' },
                    { stepNumber: 4, instruction: 'Ajouter le riz et nacrer pendant 2 minutes.' },
                    { stepNumber: 5, instruction: 'Ajouter le bouillon louche par louche en remuant constamment.' },
                    { stepNumber: 6, instruction: 'Après 20 minutes, incorporer le parmesan et un peu de beurre.' },
                    { stepNumber: 7, instruction: 'Laisser reposer 2 minutes avant de servir.' },
                ],
            },
        },
    });

    // Helper function to create recipes easily
    const createRecipe = async (data: {
        title: string;
        slug: string;
        description: string;
        prepTime: number;
        cookTime: number;
        difficulty: Difficulty;
        tags: string[];
        toolsRequired: string[];
        dietTypes: DietType[];
        ingredients: Array<{ name: string; quantity: number; unit: Unit; optional?: boolean }>;
        steps: Array<{ stepNumber: number; instruction: string }>;
    }) => {
        return prisma.recipe.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                prepTime: data.prepTime,
                cookTime: data.cookTime,
                difficulty: data.difficulty,
                servings: 1, // All recipes for 1 person
                tags: data.tags,
                toolsRequired: data.toolsRequired,
                dietTypes: data.dietTypes,
                ingredients: {
                    create: data.ingredients.map(ing => ({
                        ingredientId: getIngredient(ing.name).id,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        optional: ing.optional || false,
                    })),
                },
                steps: {
                    create: data.steps,
                },
            },
        });
    };

    // Add many more simple recipes
    console.log('Adding more simple recipes...');

    // Recipe 9: Omelette
    await createRecipe({
        title: 'Omelette Simple',
        slug: 'omelette-simple',
        description: 'Une omelette classique et rapide',
        prepTime: 2,
        cookTime: 5,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'oeuf', quantity: 2, unit: Unit.PIECE },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Battre les oeufs avec le sel et le poivre.' },
            { stepNumber: 2, instruction: 'Faire chauffer le beurre dans une poêle.' },
            { stepNumber: 3, instruction: 'Verser les oeufs battus et cuire 2-3 minutes.' },
            { stepNumber: 4, instruction: 'Plier l\'omelette en deux et servir.' },
        ],
    });

    // Recipe 10: Salade César
    await createRecipe({
        title: 'Salade César',
        slug: 'salade-cesar',
        description: 'Une salade fraîche et croquante',
        prepTime: 10,
        cookTime: 0,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'healthy'],
        toolsRequired: [],
        dietTypes: [],
        ingredients: [
            { name: 'salade', quantity: 0.5, unit: Unit.BUNCH },
            { name: 'poulet', quantity: 100, unit: Unit.G },
            { name: 'parmesan', quantity: 20, unit: Unit.G },
            { name: 'pain', quantity: 1, unit: Unit.SLICE },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Laver et couper la salade.' },
            { stepNumber: 2, instruction: 'Faire griller le poulet et le couper en dés.' },
            { stepNumber: 3, instruction: 'Faire des croûtons avec le pain.' },
            { stepNumber: 4, instruction: 'Mélanger la salade, le poulet, le parmesan et les croûtons.' },
            { stepNumber: 5, instruction: 'Arroser d\'huile d\'olive et servir.' },
        ],
    });

    // Recipe 11: Pâtes à la Tomate
    await createRecipe({
        title: 'Pâtes à la Tomate',
        slug: 'pates-a-la-tomate',
        description: 'Des pâtes simples avec une sauce tomate maison',
        prepTime: 5,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'italian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'tomate', quantity: 2, unit: Unit.PIECE },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'basilic', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes dans l\'eau bouillante salée.' },
            { stepNumber: 2, instruction: 'Faire revenir l\'ail dans l\'huile d\'olive.' },
            { stepNumber: 3, instruction: 'Ajouter les tomates coupées en dés et cuire 15 minutes.' },
            { stepNumber: 4, instruction: 'Ajouter le basilic haché.' },
            { stepNumber: 5, instruction: 'Mélanger avec les pâtes et servir.' },
        ],
    });

    // Recipe 12: Riz au Poulet
    await createRecipe({
        title: 'Riz au Poulet',
        slug: 'riz-au-poulet',
        description: 'Un plat simple et réconfortant',
        prepTime: 10,
        cookTime: 25,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'comfort_food'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'poulet', quantity: 120, unit: Unit.G },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'bouillon de poulet', quantity: 200, unit: Unit.ML },
            { name: 'huile végétale', quantity: 1, unit: Unit.TBSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire revenir le poulet coupé en dés dans l\'huile.' },
            { stepNumber: 2, instruction: 'Ajouter l\'oignon émincé et faire revenir 3 minutes.' },
            { stepNumber: 3, instruction: 'Ajouter le riz et faire nacrer 2 minutes.' },
            { stepNumber: 4, instruction: 'Verser le bouillon et laisser cuire 20 minutes à couvert.' },
        ],
    });

    // Recipe 13: Gratin de Courgettes
    await createRecipe({
        title: 'Gratin de Courgettes',
        slug: 'gratin-de-courgettes',
        description: 'Un gratin végétarien savoureux',
        prepTime: 15,
        cookTime: 35,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'french'],
        toolsRequired: ['oven'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'courgette', quantity: 1, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'crème fraîche', quantity: 50, unit: Unit.ML },
            { name: 'fromage râpé', quantity: 30, unit: Unit.G },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Préchauffer le four à 180°C.' },
            { stepNumber: 2, instruction: 'Couper les courgettes en rondelles et l\'oignon en lamelles.' },
            { stepNumber: 3, instruction: 'Faire revenir dans une poêle 5 minutes.' },
            { stepNumber: 4, instruction: 'Mélanger avec la crème, l\'ail, le sel et le poivre.' },
            { stepNumber: 5, instruction: 'Verser dans un plat, parsemer de fromage et enfourner 30 minutes.' },
        ],
    });

    // Recipe 14: Soupe de Légumes
    await createRecipe({
        title: 'Soupe de Légumes',
        slug: 'soupe-de-legumes',
        description: 'Une soupe simple et saine',
        prepTime: 10,
        cookTime: 25,
        difficulty: Difficulty.EASY,
        tags: ['soup', 'healthy', 'vegetarian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'carotte', quantity: 1, unit: Unit.PIECE },
            { name: 'courgette', quantity: 0.5, unit: Unit.PIECE },
            { name: 'pomme de terre', quantity: 1, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'bouillon de légumes', quantity: 300, unit: Unit.ML },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Couper tous les légumes en dés.' },
            { stepNumber: 2, instruction: 'Faire revenir l\'oignon dans une casserole.' },
            { stepNumber: 3, instruction: 'Ajouter les autres légumes et le bouillon.' },
            { stepNumber: 4, instruction: 'Porter à ébullition puis laisser mijoter 20 minutes.' },
            { stepNumber: 5, instruction: 'Mixer et assaisonner.' },
        ],
    });

    // Recipe 15: Pâtes au Thon
    await createRecipe({
        title: 'Pâtes au Thon',
        slug: 'pates-au-thon',
        description: 'Un plat rapide et économique',
        prepTime: 5,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'fish'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.PESCATARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'thon', quantity: 80, unit: Unit.G },
            { name: 'tomate concassée', quantity: 100, unit: Unit.G },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Faire revenir l\'ail dans l\'huile.' },
            { stepNumber: 3, instruction: 'Ajouter les tomates et le thon égoutté.' },
            { stepNumber: 4, instruction: 'Mélanger avec les pâtes et servir.' },
        ],
    });

    // Recipe 16: Oeufs Brouillés
    await createRecipe({
        title: 'Oeufs Brouillés',
        slug: 'oeufs-brouilles',
        description: 'Des oeufs brouillés crémeux',
        prepTime: 2,
        cookTime: 5,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'oeuf', quantity: 2, unit: Unit.PIECE },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'crème fraîche', quantity: 15, unit: Unit.ML },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Battre les oeufs avec la crème, le sel et le poivre.' },
            { stepNumber: 2, instruction: 'Faire fondre le beurre dans une poêle à feu doux.' },
            { stepNumber: 3, instruction: 'Verser les oeufs et remuer constamment avec une spatule.' },
            { stepNumber: 4, instruction: 'Retirer du feu quand ils sont crémeux mais encore légèrement liquides.' },
        ],
    });

    // Recipe 17: Salade de Tomates
    await createRecipe({
        title: 'Salade de Tomates',
        slug: 'salade-de-tomates',
        description: 'Une salade fraîche et simple',
        prepTime: 10,
        cookTime: 0,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'vegetarian', 'healthy'],
        toolsRequired: [],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'tomate', quantity: 2, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.25, unit: Unit.PIECE },
            { name: 'basilic', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'vinaigre', quantity: 0.5, unit: Unit.TBSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Couper les tomates en rondelles.' },
            { stepNumber: 2, instruction: 'Émincer l\'oignon finement.' },
            { stepNumber: 3, instruction: 'Disposer les tomates et l\'oignon dans une assiette.' },
            { stepNumber: 4, instruction: 'Arroser d\'huile et de vinaigre, saler et parsemer de basilic.' },
        ],
    });

    // Recipe 18: Poulet Sauté
    await createRecipe({
        title: 'Poulet Sauté aux Légumes',
        slug: 'poulet-saute-aux-legumes',
        description: 'Un plat équilibré et rapide',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'healthy'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'poulet', quantity: 120, unit: Unit.G },
            { name: 'courgette', quantity: 0.5, unit: Unit.PIECE },
            { name: 'poivron', quantity: 0.5, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'huile végétale', quantity: 1, unit: Unit.TBSP },
            { name: 'sauce soja', quantity: 1, unit: Unit.TBSP },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Couper le poulet et les légumes en morceaux.' },
            { stepNumber: 2, instruction: 'Faire revenir le poulet dans l\'huile 5 minutes.' },
            { stepNumber: 3, instruction: 'Ajouter les légumes et l\'ail, faire revenir 10 minutes.' },
            { stepNumber: 4, instruction: 'Ajouter la sauce soja et laisser mijoter 5 minutes.' },
        ],
    });

    // Recipe 19: Pâtes au Beurre
    await createRecipe({
        title: 'Pâtes au Beurre',
        slug: 'pates-au-beurre',
        description: 'Le plat simple par excellence',
        prepTime: 2,
        cookTime: 12,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'beurre', quantity: 20, unit: Unit.G },
            { name: 'parmesan', quantity: 15, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes dans l\'eau bouillante salée.' },
            { stepNumber: 2, instruction: 'Égoutter et mélanger avec le beurre.' },
            { stepNumber: 3, instruction: 'Parsemer de parmesan et servir.' },
        ],
    });

    // Recipe 20: Riz Cantonnais
    await createRecipe({
        title: 'Riz Cantonnais',
        slug: 'riz-cantonnais',
        description: 'Un riz sauté aux légumes et oeuf',
        prepTime: 10,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'oeuf', quantity: 1, unit: Unit.PIECE },
            { name: 'petits pois', quantity: 30, unit: Unit.G },
            { name: 'jambon', quantity: 2, unit: Unit.SLICE },
            { name: 'huile végétale', quantity: 1, unit: Unit.TBSP },
            { name: 'sauce soja', quantity: 1, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire le riz et laisser refroidir.' },
            { stepNumber: 2, instruction: 'Faire une omelette avec l\'oeuf et la couper en lanières.' },
            { stepNumber: 3, instruction: 'Faire revenir le jambon et les petits pois dans l\'huile.' },
            { stepNumber: 4, instruction: 'Ajouter le riz froid et l\'omelette, faire sauter 5 minutes.' },
            { stepNumber: 5, instruction: 'Ajouter la sauce soja et servir.' },
        ],
    });

    // Recipe 21: Gratin Dauphinois
    await createRecipe({
        title: 'Gratin Dauphinois',
        slug: 'gratin-dauphinois',
        description: 'Un gratin de pommes de terre crémeux',
        prepTime: 15,
        cookTime: 60,
        difficulty: Difficulty.MEDIUM,
        tags: ['french', 'comfort_food'],
        toolsRequired: ['oven'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pomme de terre', quantity: 2, unit: Unit.PIECE },
            { name: 'crème fraîche', quantity: 100, unit: Unit.ML },
            { name: 'lait', quantity: 50, unit: Unit.ML },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Préchauffer le four à 180°C.' },
            { stepNumber: 2, instruction: 'Éplucher et couper les pommes de terre en fines rondelles.' },
            { stepNumber: 3, instruction: 'Mélanger la crème, le lait, l\'ail écrasé, le sel et le poivre.' },
            { stepNumber: 4, instruction: 'Disposer les pommes de terre dans un plat beurré en couches.' },
            { stepNumber: 5, instruction: 'Verser le mélange crème-lait et enfourner 1h.' },
        ],
    });

    // Recipe 22: Salade de Pâtes
    await createRecipe({
        title: 'Salade de Pâtes',
        slug: 'salade-de-pates',
        description: 'Une salade de pâtes fraîche et colorée',
        prepTime: 10,
        cookTime: 12,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'vegetarian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'tomate', quantity: 1, unit: Unit.PIECE },
            { name: 'mozzarella', quantity: 50, unit: Unit.G },
            { name: 'basilic', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'vinaigre', quantity: 0.5, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes et laisser refroidir.' },
            { stepNumber: 2, instruction: 'Couper la tomate et la mozzarella en dés.' },
            { stepNumber: 3, instruction: 'Mélanger les pâtes, la tomate, la mozzarella et le basilic.' },
            { stepNumber: 4, instruction: 'Arroser d\'huile et de vinaigre, mélanger et servir froid.' },
        ],
    });

    // Recipe 23: Omelette aux Champignons
    await createRecipe({
        title: 'Omelette aux Champignons',
        slug: 'omelette-aux-champignons',
        description: 'Une omelette garnie de champignons',
        prepTime: 5,
        cookTime: 8,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'vegetarian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'oeuf', quantity: 2, unit: Unit.PIECE },
            { name: 'champignon', quantity: 50, unit: Unit.G },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'persil', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire revenir les champignons dans le beurre 5 minutes.' },
            { stepNumber: 2, instruction: 'Battre les oeufs avec le sel.' },
            { stepNumber: 3, instruction: 'Verser les oeufs sur les champignons et cuire 3 minutes.' },
            { stepNumber: 4, instruction: 'Parsemer de persil et servir.' },
        ],
    });

    // Recipe 24: Pâtes à l\'Ail et au Piment
    await createRecipe({
        title: 'Pâtes à l\'Ail et au Piment',
        slug: 'pates-ail-piment',
        description: 'Des pâtes simples et épicées',
        prepTime: 5,
        cookTime: 12,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'spicy', 'vegetarian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'ail', quantity: 2, unit: Unit.CLOVE },
            { name: 'huile d\'olive', quantity: 2, unit: Unit.TBSP },
            { name: 'persil', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'paprika', quantity: 0.5, unit: Unit.TSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Faire chauffer l\'huile avec l\'ail émincé et le paprika.' },
            { stepNumber: 3, instruction: 'Égoutter les pâtes et les mélanger avec l\'huile parfumée.' },
            { stepNumber: 4, instruction: 'Parsemer de persil et servir.' },
        ],
    });

    // Recipe 25: Riz aux Légumes
    await createRecipe({
        title: 'Riz aux Légumes',
        slug: 'riz-aux-legumes',
        description: 'Un riz sauté aux légumes croquants',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'healthy'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'carotte', quantity: 0.5, unit: Unit.PIECE },
            { name: 'courgette', quantity: 0.5, unit: Unit.PIECE },
            { name: 'poivron', quantity: 0.5, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'huile végétale', quantity: 1, unit: Unit.TBSP },
            { name: 'sauce soja', quantity: 1, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire le riz et laisser refroidir.' },
            { stepNumber: 2, instruction: 'Couper tous les légumes en dés.' },
            { stepNumber: 3, instruction: 'Faire revenir les légumes dans l\'huile 10 minutes.' },
            { stepNumber: 4, instruction: 'Ajouter le riz froid et la sauce soja, faire sauter 5 minutes.' },
        ],
    });

    // Recipe 26: Soupe à l\'Oignon
    await createRecipe({
        title: 'Soupe à l\'Oignon',
        slug: 'soupe-a-l-oignon',
        description: 'La soupe traditionnelle française',
        prepTime: 10,
        cookTime: 40,
        difficulty: Difficulty.EASY,
        tags: ['soup', 'french'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'oignon', quantity: 2, unit: Unit.PIECE },
            { name: 'beurre', quantity: 20, unit: Unit.G },
            { name: 'bouillon de légumes', quantity: 300, unit: Unit.ML },
            { name: 'pain', quantity: 1, unit: Unit.SLICE },
            { name: 'fromage râpé', quantity: 20, unit: Unit.G },
            { name: 'thym', quantity: 0.5, unit: Unit.TSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Émincer finement les oignons.' },
            { stepNumber: 2, instruction: 'Les faire revenir dans le beurre à feu doux 20 minutes jusqu\'à caramélisation.' },
            { stepNumber: 3, instruction: 'Ajouter le bouillon et le thym, laisser mijoter 15 minutes.' },
            { stepNumber: 4, instruction: 'Verser dans un bol, ajouter une tranche de pain et du fromage.' },
            { stepNumber: 5, instruction: 'Faire gratiner au four si possible.' },
        ],
    });

    // Recipe 27: Pâtes aux Légumes
    await createRecipe({
        title: 'Pâtes aux Légumes',
        slug: 'pates-aux-legumes',
        description: 'Des pâtes avec des légumes de saison',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'healthy'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'courgette', quantity: 0.5, unit: Unit.PIECE },
            { name: 'aubergine', quantity: 0.33, unit: Unit.PIECE },
            { name: 'tomate', quantity: 1, unit: Unit.PIECE },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'basilic', quantity: 0.25, unit: Unit.BUNCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Couper les légumes en dés et faire revenir dans l\'huile 15 minutes.' },
            { stepNumber: 3, instruction: 'Ajouter l\'ail et les tomates, cuire 5 minutes de plus.' },
            { stepNumber: 4, instruction: 'Mélanger avec les pâtes et le basilic.' },
        ],
    });

    // Recipe 28: Oeufs à la Coque
    await createRecipe({
        title: 'Oeufs à la Coque',
        slug: 'oeufs-a-la-coque',
        description: 'Des oeufs à la coque avec des mouillettes',
        prepTime: 2,
        cookTime: 4,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'oeuf', quantity: 2, unit: Unit.PIECE },
            { name: 'pain', quantity: 2, unit: Unit.SLICE },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire bouillir de l\'eau dans une casserole.' },
            { stepNumber: 2, instruction: 'Plonger les oeufs dans l\'eau bouillante 4 minutes.' },
            { stepNumber: 3, instruction: 'Pendant ce temps, faire griller le pain et le beurrer.' },
            { stepNumber: 4, instruction: 'Servir les oeufs avec les mouillettes de pain.' },
        ],
    });

    // Recipe 29: Salade Composée
    await createRecipe({
        title: 'Salade Composée',
        slug: 'salade-composee',
        description: 'Une salade équilibrée avec plusieurs ingrédients',
        prepTime: 15,
        cookTime: 0,
        difficulty: Difficulty.EASY,
        tags: ['healthy', 'vegetarian'],
        toolsRequired: [],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'salade', quantity: 0.5, unit: Unit.BUNCH },
            { name: 'tomate', quantity: 1, unit: Unit.PIECE },
            { name: 'oeuf', quantity: 1, unit: Unit.PIECE },
            { name: 'jambon', quantity: 2, unit: Unit.SLICE },
            { name: 'fromage râpé', quantity: 15, unit: Unit.G },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'vinaigre', quantity: 0.5, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Laver et couper la salade.' },
            { stepNumber: 2, instruction: 'Faire cuire l\'oeuf dur et le couper en quartiers.' },
            { stepNumber: 3, instruction: 'Couper la tomate et le jambon en morceaux.' },
            { stepNumber: 4, instruction: 'Disposer tous les ingrédients dans une assiette.' },
            { stepNumber: 5, instruction: 'Arroser d\'huile et de vinaigre, parsemer de fromage.' },
        ],
    });

    // Recipe 30: Riz au Lait
    await createRecipe({
        title: 'Riz au Lait',
        slug: 'riz-au-lait',
        description: 'Un dessert crémeux et réconfortant',
        prepTime: 5,
        cookTime: 30,
        difficulty: Difficulty.EASY,
        tags: ['dessert'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'riz', quantity: 50, unit: Unit.G },
            { name: 'lait', quantity: 300, unit: Unit.ML },
            { name: 'sucre', quantity: 20, unit: Unit.G },
            { name: 'vanille', quantity: 0.5, unit: Unit.TSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire chauffer le lait avec la vanille.' },
            { stepNumber: 2, instruction: 'Ajouter le riz et laisser cuire à feu doux 25 minutes en remuant.' },
            { stepNumber: 3, instruction: 'Ajouter le sucre et laisser refroidir.' },
            { stepNumber: 4, instruction: 'Servir froid ou tiède.' },
        ],
    });

    // Recipe 31: Pâtes aux Brocolis
    await createRecipe({
        title: 'Pâtes aux Brocolis',
        slug: 'pates-aux-brocolis',
        description: 'Des pâtes avec des brocolis et de la crème',
        prepTime: 10,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'healthy'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'brocoli', quantity: 100, unit: Unit.G },
            { name: 'crème fraîche', quantity: 50, unit: Unit.ML },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'parmesan', quantity: 20, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Faire cuire les brocolis à la vapeur 8 minutes.' },
            { stepNumber: 3, instruction: 'Faire revenir l\'ail dans une poêle, ajouter la crème.' },
            { stepNumber: 4, instruction: 'Ajouter les brocolis et les pâtes, mélanger avec le parmesan.' },
        ],
    });

    // Recipe 32: Omelette Espagnole
    await createRecipe({
        title: 'Omelette Espagnole',
        slug: 'omelette-espagnole',
        description: 'Une tortilla aux pommes de terre',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.MEDIUM,
        tags: ['vegetarian', 'spanish'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'oeuf', quantity: 3, unit: Unit.PIECE },
            { name: 'pomme de terre', quantity: 1, unit: Unit.PIECE },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'huile d\'olive', quantity: 2, unit: Unit.TBSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Couper les pommes de terre en fines rondelles.' },
            { stepNumber: 2, instruction: 'Les faire revenir dans l\'huile avec l\'oignon 15 minutes.' },
            { stepNumber: 3, instruction: 'Battre les oeufs avec le sel.' },
            { stepNumber: 4, instruction: 'Verser les oeufs sur les pommes de terre et cuire 5 minutes de chaque côté.' },
        ],
    });

    // Recipe 33: Pâtes à la Carbonara Végétarienne
    await createRecipe({
        title: 'Pâtes à la Carbonara Végétarienne',
        slug: 'pates-carbonara-vegetarienne',
        description: 'Une version végétarienne de la carbonara',
        prepTime: 10,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'italian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'oeuf', quantity: 1, unit: Unit.PIECE },
            { name: 'parmesan', quantity: 25, unit: Unit.G },
            { name: 'crème fraîche', quantity: 30, unit: Unit.ML },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Battre l\'oeuf avec le parmesan, la crème, l\'ail, le sel et le poivre.' },
            { stepNumber: 3, instruction: 'Égoutter les pâtes et les mélanger rapidement avec le mélange oeuf-crème hors du feu.' },
            { stepNumber: 4, instruction: 'Servir immédiatement.' },
        ],
    });

    // Recipe 34: Riz Pilaf
    await createRecipe({
        title: 'Riz Pilaf',
        slug: 'riz-pilaf',
        description: 'Un riz parfumé et savoureux',
        prepTime: 5,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'bouillon de légumes', quantity: 200, unit: Unit.ML },
            { name: 'beurre', quantity: 15, unit: Unit.G },
            { name: 'thym', quantity: 0.5, unit: Unit.TSP },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire revenir l\'oignon émincé dans le beurre.' },
            { stepNumber: 2, instruction: 'Ajouter le riz et faire nacrer 2 minutes.' },
            { stepNumber: 3, instruction: 'Ajouter le bouillon, le thym et le sel.' },
            { stepNumber: 4, instruction: 'Couvrir et laisser cuire 18 minutes à feu doux.' },
        ],
    });

    // Recipe 35: Salade de Riz
    await createRecipe({
        title: 'Salade de Riz',
        slug: 'salade-de-riz',
        description: 'Une salade de riz fraîche et colorée',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'healthy'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'tomate', quantity: 1, unit: Unit.PIECE },
            { name: 'poivron', quantity: 0.5, unit: Unit.PIECE },
            { name: 'maïs', quantity: 30, unit: Unit.G },
            { name: 'huile d\'olive', quantity: 1, unit: Unit.TBSP },
            { name: 'vinaigre', quantity: 0.5, unit: Unit.TBSP },
            { name: 'persil', quantity: 0.25, unit: Unit.BUNCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire le riz et laisser refroidir.' },
            { stepNumber: 2, instruction: 'Couper la tomate et le poivron en dés.' },
            { stepNumber: 3, instruction: 'Mélanger le riz froid avec tous les légumes.' },
            { stepNumber: 4, instruction: 'Arroser d\'huile et de vinaigre, parsemer de persil.' },
        ],
    });

    // Recipe 36: Pâtes aux Pois
    await createRecipe({
        title: 'Pâtes aux Pois',
        slug: 'pates-aux-pois',
        description: 'Des pâtes avec des petits pois et de la crème',
        prepTime: 5,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'vegetarian'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.VEGETARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'petits pois', quantity: 80, unit: Unit.G },
            { name: 'crème fraîche', quantity: 50, unit: Unit.ML },
            { name: 'jambon', quantity: 2, unit: Unit.SLICE },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Faire cuire les petits pois 5 minutes.' },
            { stepNumber: 3, instruction: 'Couper le jambon en dés.' },
            { stepNumber: 4, instruction: 'Mélanger les pâtes avec les petits pois, la crème et le jambon.' },
        ],
    });

    // Recipe 37: Oeufs au Plat
    await createRecipe({
        title: 'Oeufs au Plat',
        slug: 'oeufs-au-plat',
        description: 'Des oeufs au plat simples',
        prepTime: 2,
        cookTime: 5,
        difficulty: Difficulty.EASY,
        tags: ['quick'],
        toolsRequired: ['casserole'],
        dietTypes: [],
        ingredients: [
            { name: 'oeuf', quantity: 2, unit: Unit.PIECE },
            { name: 'beurre', quantity: 10, unit: Unit.G },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
            { name: 'poivre', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire fondre le beurre dans une poêle.' },
            { stepNumber: 2, instruction: 'Casser les oeufs dans la poêle.' },
            { stepNumber: 3, instruction: 'Cuire 3-4 minutes jusqu\'à ce que le blanc soit pris.' },
            { stepNumber: 4, instruction: 'Saler, poivrer et servir.' },
        ],
    });

    // Recipe 38: Pâtes au Saumon
    await createRecipe({
        title: 'Pâtes au Saumon',
        slug: 'pates-au-saumon',
        description: 'Des pâtes avec du saumon et de la crème',
        prepTime: 10,
        cookTime: 15,
        difficulty: Difficulty.EASY,
        tags: ['quick', 'fish'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.PESCATARIAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'saumon', quantity: 100, unit: Unit.G },
            { name: 'crème fraîche', quantity: 50, unit: Unit.ML },
            { name: 'citron', quantity: 0.5, unit: Unit.PIECE },
            { name: 'aneth', quantity: 0.25, unit: Unit.BUNCH },
            { name: 'sel', quantity: 1, unit: Unit.PINCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 2, instruction: 'Couper le saumon en dés et le faire revenir 5 minutes.' },
            { stepNumber: 3, instruction: 'Ajouter la crème et le jus de citron.' },
            { stepNumber: 4, instruction: 'Mélanger avec les pâtes et parsemer d\'aneth.' },
        ],
    });

    // Recipe 39: Riz aux Crevettes
    await createRecipe({
        title: 'Riz aux Crevettes',
        slug: 'riz-aux-crevettes',
        description: 'Un riz sauté aux crevettes',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['fish'],
        toolsRequired: ['casserole'],
        dietTypes: [DietType.PESCATARIAN],
        ingredients: [
            { name: 'riz', quantity: 80, unit: Unit.G },
            { name: 'crevettes', quantity: 80, unit: Unit.G },
            { name: 'oignon', quantity: 0.5, unit: Unit.PIECE },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'huile végétale', quantity: 1, unit: Unit.TBSP },
            { name: 'sauce soja', quantity: 1, unit: Unit.TBSP },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Faire cuire le riz et laisser refroidir.' },
            { stepNumber: 2, instruction: 'Faire revenir l\'oignon et l\'ail dans l\'huile.' },
            { stepNumber: 3, instruction: 'Ajouter les crevettes et faire revenir 5 minutes.' },
            { stepNumber: 4, instruction: 'Ajouter le riz froid et la sauce soja, faire sauter 5 minutes.' },
        ],
    });

    // Recipe 40: Pâtes aux Légumes Grillés
    await createRecipe({
        title: 'Pâtes aux Légumes Grillés',
        slug: 'pates-legumes-grilles',
        description: 'Des pâtes avec des légumes grillés',
        prepTime: 15,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        tags: ['vegetarian', 'healthy'],
        toolsRequired: ['oven', 'casserole'],
        dietTypes: [DietType.VEGETARIAN, DietType.VEGAN],
        ingredients: [
            { name: 'pâtes', quantity: 100, unit: Unit.G },
            { name: 'courgette', quantity: 0.5, unit: Unit.PIECE },
            { name: 'aubergine', quantity: 0.33, unit: Unit.PIECE },
            { name: 'poivron', quantity: 0.5, unit: Unit.PIECE },
            { name: 'huile d\'olive', quantity: 2, unit: Unit.TBSP },
            { name: 'ail', quantity: 1, unit: Unit.CLOVE },
            { name: 'basilic', quantity: 0.25, unit: Unit.BUNCH },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Préchauffer le four à 200°C.' },
            { stepNumber: 2, instruction: 'Couper les légumes en morceaux et les faire griller au four 15 minutes.' },
            { stepNumber: 3, instruction: 'Faire cuire les pâtes.' },
            { stepNumber: 4, instruction: 'Mélanger les pâtes avec les légumes grillés, l\'ail et le basilic.' },
        ],
    });

    console.log('✅ Created 40 recipes');
    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

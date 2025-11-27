import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DecimalInterceptor } from './common/interceptors/decimal.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable validation globally
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Convert Prisma Decimal to number in all responses
    app.useGlobalInterceptors(new DecimalInterceptor());

    // Enable CORS
    // Support multiple origins: web app, mobile app (Capacitor), and custom origins
    const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:3001'];
    
    // Add Capacitor mobile app origins (REQUIRED for mobile app)
    // These origins are used when the app runs in Capacitor WebView
    const capacitorOrigins = [
        'capacitor://localhost',
        'https://localhost',
        'ionic://localhost',
        'http://localhost',
        'http://localhost:3001',
        'http://localhost:5173', // Vite dev server
    ];
    
    const allOrigins = [...new Set([...allowedOrigins, ...capacitorOrigins])];
    
    console.log('🌐 CORS configured. Allowed origins:', allOrigins);
    
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, Postman, or curl)
            if (!origin) {
                console.log('✅ CORS: Request with no origin - allowing');
                return callback(null, true);
            }
            
            // Check if origin is in allowed list (exact match)
            const isAllowed = allOrigins.includes(origin);
            
            if (isAllowed) {
                console.log(`✅ CORS: Origin "${origin}" is allowed`);
                // Return the origin explicitly (required for CORS header)
                return callback(null, origin);
            }
            
            // Allow all origins in development mode
            if (process.env.NODE_ENV !== 'production') {
                console.log(`⚠️  CORS (dev mode): Allowing origin "${origin}"`);
                return callback(null, origin);
            }
            
            // Log for debugging in production
            console.log(`❌ CORS: Origin "${origin}" NOT allowed. Allowed origins:`, allOrigins);
            
            // In production, reject unknown origins
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Content-Length', 'X-Request-Id'],
    });

    // Serve static files (uploaded images)
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads',
    });

    // Swagger/OpenAPI Configuration
    const config = new DocumentBuilder()
        .setTitle('MealPlans API')
        .setDescription('API documentation for MealPlans - Meal planning application')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management endpoints')
        .addTag('recipes', 'Recipe management endpoints')
        .addTag('ingredients', 'Ingredient management endpoints')
        .addTag('meal-plans', 'Meal plan management endpoints')
        .addTag('shopping-lists', 'Shopping list management endpoints')
        .addTag('history', 'History and tracking endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');  // ✅ Correct
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
}

bootstrap();

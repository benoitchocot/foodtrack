import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeReviewsService } from './recipe-reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recipe-reviews')
@Controller('recipes/:recipeId/reviews')
export class RecipeReviewsController {
    constructor(private readonly reviewsService: RecipeReviewsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a review for a recipe' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    @ApiResponse({ status: 409, description: 'Review already exists' })
    async create(
        @Request() req: any,
        @Param('recipeId') recipeId: string,
        @Body() createReviewDto: CreateReviewDto,
    ) {
        return this.reviewsService.create(req.user.id, recipeId, createReviewDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all reviews for a recipe' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async findAll(@Param('recipeId') recipeId: string) {
        return this.reviewsService.findAll(recipeId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':reviewId/report')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Report a review' })
    @ApiResponse({ status: 201, description: 'Review reported successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiResponse({ status: 409, description: 'Review already reported' })
    async report(
        @Request() req: any,
        @Param('reviewId') reviewId: string,
        @Body() reportReviewDto: ReportReviewDto,
    ) {
        return this.reviewsService.report(req.user.id, reviewId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':reviewId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Delete a review (own review only)' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async delete(@Request() req: any, @Param('reviewId') reviewId: string) {
        return this.reviewsService.delete(req.user.id, reviewId);
    }
}

@ApiTags('recipe-reviews')
@Controller('reviews')
export class ReviewAdminController {
    constructor(private readonly reviewsService: RecipeReviewsService) {}

    @Delete('delete/:token')
    @ApiOperation({ summary: 'Delete a reported review (public endpoint with token)' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 404, description: 'Invalid token' })
    async deleteByToken(@Param('token') token: string) {
        return this.reviewsService.deleteByToken(token);
    }
}


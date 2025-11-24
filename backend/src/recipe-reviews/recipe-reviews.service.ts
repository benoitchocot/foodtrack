import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { EmailService } from '../recipe-submissions/email.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class RecipeReviewsService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) {}

    async create(userId: string, recipeId: string, createReviewDto: CreateReviewDto) {
        // Check if recipe exists
        const recipe = await this.prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true, title: true },
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        // Check if user already reviewed this recipe
        const existingReview = await this.prisma.recipeReview.findUnique({
            where: {
                userId_recipeId: {
                    userId,
                    recipeId,
                },
            },
        });

        if (existingReview) {
            throw new ConflictException('You have already reviewed this recipe');
        }

        // Get user info for email
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true, lastName: true },
        });

        // Create review
        const review = await this.prisma.recipeReview.create({
            data: {
                userId,
                recipeId,
                rating: createReviewDto.rating,
                comment: createReviewDto.comment || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Send email to admin
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        if (adminEmail && user) {
            await this.emailService.sendReviewEmail(
                adminEmail,
                recipe.title,
                recipeId,
                user.email,
                createReviewDto.rating,
                createReviewDto.comment,
            );
        }

        return review;
    }

    async findAll(recipeId: string) {
        // Check if recipe exists
        const recipe = await this.prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true },
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        return this.prisma.recipeReview.findMany({
            where: { recipeId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(reviewId: string) {
        const review = await this.prisma.recipeReview.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                recipe: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    async report(userId: string, reviewId: string) {
        // Check if review exists
        const review = await this.prisma.recipeReview.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
                recipe: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Check if user already reported this review
        const existingReport = await this.prisma.reviewReport.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId,
                },
            },
        });

        if (existingReport) {
            throw new ConflictException('You have already reported this review');
        }

        // Get reporter info
        const reporter = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        // Generate unique deletion token
        const deletionToken = randomBytes(32).toString('hex');

        // Create report
        const report = await this.prisma.reviewReport.create({
            data: {
                reviewId,
                userId,
                deletionToken,
            },
        });

        // Send email to admin
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        if (adminEmail && reporter) {
            await this.emailService.sendReviewReportEmail(
                adminEmail,
                review.recipe.title,
                review.recipe.id,
                reviewId,
                reporter.email,
                review.rating,
                review.comment || undefined,
                deletionToken,
            );
        }

        return { message: 'Review reported successfully' };
    }

    async delete(userId: string, reviewId: string) {
        const review = await this.prisma.recipeReview.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Only allow user to delete their own review
        if (review.userId !== userId) {
            throw new NotFoundException('Review not found');
        }

        return this.prisma.recipeReview.delete({
            where: { id: reviewId },
        });
    }

    async deleteByToken(token: string) {
        // Find report by token
        const report = await this.prisma.reviewReport.findFirst({
            where: { deletionToken: token },
            include: {
                review: {
                    include: {
                        recipe: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        if (!report || !report.deletionToken) {
            throw new NotFoundException('Invalid deletion token');
        }

        // Delete the review
        await this.prisma.recipeReview.delete({
            where: { id: report.reviewId },
        });

        // Delete all reports for this review (cleanup)
        await this.prisma.reviewReport.deleteMany({
            where: { reviewId: report.reviewId },
        });

        return {
            message: 'Review deleted successfully',
            recipe: report.review.recipe,
        };
    }
}


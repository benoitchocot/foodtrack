import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
    constructor(private configService: ConfigService) {}
    @UseGuards(JwtAuthGuard)
    @Post('image')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Upload an image file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid file type or size' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/images',
                filename: (req, file, cb) => {
                    const uniqueName = `${crypto.randomUUID()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, cb) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
                }
            },
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Get the API URL from environment, with fallback
        const apiUrl = this.configService.get('API_URL') 
            || this.configService.get('BACKEND_URL')
            || process.env.API_URL
            || process.env.BACKEND_URL
            || 'http://localhost:3000';
        
        const imageUrl = `${apiUrl}/uploads/images/${file.filename}`;

        return {
            url: imageUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
        };
    }
}


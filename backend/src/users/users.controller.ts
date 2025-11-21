import { Controller, Get, Patch, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    async getCurrentUser(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            hasSeenTutorial: user.hasSeenTutorial,
        };
    }

    @Patch('me')
    async updateCurrentUser(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.update(req.user.id, updateUserDto);
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            hasSeenTutorial: user.hasSeenTutorial,
        };
    }

    @Patch('me/tutorial-seen')
    @ApiOperation({ summary: 'Mark tutorial as seen' })
    async markTutorialAsSeen(@Request() req: any) {
        const user = await this.usersService.update(req.user.id, { hasSeenTutorial: true });
        return {
            id: user.id,
            hasSeenTutorial: user.hasSeenTutorial,
        };
    }

    @Get('me/settings')
    async getSettings(@Request() req: any) {
        return this.usersService.getSettings(req.user.id);
    }

    @Patch('me/settings')
    async updateSettings(@Request() req: any, @Body() updateSettingsDto: UpdateUserSettingsDto) {
        return this.usersService.updateSettings(req.user.id, updateSettingsDto);
    }
}

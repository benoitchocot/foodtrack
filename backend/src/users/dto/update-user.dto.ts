import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsBoolean()
    @IsOptional()
    hasSeenTutorial?: boolean;
}

import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { SignInDTO, SignUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from 'generated/prisma';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() body: SignUpDTO) {
        return this.authService.signUp(body);
    }

    @Post('signin')
    async signIn(@Body() body: SignInDTO) {
        return this.authService.signIn(body);
    }

    @UseGuards(AuthGuard)
    @Get('users')
    async getAllUsers(): Promise<User[] | null> {
        return this.authService.getAll();
    }

    @UseGuards(AuthGuard)
    @Get('users/:id')
    async getUserById(@Param('id') id: string): Promise<User | null> {
        const user = await this.authService.getById(id);

        if (!user) {
            throw new NotFoundException(`Usuário não encontrado`);
        }

        return user;
    }

    @UseGuards(AuthGuard)
    @Delete('users/:id')
    async deleteUser(@Param('id') id: string): Promise<User | null> {
        return await this.authService.deleteUser(id);
    }


}

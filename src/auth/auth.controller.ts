import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { SignInDTO, SignUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

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
    @Get('me')
    async me(@Request() request) {
        return request.user;
    }

}

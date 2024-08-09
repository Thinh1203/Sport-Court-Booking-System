import { Body, Controller, Get, HttpStatus, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ) {}

    @Post('register')
    @UsePipes(ValidationPipe)
    async register (@Body() registerUserDto: RegisterUserDto, @Res() res: Response): Promise<any> {
        try {
            const newUser = await this.authService.register(registerUserDto);              
            return res.status(HttpStatus.CREATED).json({
                message: 'User registered successfully',
                data: newUser
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: error.message
            })
        }
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    async login (@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<any> {
        try {
            const token = await this.authService.login(loginUserDto);
            return res.status(HttpStatus.CREATED).json({
                message: 'Login successfully',
                data: token
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: error.message
            })
        }
    }

    @Post('refresh-token')
    async refreshToken(@Body() {refresh_token}, @Res() res: Response): Promise<any> {
        try {
            const token = await this.authService.refreshToken(refresh_token);
            return res.status(HttpStatus.CREATED).json({
                message: 'Refresh token',
                data: token
            })
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: error.message
            })
        }
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}
    
    private async hashPassword (password: string) : Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);
        return newPassword;
    }

    private async generateToken (payload: { id: number, email: string, phoneNumber: string, role: string }) : Promise<string | any> {
        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload,
           {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_In')
           }
        );
       
        return { access_token, refresh_token };
    }

    async refreshToken(refresh_token: string): Promise<any> {
        try {
            const verify = await this.jwtService.verifyAsync(refresh_token, {
                secret: this.configService.get<string>('SECRET_KEY')
            })

            const checkUser = await this.prisma.user.findFirst({
                where: {
                    email: verify.email
                }
            });

            if (checkUser) {
                return this.generateToken({ id: verify.id, email: verify.email, phoneNumber: verify.phoneNumber, role: verify.role });
            } else {
                throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
            }

        } catch (error) {
            throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST)
        }
    }

    async register (registerUserDto: RegisterUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: registerUserDto.email
                    },
                    {
                        phoneNumber: registerUserDto.phoneNumber
                    }
                ]
            }
        });
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.CONFLICT)
        }
        const newPassword: string = await this.hashPassword(registerUserDto.password);
        
        return await this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                phoneNumber: registerUserDto.phoneNumber,
                fullName: registerUserDto.fullName,
                password: newPassword
            }
        });
    }

    async login (loginUserDto: LoginUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: loginUserDto.email 
            }
        });
        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        const payload = { id: existingUser.id, email: existingUser.email, phoneNumber: existingUser.phoneNumber, role: existingUser.role };
        return await this.generateToken(payload);
    }
}

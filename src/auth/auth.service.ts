import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import { UpdatePasswordByEmail } from './dto/update-password.dto';

@Injectable()
export class AuthService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}
    
    private otpCache = new Map<string, { otp: string, expiresAt: number }>();

    private saveOTPToMemory(email: string, otp: string) {
        const expiresAt = Date.now() + 120000;
        this.otpCache.set(email, { otp, expiresAt });

        setTimeout(() => {
            this.otpCache.delete(email);
        }, 120000);
    }

    private async hashPassword (password: string) : Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);
        return newPassword;
    }

    private async generateToken (payload: { id: number, email: string, phoneNumber: string, role: string }): Promise<{ access_token: string, refresh_token: string }> {
        
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_In')
        }); 
        
        const refresh_token = await this.jwtService.signAsync(payload,
           {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_In')
           }
        );

        return { access_token, refresh_token };
    }
    

    async refreshToken(refresh_token: string): Promise<string> {
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
                        
            const access_token = await this.jwtService.signAsync({ id: verify.id, email: verify.email, phoneNumber: verify.phoneNumber, role: verify.role }, {
                secret: this.configService.get<string>('SECRET_KEY'),
                expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_In')
            }); 
                return access_token
            } else {
                throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
            }

        } catch (error) {
            throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST)
        }
    }

    async register (registerUserDto: RegisterUserDto): Promise<{ access_token: string, refresh_token: string }>  {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: registerUserDto.email      
            }
        });
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.CONFLICT)
        }
        const newPassword: string = await this.hashPassword(registerUserDto.password);
        
        const newUser = await this.prisma.user.create({
            data: {
                email: registerUserDto.email,
                phoneNumber: registerUserDto.phoneNumber,
                fullName: registerUserDto.fullName,
                password: newPassword
            }
        });
        const payload = { id: newUser.id, email: newUser.email, phoneNumber: newUser.phoneNumber, role: newUser.role };
        return await this.generateToken(payload);
    }

    async login (loginUserDto: LoginUserDto): Promise<{ access_token: string, refresh_token: string }>  {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                AND: [
                    {
                        email: loginUserDto.email 
                    },
                    {
                        isBlocked: false
                    }
                ]
            }
        });
        
        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        const checkPassword = bcrypt.compareSync(loginUserDto.password, existingUser.password);
        
        if(!checkPassword) {
            throw new HttpException("User or password is incorrect", HttpStatus.UNAUTHORIZED);
        };
        const payload = { id: existingUser.id, email: existingUser.email, phoneNumber: existingUser.phoneNumber, role: existingUser.role };
        return await this.generateToken(payload);
    }

    async generateOTP (email: string): Promise<{ otp: string }> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        
        const otp = speakeasy.totp({
            secret: this.configService.get<string>('OTP_SECRET'),
            encoding: this.configService.get<string>('OTP_ENDCODEDING'), 
            digits: Number(this.configService.get<string>('OTP_DIGITS')),
            step: Number(this.configService.get<string>('OTP_STEP')),
        }); 
        this.saveOTPToMemory(existingUser.email, otp);
        return otp ;
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const otpRecord = this.otpCache.get(email);
    
        if (!otpRecord) {
            throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
        }
    
        if (Date.now() > otpRecord.expiresAt) {
            this.otpCache.delete(email);
            throw new HttpException('Expired OTP', HttpStatus.UNAUTHORIZED);
        }
    
        if (otpRecord.otp !== otp) {
            throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
        }
        
        return true;
    }

    async updateNewPassword(data: UpdatePasswordByEmail) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: data.email
            }
        });

        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        const newPassword: string = await this.hashPassword(data.password);

        return await this.prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                password: newPassword
            }
        })
    } 
}

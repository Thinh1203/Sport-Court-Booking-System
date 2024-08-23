import { Body, Controller, Get, HttpStatus, Param, Patch, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserFilterDto } from './dto/user-filter.dto';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

   @Get('')
   @UseGuards(AuthGuard, AdminGuard)
   async getAllUser (@Res() res: Response, @Query() query: UserFilterDto) : Promise<any> {
    try {
        const data = await this.userService.getAllUser(query);
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
    }
   }

   @Get('myInformation')
   @UseGuards(AuthGuard)
   async getUserByToken(
    @Res() res: Response,
    @Req() req: Request
) : Promise<any> {
    try {
        const user = req['user'];
        const data = await this.userService.getUserByToken(Number(user.id));
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
    }
   }

   @Get(':id')
   @UseGuards(AuthGuard)
   async getUserById(@Param('id') id: string, @Res() res: Response) : Promise<any> {
    try {
        const data = await this.userService.getUserById(Number(id));
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
    }
   }

   @Patch(':id') 
   @UseGuards(AuthGuard)
   async updateUserById(@Param('id') id: string, @Body() UpdateUserDto: UpdateUserDto, @Res() res: Response) : Promise<any> {
    try {
        await this.userService.updateUserById(Number(id),UpdateUserDto);
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'User updated successfully',
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
    }
   }

   @Patch('delete/:id') 
   @UseGuards(AuthGuard, AdminGuard)
   async deleteUserById(@Param('id') id: string, @Res() res: Response) : Promise<any> {
    try {
        await this.userService.deleteUserById(Number(id));
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'User deleted successfully',
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
    }
   }

   @Patch('uploadAvatar/:id')
   @UseGuards(AuthGuard)
   @UseInterceptors(FileInterceptor('file'))
   async uploadAvatarById(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File, 
    @Res() res: Response) : Promise<any> {
    try {
        await this.userService.uploadAvatarById(Number(id), file);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Avatar uploaded successfully'
            })
     } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
     }
    }

   @Patch('uploadBackground/:id')
   @UseGuards(AuthGuard, AdminGuard)
   @UseInterceptors(FileInterceptor('file'))
   async uploadBackgroundById(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File, 
    @Res() res: Response
    ) : Promise<any> {
    try {
        await this.userService.uploadBackgroundById(Number(id), file);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: 'Background uploaded successfully'
            })
     } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message
        })
     }
    }
}

import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

   @Get()
   async getAllUser (@Res() res: Response) : Promise<any> {
    try {
        const data = await this.userService.getAllUser();
        return res.status(HttpStatus.OK).json({
            message: 'Successfully',
            data
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
   }

   @Get(':id')
   async getUserById(@Param('id') id: string, @Res() res: Response) : Promise<any> {
    try {
        const data = await this.userService.getUserById(Number(id));
        return res.status(HttpStatus.OK).json({
            message: 'User detail: ',
            data
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
   }

   @Patch(':id') 
   async updateUserById(@Param('id') id: string, @Body() UpdateUserDto: UpdateUserDto, @Res() res: Response) : Promise<any> {
    try {
        await this.userService.updateUserById(Number(id),UpdateUserDto);
        return res.status(HttpStatus.OK).json({
            message: 'User updated successfully',
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
   }

   @Patch('delete/:id') 
   async deleteUserById(@Param('id') id: string, @Res() res: Response) : Promise<any> {
    try {
        await this.userService.deleteUserById(Number(id));
        return res.status(HttpStatus.OK).json({
            message: 'User deleted successfully',
        })
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
   }

   @Patch('uploadAvatar/:id')
   @UseInterceptors(FileInterceptor('file'))
   async uploadAvatarById(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File, 
    @Res() res: Response) : Promise<any> {
    try {
        await this.userService.uploadAvatarById(Number(id), file);
            return res.status(HttpStatus.CREATED).json({
                message: 'Avatar uploaded successfully'
            })
     } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
     }
    }

   @Patch('uploadBackground/:id')
   @UseInterceptors(FileInterceptor('file'))
   async uploadBackgroundById(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File, 
    @Res() res: Response) : Promise<any> {
    try {
        await this.userService.uploadBackgroundById(Number(id), file);
            return res.status(HttpStatus.CREATED).json({
                message: 'Background uploaded successfully'
            })
     } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        })
     }
    }
}

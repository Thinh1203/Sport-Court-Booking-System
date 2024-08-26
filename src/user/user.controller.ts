import { Body, Controller, Get, HttpStatus, Param, Patch, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserFilterDto } from './dto/user-filter.dto';
import { AdminGuard } from 'src/auth/auth.admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

   @Get('')
   @UseGuards(AuthGuard, AdminGuard)
   @ApiResponse({status: 200, description: 'Get all users successfully'})
   @ApiResponse({status: 400, description: 'Error'})
   async getAllUser (
        @Res() res: Response, 
        @Query() query: UserFilterDto
    ) {
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
   @ApiResponse({status: 200, description: 'Get my information successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   async getUserByToken(
        @Res() res: Response,
        @Req() req: Request
    ) {
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
   @UseGuards(AuthGuard)
   @ApiResponse({status: 200, description: 'Get user by id successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   async getUserById(
        @Param('id') id: string,
        @Res() res: Response
    ) {
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
   @ApiResponse({status: 200, description: 'Updated user successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   async updateUserById(
        @Param('id') id: string, 
        @Body() UpdateUserDto: UpdateUserDto, 
        @Res() res: Response
    ) {
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
   @ApiResponse({status: 200, description: 'Deleted user successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   async deleteUserById(
        @Param('id') id: string, 
        @Res() res: Response
    ) {
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
   @ApiResponse({status: 200, description: 'Updated avatar successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   @UseInterceptors(FileInterceptor('file'))
   async uploadAvatarById(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File, 
        @Res() res: Response
    ) {
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
   @ApiResponse({status: 200, description: 'Updated background successfully'})
   @ApiResponse({status: 404, description: 'User not found'})
   @ApiResponse({status: 400, description: 'Error'})
   @UseGuards(AuthGuard)
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

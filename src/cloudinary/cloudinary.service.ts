import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary, DeleteApiResponse } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File, width: number, height: number): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              transformation: [{ width, height, crop: 'fill' }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
    
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      }
    deleteFile(publicId: string): Promise<DeleteApiResponse> {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId,(error, result) => {
            if (error) return reject(error);
            resolve(result)
          }
        );
      })
    }
}

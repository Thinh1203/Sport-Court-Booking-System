import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseCourtDtoPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // console.log('Received value:', value);
        try {
            value.name = String(value.name);
            value.price = Number(value.price);
            value.time = Number(value.time);
            value.sportsCenterId = Number(value.sportsCenterId);
            value.categoryId = Number(value.categoryId);

            if (typeof value.amenitiesIds === 'string') {
                value.amenitiesIds = JSON.parse(value.amenitiesIds);
            }

            if (Array.isArray(value.amenitiesIds)) {
                value.amenitiesIds = value.amenitiesIds.map(Number);
            }

            // console.log('Transformed value:', value);
            
            return value;
        } catch (error) {
            console.error('Error in ParseCourtDtoPipe:', error);
            throw new BadRequestException('Invalid input data format');
        }
    }
}

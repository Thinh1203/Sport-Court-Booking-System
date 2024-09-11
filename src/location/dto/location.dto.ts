import { IsString } from 'class-validator';

export class LocationDto {
  @IsString()
  place_id: string;
  @IsString()
  lat: string;
  @IsString()
  lon: string;
  @IsString()
  name: string;
  @IsString()
  display_name: string;
}

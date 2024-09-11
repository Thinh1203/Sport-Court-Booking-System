import { ApiBody } from '@nestjs/swagger';

export const addLocationApiBody = ApiBody({
  description: 'List of locations ',
  schema: {
    type: 'object',
    properties: {
      place_id: {
        type: 'string',
        example: '_123131',
      },
      lat: {
        type: 'string',
        example: '10.0124233',
      },
      lon: {
        type: 'string',
        example: '-10.234646',
      },
      name: {
        type: 'string',
        example: 'London, Greater London, England, SW1A 2DU, United Kingdom',
      },
      display_name: {
        type: 'string',
        example: 'London, Greater London, England, SW1A 2DU, United Kingdom',
      },
    },
    required: ['place_id', 'lat', 'lon', 'name', 'display_name'],
  },
});

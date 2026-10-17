import { Controller, Get, Query } from '@nestjs/common';
import type { Offer } from '../contracts';
import { ProximityService } from './proximity.service';
import { parseCoordinate, parseRadius } from './query';

@Controller('offers')
export class OffersController {
  constructor(private readonly proximity: ProximityService) {}

  /** GET /offers/nearby?lat=&lng=&radius=  (radius în metri, implicit 2000) */
  @Get('nearby')
  async nearby(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ): Promise<Offer[]> {
    const offers = await this.proximity.nearby(
      parseCoordinate(lat, 'lat'),
      parseCoordinate(lng, 'lng'),
      parseRadius(radius, 2000),
    );
    return offers.map(ProximityService.toOffer);
  }
}

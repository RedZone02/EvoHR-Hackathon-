import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { ProductCategory, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ProximityService } from '../ai-map-notification/proximity/proximity.service';
import { parseCoordinate, parseRadius } from '../ai-map-notification/proximity/query';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly proximityService: ProximityService,
  ) {}

  @Get()
  async findAll(
    @Query('category') category?: ProductCategory,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.offersService.findAll({
      category,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      maxDistanceMeters: radius ? parseInt(radius, 10) : undefined,
    });
  }

  // Pentru hartă (modulul ai-map-notification). Trebuie să rămână înainte de ':id'.
  @Get('nearby')
  async nearby(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    const offers = await this.proximityService.nearby(
      parseCoordinate(lat, 'lat'),
      parseCoordinate(lng, 'lng'),
      parseRadius(radius, 2000),
    );
    return offers.map(ProximityService.toDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.createOffer(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.updateOffer(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.offersService.deleteOffer(id, user.userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.createReservation(user.userId, dto);
  }

  @Get('my')
  async findMy(@CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findMyReservations(user.userId);
  }

  @Get('store')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  async findStoreReservations(@CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findStoreReservations(user.userId);
  }

  @Post(':code/collect')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  async collect(
    @Param('code') code: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservationsService.collectReservation(user.userId, code);
  }
}
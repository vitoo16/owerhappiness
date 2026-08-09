import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, OwnerGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}
  @Get() get() { return this.dashboard.get(); }
}

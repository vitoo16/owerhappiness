import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { OriginGuard } from '../common/guards/origin.guard';
import { UpdateSettingDto } from './dto/setting.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('public')
  getPublicSettings() {
    return this.settings.public();
  }
}

@Controller('admin/settings')
@UseGuards(AuthGuard, OwnerGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  getAllSettings() {
    return this.settings.all();
  }

  @Put(':key')
  @UseGuards(OriginGuard)
  updateSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settings.put(key, dto.value);
  }
}

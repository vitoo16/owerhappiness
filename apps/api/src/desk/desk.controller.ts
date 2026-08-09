import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { utilityKeySchema, utilityNamespaceSchema } from '@portfolio/contracts';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { OriginGuard } from '../common/guards/origin.guard';
import { DeskService } from './desk.service';
import { UpdateUtilityDataDto } from './dto/utility-data.dto';

@Controller('desk')
@UseGuards(AuthGuard, OwnerGuard)
export class DeskController {
  constructor(private readonly desk: DeskService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.desk.overview(user.id);
  }

  @Get('data/:namespace/:key')
  async getValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
  ) {
    this.assertValidKey(namespace, key);

    return this.desk.getValue(user.id, namespace, key);
  }

  @Put('data/:namespace/:key')
  @UseGuards(OriginGuard)
  async putValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
    @Body() body: UpdateUtilityDataDto,
  ) {
    this.assertValidKey(namespace, key);

    return this.desk.putValue(user.id, namespace, key, body.value);
  }

  @Delete('data/:namespace/:key')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
  ) {
    this.assertValidKey(namespace, key);
    await this.desk.deleteValue(user.id, namespace, key);
  }

  private assertValidKey(namespace: string, key: string) {
    const validNamespace = utilityNamespaceSchema.safeParse(namespace).success;
    const validKey = utilityKeySchema.safeParse(key).success;

    if (!validNamespace || !validKey) {
      throw new BadRequestException({
        code: 'INVALID_UTILITY_KEY',
        message: 'Invalid utility namespace or key.',
      });
    }
  }
}

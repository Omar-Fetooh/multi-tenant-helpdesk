import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  imports: [PrismaModule],
})
export class TeamsModule {}

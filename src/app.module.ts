import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [PrismaModule,OrganizationsModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

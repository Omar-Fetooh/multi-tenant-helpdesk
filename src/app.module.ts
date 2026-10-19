import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TeamsModule } from './teams/teams.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    OrganizationsModule,
    TeamsModule,
    CustomersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

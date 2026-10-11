import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: createOrganizationDto });
  }

//   findDrafts() {
//     return this.prisma.organization.findMany({ where: { published: false } });
//   }

//   findAll() {
//     return this.prisma.article.findMany({ where: { published: true } });
//   }

//   findOne(id: number) {
//     return this.prisma.article.findUnique({ where: { id } });
//   }

//   update(id: number, updateArticleDto: UpdateArticleDto) {
//     return this.prisma.article.update({
//       where: { id },
//       data: updateArticleDto,
//     });
//   }

//   remove(id: number) {
//     return this.prisma.article.delete({ where: { id } });
//   }
}

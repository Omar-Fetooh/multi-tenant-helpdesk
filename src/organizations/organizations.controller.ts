import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

//   @Get()
//   @ApiOkResponse({ type: ArticleEntity, isArray: true })
//   findAll() {
//     return this.articlesService.findAll();
//   }

//   @Get('drafts')
//   @ApiOkResponse({ type: ArticleEntity, isArray: true })
//   findDrafts() {
//     return this.articlesService.findDrafts();
//   }

//   @Get(':id')
//   @ApiOkResponse({ type: ArticleEntity })
//   findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.articlesService.findOne(id);
//   }

//   @Patch(':id')
//   @ApiCreatedResponse({ type: ArticleEntity })
//   update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateArticleDto: UpdateArticleDto,
//   ) {
//     return this.articlesService.update(id, updateArticleDto);
//   }

//   @Delete(':id')
//   @ApiOkResponse({ type: ArticleEntity })
//   remove(@Param('id', ParseIntPipe) id: number) {
//     return this.articlesService.remove(id);
//   }
}

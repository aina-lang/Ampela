import { Patch, Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateCommentDto, CreatePostDto, UpdateCommentDto, UpdatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

// Lecture (liste, détail, commentaires) ouverte à toutes ; écrire, réagir
// et commenter demandent un compte.
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  /** Liste, ou recherche tolérante aux fautes avec `?q=`. */
  @Get()
  @UseGuards(OptionalAuthGuard)
  list(@Query('q') q?: string, @CurrentUser() user?: JwtPayload) {
    return q?.trim() ? this.posts.search(user?.sub, q) : this.posts.list(user?.sub);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) {
    return this.posts.create(user.sub, dto);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  getOne(@Param('id') id: string, @CurrentUser() user?: JwtPayload) {
    return this.posts.getOne(user?.sub, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(user.sub, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.posts.remove(user.sub, id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  like(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.posts.like(user.sub, id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard)
  unlike(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.posts.unlike(user.sub, id);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.posts.listComments(id);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  addComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.posts.addComment(user.sub, id, dto.content, dto.parentId);
  }

  @Patch(':id/comments/:commentId')
  @UseGuards(AuthGuard)
  updateComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.posts.updateComment(user.sub, id, commentId, dto.content);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(AuthGuard)
  deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.posts.deleteComment(user.sub, id, commentId);
  }
}

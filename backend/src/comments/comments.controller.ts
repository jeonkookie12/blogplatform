import { Controller, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  create(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @GetUser() user) {
    return this.commentsService.create(postId, createCommentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @GetUser() user) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user) {
    return this.commentsService.remove(id, user);
  }
}
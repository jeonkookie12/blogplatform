import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])], 
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(postId: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      post,
      author: user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedComment = await this.commentsRepository.save(comment);

    return this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    Object.assign(comment, updateCommentDto);
    comment.updatedAt = new Date();
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException(`Comment with ID ${id} not found`);
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
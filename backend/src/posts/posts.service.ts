// backend/src/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../entities/user.entity'; 

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author', 'comments', 'comments.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }


  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const colors = [
      '#fce4ec', '#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5',
      '#f9fbe7', '#e0f7fa', '#fffde7', '#ede7f6', '#f1f8e9',
    ];
    const post = this.postsRepository.create({
      ...createPostDto,
      color: colors[Math.floor(Math.random() * colors.length)],
      author: user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedPost = await this.postsRepository.save(post);
    return this.findOne(savedPost.id); 
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);


    if (String(post.author.id) !== String(user.id)) {
      console.log('Mismatch:', post.author.id, user.id);
      throw new NotFoundException('You can only edit your own posts');
    }

    Object.assign(post, updatePostDto);
    post.updatedAt = new Date();
    await this.postsRepository.save(post);
    return this.findOne(id);
  }


  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id);
    if (String(post.author.id) !== String(user.id)) {
      throw new NotFoundException('You can only edit your own posts');
    }
    await this.postsRepository.remove(post);
  }
}
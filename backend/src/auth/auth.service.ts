import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;
    const existingUser = await this.usersRepository.findOneBy({ username });
    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { username, password } = loginDto;
    const user = await this.usersRepository.findOneBy({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
}
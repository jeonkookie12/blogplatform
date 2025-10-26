import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]*$/, { message: 'Username must start with a letter and contain only letters, numbers, underscores, or hyphens.' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Password must have at least one lowercase letter.' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must have at least one uppercase letter.' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'Password must have at least one special character.' })
  password: string;
}
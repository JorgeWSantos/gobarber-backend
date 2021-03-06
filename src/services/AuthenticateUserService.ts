import { getRepository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import User from '../models/User';
import AuthConfig from '../config/auth';
import AppError from '../errors/AppError';

interface RequestAuthenticate {
  email: string;
  password: string;
}

interface Response {
  user: User;
  token: string;
}

class AuthenticateUserService {
  public async execute({
    email,
    password,
  }: RequestAuthenticate): Promise<Response> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError('Incorret email/password combination.', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError('Incorret email/password combination.', 401);
    }

    const { secret, expiresIn } = AuthConfig.jwt;
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    delete user.password;
    return { user, token };
  }
}

export default AuthenticateUserService;

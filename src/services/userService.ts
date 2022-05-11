import bcrypt from 'bcrypt';
import { Service } from '@tsed/di';
import { PrismaClient } from '@prisma/client';
import { Unauthorized } from '@tsed/exceptions';
import jwt from 'jsonwebtoken';
import { envs } from '../config/envs';


@Service()
export class UserService {
  private prismaClient: PrismaClient;
  constructor() {
    this.prismaClient = new PrismaClient();
  }

  async createUser(name: string, email: string, password: string): Promise<any> {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prismaClient.user.create({
      select: {
        id: true,
        name: true,
        email: true,
      },
      data: {
        name: name,
        password: hashedPassword,
        email: email,
      }
    });

    await this.prismaClient.wallet.create({
      data: {
        userId: user.id,
      }
    });

    return user;
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.prismaClient.user.findFirst({
      where: {
        email: email
      }
    });

    if (!user) {
      throw new Unauthorized('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Unauthorized('Invalid email or password');
    }

    const token = jwt.sign(
      {},
      envs.JWT_SECRET,
      { expiresIn: '1h', subject: email }
    );
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
}

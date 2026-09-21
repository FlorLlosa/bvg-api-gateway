import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usersServiceUrl =
      this.configService.get<string>('USERS_SERVICE_URL') ??
      'http://localhost:3001';
  }

  async login(body: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.usersServiceUrl}/auth/login`, body),
    );

    return response.data;
  }
  async profile(authorization: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/auth/profile`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
}

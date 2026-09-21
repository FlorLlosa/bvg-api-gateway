import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usersServiceUrl =
      this.configService.get<string>('USERS_SERVICE_URL') ??
      'http://localhost:3001';
  }

  async findAll(authorization: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/users`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
  async findOne(id: number, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/users/${id}`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
  async update(id: number, body: unknown, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.usersServiceUrl}/users/${id}`, body, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
  async updateStatus(id: number, body: unknown, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.usersServiceUrl}/users/${id}/status`,
        body,
        {
          headers: {
            Authorization: authorization,
          },
        },
      ),
    );

    return response.data;
  }
}

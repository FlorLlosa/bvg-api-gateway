import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PermissionsService {
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
      this.httpService.get(`${this.usersServiceUrl}/permissions`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
  async findOne(id: number, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/permissions/${id}`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
  async findByRole(roleId: number, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.usersServiceUrl}/permissions/roles/${roleId}`,
        {
          headers: {
            Authorization: authorization,
          },
        },
      ),
    );

    return response.data;
  }
  async assignToRole(
    permissionId: number,
    roleId: number,
    authorization: string,
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.usersServiceUrl}/permissions/${permissionId}/roles/${roleId}`,
        {},
        {
          headers: {
            Authorization: authorization,
          },
        },
      ),
    );
    return response.data;
  }
  async create(body: unknown, authorization: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.usersServiceUrl}/permissions`, body, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }
}

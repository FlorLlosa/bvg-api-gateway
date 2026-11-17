import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
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

  private handleError(error: unknown): never {
    if (isAxiosError(error)) {
      if (error.response) {
        throw new HttpException(
          error.response.data ?? {
            message: 'Error en el microservicio de usuarios',
          },
          error.response.status,
        );
      }

      throw new InternalServerErrorException(
        'No se pudo establecer comunicación con el microservicio de usuarios',
      );
    }

    throw error;
  }

  async findAll(authorization: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.usersServiceUrl}/permissions`, {
          headers: { Authorization: authorization },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: number, authorization: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.usersServiceUrl}/permissions/${id}`, {
          headers: {
            Authorization: authorization,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByRole(roleId: number, authorization: string) {
    try {
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
    } catch (error) {
      this.handleError(error);
    }
  }

  async assignToRole(
    permissionId: number,
    roleId: number,
    authorization: string,
  ) {
    try {
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
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(body: unknown, authorization: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.usersServiceUrl}/permissions`, body, {
          headers: {
            Authorization: authorization,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeFromRole(
    permissionId: number,
    roleId: number,
    authorization: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.usersServiceUrl}/permissions/${permissionId}/roles/${roleId}`,
          {
            headers: {
              Authorization: authorization,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

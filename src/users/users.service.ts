import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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

  // Crear empleado o encargado.
  async create(body: unknown, authorization: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<unknown>(`${this.usersServiceUrl}/users`, body, {
          headers: { Authorization: authorization },
        }),
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData: unknown = error.response.data;

        throw new HttpException(
          typeof responseData === 'string' ||
            (typeof responseData === 'object' && responseData !== null)
            ? responseData
            : 'Error al crear el usuario',
          error.response.status,
        );
      }

      throw new InternalServerErrorException(
        'No se pudo conectar con el servicio de usuarios',
      );
    }
  }

  // Consultar todos los usuarios.
  async findAll(authorization: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`${this.usersServiceUrl}/users`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }

  // Consultar empleados del sector del Encargado autenticado.
  async findMySector(authorization: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<unknown>(
          `${this.usersServiceUrl}/users/my-sector`,
          {
            headers: {
              Authorization: authorization,
            },
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData: unknown = error.response.data;

        throw new HttpException(
          typeof responseData === 'string' ||
            (typeof responseData === 'object' && responseData !== null)
            ? responseData
            : 'Error al consultar el personal del sector',
          error.response.status,
        );
      }

      throw new InternalServerErrorException(
        'No se pudo consultar el personal del sector',
      );
    }
  }

  // Consultar los datos del usuario autenticado.
  async findMe(authorization: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<unknown>(`${this.usersServiceUrl}/users/me`, {
          headers: {
            Authorization: authorization,
          },
        }),
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData: unknown = error.response.data;

        throw new HttpException(
          typeof responseData === 'string' ||
            (typeof responseData === 'object' && responseData !== null)
            ? responseData
            : 'Error al consultar el usuario autenticado',
          error.response.status,
        );
      }

      throw new InternalServerErrorException(
        'No se pudo consultar el usuario autenticado',
      );
    }
  }

  // Consultar un usuario por ID.
  async findOne(id: number, authorization: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`${this.usersServiceUrl}/users/${id}`, {
        headers: {
          Authorization: authorization,
        },
      }),
    );

    return response.data;
  }

  // Editar datos personales.
  async update(
    id: number,
    body: unknown,
    authorization: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch<unknown>(
        `${this.usersServiceUrl}/users/${id}`,
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

  // Activar o desactivar empleado.
  async updateStatus(
    id: number,
    body: unknown,
    authorization: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch<unknown>(
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

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

  // Inicio de sesión
  async login(body: unknown): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(
        `${this.usersServiceUrl}/auth/login`,
        body,
      ),
    );

    return response.data;
  }

  // Cambio obligatorio de contraseña en el primer ingreso
  async changeInitialPassword(
    body: unknown,
    authorization: string,
  ): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<unknown>(
          `${this.usersServiceUrl}/auth/change-initial-password`,
          body,
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
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new InternalServerErrorException(
        'No se pudo conectar con el servicio de autenticación',
      );
    }
  }

  // Consultar perfil del usuario autenticado
  async profile(authorization: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`${this.usersServiceUrl}/auth/profile`, {
        headers: { Authorization: authorization },
      }),
    );

    return response.data;
  }
}

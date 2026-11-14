import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Sector {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectorData {
  name: string;
  description?: string;
}

@Injectable()
export class SectorsService {
  private readonly tasksServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl =
      this.configService.get<string>('TASKS_SERVICE_URL') ??
      'http://localhost:3002';
  }

  // Crear un sector
  async create(data: unknown): Promise<Sector> {
    const response = await firstValueFrom(
      this.httpService.post<Sector>(`${this.tasksServiceUrl}/sectors`, data),
    );

    return response.data;
  }

  // Obtener todos los sectores
  async findAll(): Promise<Sector[]> {
    const response = await firstValueFrom(
      this.httpService.get<Sector[]>(`${this.tasksServiceUrl}/sectors`),
    );

    return response.data;
  }

  // Obtener sector por ID
  async findOne(id: number): Promise<Sector> {
    const response = await firstValueFrom(
      this.httpService.get<Sector>(`${this.tasksServiceUrl}/sectors/${id}`),
    );

    return response.data;
  }
}

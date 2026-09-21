import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl =
      this.configService.get<string>('TASKS_SERVICE_URL') ??
      'http://localhost:3002';
  }

  async findAll() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks`),
    );

    return response.data;
  }
  async findOne(id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}`),
    );

    return response.data;
  }
  async findByAssignedUser(userId: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks/assigned/${userId}`),
    );

    return response.data;
  }
  async create(data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.tasksServiceUrl}/tasks`, data),
    );

    return response.data;
  }
  async update(id: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.tasksServiceUrl}/tasks/${id}`, data),
    );

    return response.data;
  }
  async updateStatus(id: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.tasksServiceUrl}/tasks/${id}/status`,
        data,
      ),
    );

    return response.data;
  }
  async assign(id: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.tasksServiceUrl}/tasks/${id}/assign`,
        data,
      ),
    );

    return response.data;
  }
  async addItem(id: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.tasksServiceUrl}/tasks/${id}/items`, data),
    );

    return response.data;
  }
  async completeItem(taskId: number, itemId: number) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.tasksServiceUrl}/tasks/${taskId}/items/${itemId}/complete`,
      ),
    );

    return response.data;
  }
  async createTemplate(data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.tasksServiceUrl}/tasks/templates`, data),
    );

    return response.data;
  }
  async findTemplate(id: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks/templates/${id}`),
    );

    return response.data;
  }
  async addTemplateItem(templateId: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.tasksServiceUrl}/tasks/templates/${templateId}/items`,
        data,
      ),
    );

    return response.data;
  }
  async createFromTemplate(templateId: number, data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.tasksServiceUrl}/tasks/templates/${templateId}/create-task`,
        data,
      ),
    );

    return response.data;
  }
}

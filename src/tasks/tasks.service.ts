import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

interface AuthenticatedUserData {
  id: number;
  roleId: number;
  sectorId: number | null;
  isActive: boolean;
  role: {
    name: string;
  };
}

interface SectorEmployeeData {
  id: number;
  sectorId: number | null;
  isActive: boolean;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedUserId?: number;
  dueDate?: string;
}

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl: string;
  private readonly internalServiceSecret: string;
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl =
      this.configService.get<string>('TASKS_SERVICE_URL') ??
      'http://localhost:3002';

    this.usersServiceUrl =
      this.configService.get<string>('USERS_SERVICE_URL') ??
      'http://localhost:3001';

    this.internalServiceSecret = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_SECRET',
    );
  }

  private getInternalHeaders(): {
    'x-internal-service-secret': string;
  } {
    return {
      'x-internal-service-secret': this.internalServiceSecret,
    };
  }

  async findAll() {
    const response = await this.request(
      firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks`, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    return response.data;
  }

  async findMySector(authorization: string) {
    // Identificar al usuario autenticado.
    const userResponse = await this.request(
      firstValueFrom(
        this.httpService.get<AuthenticatedUserData>(
          `${this.usersServiceUrl}/users/me`,
          {
            headers: {
              Authorization: authorization,
            },
          },
        ),
      ),
    );

    const user = userResponse.data;

    // Comprobar que sea un Encargado activo.
    if (!user.isActive || user.role.name !== 'ENCARGADO') {
      throw new ForbiddenException(
        'Esta consulta requiere un Encargado activo',
      );
    }

    // Comprobar que tenga un sector asignado.
    if (user.sectorId === null) {
      throw new ForbiddenException('El Encargado no tiene un sector asignado');
    }

    // Obtener las tareas persistidas en Tasks Service.
    const tasksResponse = await this.request(
      firstValueFrom(
        this.httpService.get<
          Array<{
            id: number;
            sectorId: number | null;
            title: string;
            description: string | null;
            status: string;
            priority: string;
            assignedUserId: number | null;
            dueDate: string | null;
          }>
        >(`${this.tasksServiceUrl}/tasks`, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    // Devolver únicamente las tareas del sector autenticado.
    return tasksResponse.data.filter((task) => task.sectorId === user.sectorId);
  }

  async findOne(id: number) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    return response.data;
  }

  async findByAssignedUser(userId: number) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.get(
          `${this.tasksServiceUrl}/tasks/assigned/${userId}`,
          { headers: this.getInternalHeaders() },
        ),
      ),
    );

    return response.data;
  }

  private async validateSupervisorTaskCreation(
    authorization: string,
    data: CreateTaskData,
  ): Promise<CreateTaskData & { sectorId: number }> {
    const userResponse = await this.request(
      firstValueFrom(
        this.httpService.get<AuthenticatedUserData>(
          `${this.usersServiceUrl}/users/me`,
          {
            headers: { Authorization: authorization },
          },
        ),
      ),
    );

    const user = userResponse.data;

    if (!user.isActive || user.role.name !== 'ENCARGADO') {
      throw new ForbiddenException(
        'Esta operación requiere un Encargado activo',
      );
    }

    if (user.sectorId === null) {
      throw new ForbiddenException('El Encargado no tiene un sector asignado');
    }

    if (!Number.isSafeInteger(data.assignedUserId)) {
      throw new BadRequestException(
        'Debés seleccionar un empleado para la tarea',
      );
    }

    const employeesResponse = await this.request(
      firstValueFrom(
        this.httpService.get<SectorEmployeeData[]>(
          `${this.usersServiceUrl}/users/my-sector`,
          {
            headers: { Authorization: authorization },
          },
        ),
      ),
    );

    const employee = employeesResponse.data.find(
      (item) => item.id === data.assignedUserId,
    );

    if (!employee || !employee.isActive) {
      throw new ForbiddenException(
        'El empleado no pertenece al sector del Encargado',
      );
    }

    return {
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignedUserId: data.assignedUserId,
      dueDate: data.dueDate,
      sectorId: user.sectorId,
    };
  }

  async create(data: unknown, actorUserId: number, authorization: string) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new BadRequestException('Los datos de la tarea son inválidos');
    }

    const validatedData = await this.validateSupervisorTaskCreation(
      authorization,
      data as CreateTaskData,
    );

    const response = await this.request(
      firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/tasks`, validatedData, {
          headers: {
            ...this.getInternalHeaders(),
            'x-actor-user-id': String(actorUserId),
          },
        }),
      ),
    );

    return response.data;
  }

  async update(id: number, data: unknown) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.patch(`${this.tasksServiceUrl}/tasks/${id}`, data, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    return response.data;
  }

  async updateStatus(
    id: number,
    data: unknown,
    actorUserId: number,
    actorRoleId: number | null,
  ) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.patch(
          `${this.tasksServiceUrl}/tasks/${id}/status`,
          data,
          {
            headers: {
              ...this.getInternalHeaders(),
              'x-actor-user-id': String(actorUserId),
              'x-actor-role-id': String(actorRoleId),
            },
          },
        ),
      ),
    );

    return response.data;
  }

  async assign(id: number, data: unknown, actorUserId: number) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.patch(
          `${this.tasksServiceUrl}/tasks/${id}/assign`,
          data,
          {
            headers: {
              ...this.getInternalHeaders(),
              'x-actor-user-id': String(actorUserId),
            },
          },
        ),
      ),
    );

    return response.data;
  }

  async addItem(id: number, data: unknown) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.post(
          `${this.tasksServiceUrl}/tasks/${id}/items`,
          data,
          { headers: this.getInternalHeaders() },
        ),
      ),
    );

    return response.data;
  }

  async completeItem(taskId: number, itemId: number) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.patch(
          `${this.tasksServiceUrl}/tasks/${taskId}/items/${itemId}/complete`,
          {},
          { headers: this.getInternalHeaders() },
        ),
      ),
    );

    return response.data;
  }

  async createTemplate(data: unknown) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/tasks/templates`, data, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    return response.data;
  }

  async findTemplate(id: number) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/templates/${id}`, {
          headers: this.getInternalHeaders(),
        }),
      ),
    );

    return response.data;
  }

  async addTemplateItem(templateId: number, data: unknown) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.post(
          `${this.tasksServiceUrl}/tasks/templates/${templateId}/items`,
          data,
          { headers: this.getInternalHeaders() },
        ),
      ),
    );

    return response.data;
  }

  async createFromTemplate(templateId: number, data: unknown) {
    const response = await this.request(
      firstValueFrom(
        this.httpService.post(
          `${this.tasksServiceUrl}/tasks/templates/${templateId}/create-task`,
          data,
          { headers: this.getInternalHeaders() },
        ),
      ),
    );

    return response.data;
  }

  private async request<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error: unknown) {
      this.handleServiceError(error);
    }
  }

  private handleServiceError(error: unknown): never {
    if (isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Tasks service is unavailable');
      }

      if (error.response) {
        const status = error.response.status;
        const responseData: unknown = error.response.data;

        throw new HttpException(
          responseData ?? {
            message: 'Error en el microservicio Tasks',
          },
          status,
        );
      }
    }

    throw new BadGatewayException('Error communicating with Tasks service');
  }
}

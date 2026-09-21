import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface AuthenticatedUser {
  userId: number;
  email: string;
  roleId: number | null;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    const authorization = request.headers.authorization;

    if (!user?.roleId) {
      throw new ForbiddenException('El usuario no tiene un rol asignado');
    }

    if (!authorization) {
      throw new ForbiddenException('No se encontró el token de autorización');
    }

    const role = await this.permissionsService.findByRole(
      user.roleId,
      authorization,
    );

    const userPermissions = role.permissions.map(
      (rolePermission: { permission: { name: string } }) =>
        rolePermission.permission.name,
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }

    return true;
  }
}

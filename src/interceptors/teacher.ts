import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { rolesEnum } from '../enums/rolesEnum';

@Injectable()
export class RoleInterceptorFunction implements NestInterceptor {
  private roles: string[];

  constructor(
    private readonly reflector: Reflector,
    roles: string[],
  ) {
    this.roles = [...roles, rolesEnum.ADMIN, rolesEnum.TEACHER].map((role) =>
      role.toUpperCase(),
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (!this.roles.includes(request.user.role.toUpperCase()) && !isPublic) {
      throw new UnauthorizedException();
    }

    return next.handle();
  }
}

export function TeachersRoleInterceptor(roles: string[]) {
  return new RoleInterceptorFunction(new Reflector(), roles);
}

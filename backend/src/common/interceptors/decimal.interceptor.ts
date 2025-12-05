import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DecimalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transformDecimals(data)),
    );
  }

  private transformDecimals(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Date objects - ensure they are serialized as ISO strings
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle Decimal type from Prisma
    // Prisma Decimal objects have a toNumber() method and a toString() method
    if (data && typeof data === 'object') {
      // Check if it's a Prisma Decimal by checking for toNumber method
      if (typeof data.toNumber === 'function') {
        return data.toNumber();
      }
      
      // Also check constructor name as fallback
      if (data.constructor && data.constructor.name === 'Decimal') {
        return Number(data);
      }

      // Handle arrays
      if (Array.isArray(data)) {
        return data.map((item) => this.transformDecimals(item));
      }

      // Handle objects
      const transformed: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          transformed[key] = this.transformDecimals(data[key]);
        }
      }
      return transformed;
    }

    return data;
  }
}

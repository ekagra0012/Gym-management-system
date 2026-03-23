import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Assigns a unique X-Request-ID to every incoming request.
 * This is invaluable for distributed tracing and correlating logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    (req as any)['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}

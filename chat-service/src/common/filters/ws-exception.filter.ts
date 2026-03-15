import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface WsError {
  code: string;
  message: string;
}

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();

    const wsError: WsError = this.formatError(error);

    client.emit('error', wsError);
  }

  private formatError(error: unknown): WsError {
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return {
        code: (errorObj.code as string) || 'INTERNAL_ERROR',
        message: (errorObj.message as string) || 'An unexpected error occurred',
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'ERROR',
        message: error,
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

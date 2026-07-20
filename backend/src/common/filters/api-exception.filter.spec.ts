import { ArgumentsHost, ConflictException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createHost() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as unknown as Response;
    const request = {
      method: 'GET',
      originalUrl: '/api/v1/example',
    } as Request;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    return { host, status, json };
  }

  it('preserves documented HTTP exception messages', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new ConflictException({
        success: false,
        message: 'A safe message.',
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'A safe message.',
    });
  });

  it('does not expose unexpected exception details', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('database password leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  });
});

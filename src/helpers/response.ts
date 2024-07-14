export enum Httpcode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_SERVER_ERROR = 500,
}

type ApiResponse = {
  status: boolean;
  error?: string;
  message: string;
  data?: Object | string;
};

class ResponseHandler {
  private static async generateErrorResponse(
    error: string,
    message?: string,
  ): Promise<ApiResponse> {
    return {
      status: false,
      error,
      message,
    };
  }

  public async success(message: string, data?: Object | string): Promise<ApiResponse> {
    return {
      status: true,
      message,
      data,
    };
  }

  public async created(message: string, data?: Object | string): Promise<ApiResponse> {
    return this.success(message, data);
  }

  public async BadRequestException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async UnauthorizedException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async ForbiddenException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async NotFoundException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async ConflictException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async ValidationErrorExeception(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }

  public async InternalServerErrorException(error: string, message: string): Promise<ApiResponse> {
    return ResponseHandler.generateErrorResponse(error, message);
  }
}

export { ResponseHandler };

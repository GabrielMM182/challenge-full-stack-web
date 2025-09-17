export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  timestamp: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type CreateFunction<TInput, TOutput> = (data: TInput) => Promise<TOutput>;
export type UpdateFunction<TInput, TOutput> = (id: string, data: TInput) => Promise<TOutput>;
export type FindFunction<TFilters, TOutput> = (filters: TFilters, pagination: PaginationParams) => Promise<PaginatedResponse<TOutput>>;
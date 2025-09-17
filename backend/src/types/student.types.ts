
export interface StudentCreateInput {
  name: string;
  email: string;
  ra: string;
  cpf: string;
}

export interface StudentUpdateInput {
  name?: string;
  email?: string;
}

export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  ra: string;
  cpf: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFilters {
  name?: string;
  email?: string;
  ra?: string;
  cpf?: string;
  search?: string;
}
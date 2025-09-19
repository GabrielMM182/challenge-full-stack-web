import { z } from 'zod'

// CPF validation function
const validateCpf = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false
  
  return true
}

export const studentCreateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  ra: z.string()
    .min(1, 'RA é obrigatório')
    .regex(/^[A-Z0-9]+$/, 'RA deve conter apenas letras maiúsculas e números'),
  // cpf: z.string()
  //   .min(1, 'CPF é obrigatório')
  //   .max(11, 'CPF deve conter 11 dígitos')
  //   .refine((cpf) => {
  //     const cleanCpf = cpf.replace(/\D/g, '')
  //     return cleanCpf.length === 11
  //   }, 'CPF deve ter 11 dígitos')
  //   .refine(validateCpf, 'CPF inválido')
})

export const studentUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
})

export type StudentCreateInput = z.infer<typeof studentCreateSchema>
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>
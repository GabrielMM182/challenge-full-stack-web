import { z } from 'zod'

const validateCpf = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  
  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleanCpf.charAt(9)) !== firstDigit) {
    return false
  }
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  
  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(cleanCpf.charAt(10)) === secondDigit
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
    .max(8, 'RA deve contem 8 digitos')
    .regex(/^[A-Z0-9]+$/, 'RA deve conter apenas letras maiúsculas e números'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine((cpf) => {
      const cleanCpf = cpf.replace(/\D/g, '')
      return cleanCpf.length === 11
    }, 'CPF deve ter 11 dígitos')
    .refine(validateCpf, 'CPF inválido')
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
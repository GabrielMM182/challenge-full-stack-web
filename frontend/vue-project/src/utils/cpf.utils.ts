export function formatCpf(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length === 11) {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  return cpf
}

export function maskCpfForSecurity(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length === 11) {
    const first3 = cleanCpf.substring(0, 3)
    const last2 = cleanCpf.substring(9, 11)
    return `${first3}.***.***-${last2}`
  }
  
  return cpf
}

export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function isValidCpfFormat(cpf: string): boolean {
  const cleaned = cleanCpf(cpf)
  return cleaned.length === 11
}
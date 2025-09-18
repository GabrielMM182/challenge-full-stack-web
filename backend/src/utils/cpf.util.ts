export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');  
  if (cleanCPF.length !== 11) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
    let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cleanCPF.charAt(9)) !== firstDigit) {
    return false;
  }
    sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(cleanCPF.charAt(10)) === secondDigit;
};

export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return cpf; 
  }
  
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};
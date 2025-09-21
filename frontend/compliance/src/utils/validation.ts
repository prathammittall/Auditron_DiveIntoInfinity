import { INSURANCE_KEYWORDS } from './constants';

export const validateInsuranceContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return INSURANCE_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
};

export const getDocumentType = (filename: string) => {
  const name = filename.toLowerCase();
  if (name.includes('health') || name.includes('medical')) return 'health';
  if (name.includes('auto') || name.includes('car')) return 'auto';
  if (name.includes('life')) return 'life';
  return 'general';
};
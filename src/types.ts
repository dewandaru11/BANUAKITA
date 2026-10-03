export interface LetterField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface LetterType {
  id: string;
  name: string;
  category: string;
  icon: string;
  fields: LetterField[];
}

export interface FormData {
  [key: string]: string;
}

export interface VillageInfo {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  kepalaDesa: string;
  nipKepalaDesa: string;
}

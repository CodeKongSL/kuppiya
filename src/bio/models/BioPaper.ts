export interface BioPaper {
  id: string;
  year: number;
  title: string;
  questions: number;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BioPaperResponse {
  success: boolean;
  data: BioPaper[];
  message?: string;
}
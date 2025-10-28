export interface BioPaper {
  paper_id: string;
  year: number;
  title: string;
  total_questions: number;
  duration: number;
  created_at?: string;
  updated_at?: string;
}

export interface BioPaperResponse {
  success: boolean;
  data: BioPaper[];
  message?: string;
}
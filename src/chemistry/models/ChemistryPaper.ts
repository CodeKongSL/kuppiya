export interface ChemistryPaper {
  paper_id: string;
  year: number;
  title: string;
  total_questions: number;
  duration: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChemistryPaperResponse {
  success: boolean;
  data: ChemistryPaper[];
  message?: string;
}

export interface BioQuestion {
  id: string;
  paper_id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BioQuestionResponse {
  success: boolean;
  data: BioQuestion;
  message?: string;
}
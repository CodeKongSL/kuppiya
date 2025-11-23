// Media type for questions and answers
export interface Media {
  type: "text" | "image";
  text?: string;
  url?: string;
  alt?: string;
}

export interface BioQuestion {
  id: string;
  paper_id: string;
  question_number: number;
  question_text: string;
  question_images?: string[]; // Array of image URLs
  option_a: string | Media;
  option_b: string | Media;
  option_c: string | Media;
  option_d: string | Media;
  option_e?: string | Media; // Added for 5th option
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
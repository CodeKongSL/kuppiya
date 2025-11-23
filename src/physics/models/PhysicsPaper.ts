export interface PhysicsPaper {
  _id: string;
  paper_id: string;
  exam_info: {
    year: string;
    exam_name: {
      sinhala: string;
      tamil: string;
      english: string;
    };
    subject: {
      sinhala: string;
      tamil: string;
      english: string;
    };
  };
  total_questions: number;
  created_at: string;
}

export interface PhysicsPapersResponse {
  success: boolean;
  data: PhysicsPaper[];
  message?: string;
}

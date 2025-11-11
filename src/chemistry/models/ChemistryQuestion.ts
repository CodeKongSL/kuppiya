// Basic MCQ (Questions 1-30)
export interface BasicMCQQuestion {
  question_number: number;
  question_type: "";
  question_text: string | null;
  options: string[];
}

// Grouped MCQ (Questions 31-40)
export interface SubQuestion {
  label: string;
  text: string | null;
}

export interface AnswerTable {
  instruction: string | null;
  options: string[];
}

export interface GroupedMCQQuestion {
  question_number: number;
  question_type: "grouped_mcq";
  question_text: string | null;
  group_instructions: string | null;
  sub_questions: SubQuestion[];
  answer_table: AnswerTable;
}

// Assertion-Reason (Questions 41-50)
export interface QuestionTable {
  statement_1: string | null;
  statement_2: string | null;
  answer_choices: string[];
}

export interface AssertionReasonQuestion {
  question_number: number;
  question_type: "assertion_reason";
  group_instructions: string | null;
  question_table: QuestionTable;
}

// Union type for all question types
export type ChemistryQuestion = BasicMCQQuestion | GroupedMCQQuestion | AssertionReasonQuestion;

export interface ChemistryQuestionResponse {
  success: boolean;
  data: ChemistryQuestion;
  message?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ExamPaper {
  id: string;
  year: number;
  title: string;
  questions: Question[];
  duration: number; // in minutes
}

export interface AttemptHistory {
  id: string;
  paperId: string;
  paperYear: number;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number; // in seconds
  answers: number[];
}

// Generate dummy questions
const generateQuestions = (year: number): Question[] => {
  const subjects = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Computer Science'];
  const questions: Question[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    questions.push({
      id: i,
      question: `${subject} Question ${i} (${year}): Which of the following statements best describes the relationship between energy conservation and thermodynamic principles in a closed system?`,
      options: [
        'Energy can be created and destroyed within the system boundaries',
        'Total energy remains constant while entropy tends to increase',
        'The system can perform unlimited work without energy input',
        'Entropy decreases spontaneously in isolated systems'
      ],
      correctAnswer: 1, // Index of correct option (0-based)
      explanation: `The correct answer is option B. According to the first law of thermodynamics, energy is conserved in a closed system - it cannot be created or destroyed, only transformed from one form to another. The second law states that entropy (disorder) tends to increase in isolated systems over time. This fundamental principle explains why certain processes occur naturally while others do not.`
    });
  }
  
  return questions;
};

// Generate 10 years of past papers
export const examPapers: ExamPaper[] = Array.from({ length: 10 }, (_, i) => {
  const year = 2024 - i;
  return {
    id: `paper-${year}`,
    year,
    title: `Annual Examination ${year}`,
    questions: generateQuestions(year),
    duration: 60 // 60 minutes
  };
});

// Helper functions for localStorage
export const saveAttempt = (attempt: AttemptHistory) => {
  const attempts = getAttemptHistory();
  attempts.push(attempt);
  localStorage.setItem('examAttempts', JSON.stringify(attempts));
};

export const getAttemptHistory = (): AttemptHistory[] => {
  const stored = localStorage.getItem('examAttempts');
  return stored ? JSON.parse(stored) : [];
};

export const getAttemptsByPaper = (paperId: string): AttemptHistory[] => {
  const attempts = getAttemptHistory();
  return attempts.filter(a => a.paperId === paperId);
};

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

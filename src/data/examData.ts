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
  subject: 'Bio' | 'Chemistry' | 'Physics';
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

// Generate dummy questions based on subject
const generateQuestions = (year: number, subject: string): Question[] => {
  const questions: Question[] = [];
  
  const questionTemplates: Record<string, string> = {
    Bio: 'Which of the following best describes the process of cellular respiration in mitochondria?',
    Chemistry: 'Which statement correctly describes the behavior of electrons in a chemical bond?',
    Physics: 'Which of the following statements best describes the relationship between energy conservation and thermodynamic principles in a closed system?'
  };
  
  for (let i = 1; i <= 50; i++) {
    questions.push({
      id: i,
      question: `${subject} Question ${i} (${year}): ${questionTemplates[subject] || questionTemplates.Physics}`,
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

// Generate 10 papers for each of 3 subjects (30 total)
export const examPapers: ExamPaper[] = [];
const subjects: Array<'Bio' | 'Chemistry' | 'Physics'> = ['Bio', 'Chemistry', 'Physics'];

subjects.forEach(subject => {
  for (let i = 0; i < 10; i++) {
    const year = 2024 - i;
    examPapers.push({
      id: `${subject.toLowerCase()}-${year}`,
      year,
      subject,
      title: `${subject} Examination ${year}`,
      questions: generateQuestions(year, subject),
      duration: 60 // 60 minutes
    });
  }
});

export const getPapersBySubject = (subject: string): ExamPaper[] => {
  return examPapers.filter(p => p.subject === subject);
};

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

import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface QuizOption {
  id?: string;
  text: string;
  position?: number;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id?: string;
  text: string;
  position?: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  sectionId: string;
  title: string;
  passMark: number;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface CreateQuizPayload {
  title: string;
  sectionId: string;
  passMark: number;
  questions: {
    text: string;
    options: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface UpdateQuizPayload {
  title?: string;
  passMark?: number;
}

export interface QuizStats {
  totalAttempts: number;
  totalPassed: number;
  passRate: number;
  averageScore: number;
}

export interface QuizAnswer {
  questionId: string;
  optionId: string;
}

export interface SubmitQuizPayload {
  answers: QuizAnswer[];
}

export interface QuizAnswerResult {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  resolvedGrade: number;
  passed: boolean;
  submittedAt: string;
  answers: QuizAnswerResult[];
}

export interface PaginatedQuizzes {
  data: Quiz[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== SERVICE ====================

export default class QuizService {
  
  /**
   * Create a quiz for a course section (instructor)
   * @param payload - Quiz data with questions and options
   */
  static async create(payload: CreateQuizPayload): Promise<Quiz> {
    try {
      const response = await APIConfig.fetch("/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error('Failed to create quiz:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          throw new Error('Invalid quiz data. Each question must have exactly 4 options with one correct answer.');
        } else if (error.message.includes('403')) {
          throw new Error('Access denied. You do not own this course section.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to create quizzes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * List quizzes (instructor / admin)
   * @param params - Optional filters (page, limit, sectionId)
   */
  static async findAll(params?: {
    page?: number;
    limit?: number;
    sectionId?: string;
  }): Promise<PaginatedQuizzes> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", String(params.page));
      if (params?.limit) queryParams.append("limit", String(params.limit));
      if (params?.sectionId) queryParams.append("sectionId", params.sectionId);

      const queryString = queryParams.toString();
      const response = await APIConfig.fetch(`/quizzes${queryString ? `?${queryString}` : ""}`);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Please log in to view quizzes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get a single quiz by ID
   * @param id - Quiz ID
   */
  static async findOne(id: string): Promise<Quiz> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch quiz ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error(`Quiz not found: ${id}`);
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view quiz details.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Update quiz title or pass mark (instructor)
   * @param id - Quiz ID
   * @param payload - Fields to update
   */
  static async update(id: string, payload: UpdateQuizPayload): Promise<Quiz> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error(`Failed to update quiz ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('Access denied. You do not own this quiz.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to update quizzes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete a quiz (instructor)
   * @param id - Quiz ID
   */
  static async remove(id: string): Promise<void> {
    try {
      await APIConfig.fetch(`/quizzes/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete quiz ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('Access denied. You do not own this quiz.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to delete quizzes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get all student attempts for a quiz (instructor)
   * @param id - Quiz ID
   */
  static async getAttempts(id: string): Promise<QuizAttempt[]> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}/attempts`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch quiz attempts for ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('Access denied. You do not own this quiz.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view quiz attempts.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get attempt stats for a quiz (instructor)
   * @param id - Quiz ID
   */
  static async getStats(id: string): Promise<QuizStats> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}/stats`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch quiz stats for ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Please log in to view quiz statistics.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Submit a quiz attempt (student)
   * @param id - Quiz ID
   * @param payload - Student's answers
   */
  static async submit(id: string, payload: SubmitQuizPayload): Promise<QuizAttempt> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error(`Failed to submit quiz ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          throw new Error('Invalid submission. Please answer all questions.');
        } else if (error.message.includes('403')) {
          throw new Error('You are not enrolled in this course.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to submit quizzes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get the calling student's attempt for a quiz
   * @param id - Quiz ID
   */
  static async getMyAttempt(id: string): Promise<QuizAttempt> {
    try {
      const response = await APIConfig.fetch(`/quizzes/${id}/my-attempt`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch my attempt for quiz ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('You have not attempted this quiz yet.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view your quiz attempt.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get quizzes for a specific section
   * @param sectionId - Section ID
   */
  static async findBySection(sectionId: string): Promise<Quiz[]> {
    try {
      const result = await this.findAll({ sectionId, limit: 100 });
      return result.data;
    } catch (error) {
      console.error(`Failed to fetch quizzes for section ${sectionId}:`, error);
      throw error;
    }
  }
}

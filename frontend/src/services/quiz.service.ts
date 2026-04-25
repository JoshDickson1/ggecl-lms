import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export interface QuizOption {
  id: string;
  text: string;
  position: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  position: number;
  options: QuizOption[];
}

export interface CreateQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuizQuestion {
  text: string;
  options: CreateQuizOption[];
}

export interface CreateQuizDto {
  title: string;
  sectionId: string;
  passMark: number;
  questions: CreateQuizQuestion[];
}

export interface UpdateQuizDto {
  title?: string;
  passMark?: number;
}

export interface QuizResponse {
  id: string;
  sectionId: string;
  title: string;
  passMark: number;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizListResponse {
  data: QuizResponse[];
  meta: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface QuizStats {
  totalAttempts: number;
  totalPassed: number;
  passRate: number;
  averageScore: number;
}

// ==================== SERVICE ====================

export default class QuizService {
  /**
   * Create a quiz for a course section
   */
  static async createQuiz(payload: CreateQuizDto): Promise<QuizResponse> {
    const response = await APIConfig.fetch('/quizzes', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * List quizzes (instructor / admin)
   */
  static async getQuizzes(params?: {
    page?: number;
    limit?: number;
    sectionId?: string;
  }): Promise<QuizListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sectionId) searchParams.append('sectionId', params.sectionId);
    
    const query = searchParams.toString();
    const url = `/quizzes${query ? `?${query}` : ''}`;
    
    const response = await APIConfig.fetch(url);
    return response.json();
  }

  /**
   * Get a single quiz by ID
   */
  static async getQuiz(quizId: string): Promise<QuizResponse> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}`);
    return response.json();
  }

  /**
   * Update quiz title or pass mark (instructor)
   */
  static async updateQuiz(quizId: string, payload: UpdateQuizDto): Promise<QuizResponse> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a quiz (instructor)
   */
  static async deleteQuiz(quizId: string): Promise<void> {
    await APIConfig.fetch(`/quizzes/${quizId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get all student attempts for a quiz (instructor)
   */
  static async getQuizAttempts(quizId: string): Promise<any[]> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}/attempts`);
    return response.json();
  }

  /**
   * Get attempt stats for a quiz (instructor)
   */
  static async getQuizStats(quizId: string): Promise<QuizStats> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}/stats`);
    return response.json();
  }

  /**
   * Submit a quiz attempt (student)
   */
  static async submitQuiz(quizId: string, answers: {
    questionId: string;
    optionId: string;
  }[]): Promise<any> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    return response.json();
  }

  /**
   * Get the calling student's attempt for a quiz
   */
  static async getMyAttempt(quizId: string): Promise<any> {
    const response = await APIConfig.fetch(`/quizzes/${quizId}/my-attempt`);
    return response.json();
  }
}

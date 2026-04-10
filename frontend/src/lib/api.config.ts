// ==================== ERROR ====================

export class APIError extends Error {
    code: string;
  
    constructor(name: string, message: string, code: string) {
      super(message);
      this.name = name || "APIError";
      this.code = code;
    }
  }
  
  // ==================== CONFIG ====================
  
  export class APIConfig {
    static baseURL = import.meta.env.VITE_API_URL;
  
    /**
     * Fetch wrapper for all API calls.
     * Cookies are sent automatically by the browser (better-auth httpOnly session).
     * @param endpoint - Path relative to /api (e.g. "/applications")
     * @param options  - Standard RequestInit options
     */
    static async fetch(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<Response> {
      const url = `${this.baseURL}/api${endpoint}`;
  
      const response = await fetch(url, {
        ...options,
        // Sends the httpOnly session cookie on every request
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
  
        // NestJS default error shape:
        // { statusCode: number, message: string, error: string }
        throw new APIError(
          errorData.error || "APIError",
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }
  
      return response;
    }
  }
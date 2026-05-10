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
      console.log('API Request:', { method: options.method || 'GET', url, endpoint });
  
      const response = await fetch(url, {
        ...options,
        // Sends the httpOnly session cookie on every request
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', { status: response.status, url, errorData });
  
        // NestJS default error shape:
        // { statusCode: number, message: string, error: string }
        // message can be a string or an array of validation errors
        const message = Array.isArray(errorData.message)
          ? errorData.message.join('; ')
          : errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        throw new APIError(
          errorData.error || "APIError",
          message,
          `HTTP_${response.status}`
        );
      }
  
      return response;
    }
  }
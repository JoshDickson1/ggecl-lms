export type ErrorResType<T> = {
  success: boolean;
  message?: T;
  error: T | null;
  errors: { field: T; message: T }[];
};

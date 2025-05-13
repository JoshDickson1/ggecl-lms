import { useNavigate } from "react-router";

interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export function useCustomNavigate() {
  const navigate = useNavigate();

  function handleNavigate(path: string, options?: NavigateOptions) {
    if (!path) return;
    navigate(path, options);
  }

  return { navigate: handleNavigate };
}

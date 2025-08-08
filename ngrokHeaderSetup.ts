(() => {
  const HEADER_NAME = 'ngrok-skip-browser-warning';
  const HEADER_VALUE = '69420';
  try {
    const originalFetch = (window as any).fetch?.bind(window);
    if (!originalFetch) return;
    (window as any).fetch = (input: RequestInfo, init?: RequestInit) => {
      const newInit: RequestInit = init ? { ...init } : {} as RequestInit;
      const headersArg = init?.headers;
      const headers = new Headers(headersArg as any);
      headers.set(HEADER_NAME, HEADER_VALUE);
      (newInit as any).headers = headers;
      return originalFetch(input, newInit);
    };
  } catch {
    // If running in a non-browser environment, skip wiring.
  }
})();

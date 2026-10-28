// React 19 console warning safety handler
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Attempted to synchronously unmount a root while React was already rendering') ||
       args[0].includes('already been passed to createRoot()'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

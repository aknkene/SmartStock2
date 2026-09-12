export const executeGoogleScript = <T>(
  functionName: string,
  ...args: any[]
): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Check if we are running inside Google Apps Script environment
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.script && (window as any).google.script.run) {
      (window as any).google.script.run
        .withSuccessHandler((result: T) => {
          console.log(`[GAS Success] ${functionName}`, result);
          resolve(result);
        })
        .withFailureHandler((error: any) => {
          console.error(`[GAS Error] ${functionName}`, error);
          reject(error);
        })
        [functionName](...args);
    } else {
      // Not in GAS environment (e.g., local development or AI Studio preview)
      const errorMsg = `google.script.run is not available in this environment. Attempted to call: ${functionName}`;
      console.warn(errorMsg);
      reject(new Error(errorMsg));
    }
  });
};

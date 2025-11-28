/**
 * Handle exact /publish path
 * This ensures the exact path is handled by the proxy
 */
export default defineEventHandler(async (event) => {
  // Import and use the catch-all handler
  const catchAll = await import('./[...].ts');
  return catchAll.default(event);
});


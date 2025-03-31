import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to verify API key for outbreak detection system requests
 */
export function withApiKeyAuth(handler: Function) {
  return async (req: NextRequest, context?: any) => {
    // Get the API key from the Authorization header
    const authHeader = req.headers.get('Authorization');
    const apiKey = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Check if the API key is valid
    if (!apiKey || apiKey !== process.env.OUTBREAK_DETECTION_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' }, 
        { status: 401 }
      );
    }
    
    // Wait for the context params to be resolved if they exist
    const resolvedContext = context ? await context : context;
    
    // Call the handler if the API key is valid
    return handler(req, resolvedContext);
  };
} 
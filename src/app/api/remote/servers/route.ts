
import { NextResponse } from 'next/server';

/**
 * This is a placeholder API endpoint that the Wings daemon calls to get a list
 * of servers it should be managing. For now, it returns an empty list to prevent
 * the daemon from crashing with a 404 error.
 */
export async function GET(request: Request) {
  // In a real implementation, you would:
  // 1. Authenticate the request from the Wings daemon using the provided Bearer token.
  // 2. Find the node associated with that token.
  // 3. Fetch all servers assigned to that node from the database.
  // 4. Return the server configurations in the format Wings expects.

  const response = {
    object: 'list',
    data: [],
  };

  return NextResponse.json(response);
}

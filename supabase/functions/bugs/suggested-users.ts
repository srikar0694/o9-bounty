const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function handleSuggestedUsers(req: Request, bugId: string) {
  if (req.method !== 'GET') {
    throw new Error('Method not allowed');
  }

  if (!bugId) {
    throw new Error('Bug ID is required');
  }

  // Mock suggested users for now
  // In a real implementation, this would:
  // 1. Analyze the bug details and ADO work item
  // 2. Use ML/scoring algorithms to suggest relevant users
  // 3. Consider user expertise, availability, past performance
  const suggestedUsers = {
    users: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        display_name: 'John Doe',
        email: 'john.doe@company.com',
        score: 8.5
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002', 
        display_name: 'Jane Smith',
        email: 'jane.smith@company.com',
        score: 7.2
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        display_name: 'Bob Johnson', 
        email: 'bob.johnson@company.com',
        score: 6.8
      }
    ]
  };

  return new Response(
    JSON.stringify(suggestedUsers),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } 
    }
  );
}
import { handleSuggestedUsers } from './suggested-users.ts';
import { handleTagUsers } from './tag-users.ts';
import { handleTagGroups } from './tag-groups.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected paths:
    // /bugs/{bugId}/suggested-users
    // /bugs/{bugId}/tag-users
    // /bugs/{bugId}/tag-groups
    
    if (pathParts.length < 2) {
      throw new Error('Invalid path');
    }

    const bugId = pathParts[0];
    const action = pathParts[1];

    switch (action) {
      case 'suggested-users':
        return await handleSuggestedUsers(req, bugId);
      case 'tag-users':
        return await handleTagUsers(req, bugId);
      case 'tag-groups':
        return await handleTagGroups(req, bugId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
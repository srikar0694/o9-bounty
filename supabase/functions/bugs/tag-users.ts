import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const tagUsersSchema = z.object({
  user_ids: z.array(z.string().uuid())
});

export async function handleTagUsers(req: Request, bugId: string) {
  if (req.method !== 'POST') {
    throw new Error('Method not allowed');
  }

  if (!bugId) {
    throw new Error('Bug ID is required');
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const body = await req.json();
  const { user_ids } = tagUsersSchema.parse(body);

  // Remove existing user tags for this bug
  await supabaseClient
    .from('bug_tag_users')
    .delete()
    .eq('bug_id', bugId);

  // Insert new user tags
  if (user_ids.length > 0) {
    const tagData = user_ids.map(user_id => ({
      bug_id: bugId,
      user_id
    }));

    const { error: insertError } = await supabaseClient
      .from('bug_tag_users')
      .insert(tagData);

    if (insertError) {
      throw insertError;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Tagged ${user_ids.length} users to bug`
    }),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } 
    }
  );
}
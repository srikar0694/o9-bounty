import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const tagGroupsSchema = z.object({
  group_ids: z.array(z.string().uuid())
});

export async function handleTagGroups(req: Request, bugId: string) {
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
  const { group_ids } = tagGroupsSchema.parse(body);

  // Remove existing group tags for this bug
  await supabaseClient
    .from('bug_tag_groups')
    .delete()
    .eq('bug_id', bugId);

  // Insert new group tags
  if (group_ids.length > 0) {
    const tagData = group_ids.map(group_id => ({
      bug_id: bugId,
      group_id
    }));

    const { error: insertError } = await supabaseClient
      .from('bug_tag_groups')
      .insert(tagData);

    if (insertError) {
      throw insertError;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Tagged ${group_ids.length} groups to bug`
    }),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } 
    }
  );
}
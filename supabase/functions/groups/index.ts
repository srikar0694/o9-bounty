import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const createGroupSchema = z.object({
  group_id: z.string().min(1),
  name: z.string().min(1),
  user_ids: z.array(z.string().uuid())
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_uid', user.id)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    const body = await req.json()
    const groupData = createGroupSchema.parse(body)

    // Create group
    const { data: group, error: groupError } = await supabaseClient
      .from('groups')
      .insert({
        group_id: groupData.group_id,
        name: groupData.name,
        created_by: profile.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (groupError) {
      throw groupError
    }

    // Add group members
    if (groupData.user_ids.length > 0) {
      const memberData = groupData.user_ids.map(user_id => ({
        group_id: group.id,
        user_id,
        role: 'member',
        added_at: new Date().toISOString()
      }))

      const { error: memberError } = await supabaseClient
        .from('group_members')
        .insert(memberData)

      if (memberError) {
        throw memberError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: group
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
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
    )
  }
})
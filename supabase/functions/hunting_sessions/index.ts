import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const huntingSessionSchema = z.object({
  bug_id: z.string().uuid(),
  repro_text: z.string().min(1),
  pr_link: z.string().url().optional(),
  assigned_module_lead: z.string().uuid().optional()
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
    const sessionData = huntingSessionSchema.parse(body)

    // Create hunting session
    const { data: session, error: sessionError } = await supabaseClient
      .from('hunting_sessions')
      .insert({
        bug_id: sessionData.bug_id,
        user_id: profile.id,
        started_at: new Date().toISOString(),
        action_code: 'started',
        repro_text: sessionData.repro_text,
        pr_link: sessionData.pr_link || null,
        assigned_module_lead: sessionData.assigned_module_lead || null,
        accepted_by_lead: false,
        points_awarded: null,
        awarded_at: null
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    // Update bug status to in_progress if it's open
    await supabaseClient
      .from('bugs')
      .update({ 
        status_code: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionData.bug_id)
      .eq('status_code', 'open')

    return new Response(
      JSON.stringify({ 
        success: true,
        data: session
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
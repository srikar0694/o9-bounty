import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const awardPointsSchema = z.object({
  mode: z.enum(['rootcause', 'fix', 'both'])
})

function calculatePoints(basePoints: number, mode: string): number {
  switch (mode) {
    case 'rootcause':
      return Math.round(basePoints * 0.1)
    case 'fix':
      return Math.round(basePoints * 0.9)
    case 'both':
      return basePoints
    default:
      return 0
  }
}

function getPointBreakdown(mode: string) {
  switch (mode) {
    case 'rootcause':
      return { rootcause_pct: 100, fix_pct: 0 }
    case 'fix':
      return { rootcause_pct: 0, fix_pct: 100 }
    case 'both':
      return { rootcause_pct: 10, fix_pct: 90 }
    default:
      return { rootcause_pct: 0, fix_pct: 0 }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const sessionId = url.pathname.split('/')[2] // /hunting_sessions/{sessionId}/award
    
    if (!sessionId) {
      throw new Error('Session ID is required')
    }

    const body = await req.json()
    const { mode } = awardPointsSchema.parse(body)

    // Get hunting session with bug and point info
    const { data: session, error: sessionError } = await supabaseClient
      .from('hunting_sessions')
      .select(`
        *,
        bugs (
          id,
          points,
          point_scale!inner (
            value
          )
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Hunting session not found')
    }

    const basePointValue = session.bugs.point_scale.value
    const pointsAwarded = calculatePoints(basePointValue, mode)
    const breakdown = getPointBreakdown(mode)
    const now = new Date().toISOString()

    // Start transaction
    const { error: updateSessionError } = await supabaseClient
      .from('hunting_sessions')
      .update({
        accepted_by_lead: true,
        points_awarded: pointsAwarded,
        awarded_at: now
      })
      .eq('id', sessionId)

    if (updateSessionError) {
      throw updateSessionError
    }

    // Insert points payment record
    const { error: paymentError } = await supabaseClient
      .from('points_payments')
      .insert({
        hunting_session_id: sessionId,
        user_id: session.user_id,
        bug_id: session.bug_id,
        points: pointsAwarded,
        breakdown: breakdown,
        reason: `Points awarded for ${mode} work on bug`,
        created_at: now
      })

    if (paymentError) {
      throw paymentError
    }

    // Update user stats
    const { data: currentStats } = await supabaseClient
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user_id)
      .single()

    if (currentStats) {
      // Update existing stats
      await supabaseClient
        .from('user_stats')
        .update({
          bugs_solved: currentStats.bugs_solved + 1,
          points_earned: currentStats.points_earned + pointsAwarded,
          last_updated: now
        })
        .eq('user_id', session.user_id)
    } else {
      // Create new stats record
      await supabaseClient
        .from('user_stats')
        .insert({
          user_id: session.user_id,
          bugs_solved: 1,
          bugs_identified: 0,
          active_bugs: 0,
          points_earned: pointsAwarded,
          last_updated: now
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          points_awarded: pointsAwarded,
          breakdown: breakdown
        }
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
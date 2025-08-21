// Database types based on Supabase schema
export type PointSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL';

export interface UserRow {
  id: string;
  auth_uid: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface AdoWorkItemRow {
  id: number;
  title: string;
  description: string;
  work_item_type: string;
  state: string;
  url: string;
  last_synced_at: string;
}

export interface BugRow {
  id: string;
  ado_id: number;
  created_by: string;
  assigned_to: string | null;
  points: PointSize;
  start_date: string;
  end_date: string | null;
  status_code: string;
  details: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BugStatusRow {
  id: number;
  code: string;
  label: string;
}

export interface HuntingActionRow {
  id: number;
  code: string;
  label: string;
}

export interface GroupRow {
  id: string;
  group_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface GroupMemberRow {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  added_at: string;
}

export interface TagRow {
  id: string;
  name: string;
}

export interface BugTagRow {
  id: string;
  bug_id: string;
  tag_id: string;
}

export interface BugTagGroupRow {
  id: string;
  bug_id: string;
  group_id: string;
}

export interface BugTagUserRow {
  id: string;
  bug_id: string;
  user_id: string;
}

export interface HuntingSessionRow {
  id: string;
  bug_id: string;
  user_id: string;
  started_at: string;
  action_code: string;
  repro_text: string | null;
  pr_link: string | null;
  assigned_module_lead: string | null;
  accepted_by_lead: boolean;
  points_awarded: number | null;
  awarded_at: string | null;
}

export interface PointsPaymentRow {
  id: string;
  hunting_session_id: string;
  user_id: string;
  bug_id: string;
  points: number;
  breakdown: Record<string, any>;
  reason: string;
  created_at: string;
}

export interface SuggestedUserRow {
  id: string;
  bug_id: string;
  user_id: string;
  score: number;
  discovered_at: string;
}

export interface UserStatsRow {
  user_id: string;
  bugs_solved: number;
  bugs_identified: number;
  active_bugs: number;
  points_earned: number;
  last_updated: string;
}

export interface PointScaleRow {
  id: number;
  size: PointSize;
  value: number;
}

// View types
export interface OpenBugViewRow extends BugRow {
  title: string;
  description: string;
  work_item_type: string;
  ado_state: string;
  url: string;
  points_value: number;
  status_label: string;
  creator_name: string;
  assigned_name: string | null;
}

// DTOs for API requests
export interface CreateGroupRequest {
  group_id: string;
  name: string;
  user_ids: string[];
}

export interface UpdateBugRequest {
  points?: PointSize;
  start_date?: string;
  end_date?: string | null;
  status_code?: string;
  details?: string;
  assigned_to?: string | null;
}

export interface TagUsersRequest {
  user_ids: string[];
}

export interface TagGroupsRequest {
  group_ids: string[];
}

export interface StartHuntingRequest {
  bug_id: string;
  repro_text: string;
  pr_link?: string;
  assigned_module_lead?: string;
}

export interface AwardPointsRequest {
  mode: 'rootcause' | 'fix' | 'both';
}

// Response types
export interface SuggestedUsersResponse {
  users: Array<{
    id: string;
    display_name: string;
    email: string;
    score: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
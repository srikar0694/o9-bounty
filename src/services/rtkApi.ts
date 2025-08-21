import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';
import type {
  OpenBugViewRow,
  BugRow,
  UserRow,
  GroupRow,
  PointScaleRow,
  BugStatusRow,
  HuntingActionRow,
  HuntingSessionRow,
  UserStatsRow,
  CreateGroupRequest,
  UpdateBugRequest,
  TagUsersRequest,
  TagGroupsRequest,
  StartHuntingRequest,
  AwardPointsRequest,
  SuggestedUsersResponse,
  ApiResponse,
} from '../types/database';

// Base query for serverless endpoints
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Custom query builder for direct Supabase queries
const supabaseQuery = async (query: () => Promise<any>) => {
  try {
    const result = await query();
    if (result.error) {
      throw result.error;
    }
    return { data: result.data };
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', data: error } };
  }
};

export const rtkApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Bug',
    'Bugs', 
    'Group',
    'Groups',
    'User',
    'Users',
    'Suggested',
    'Hunting',
    'Stats',
    'PointScale',
    'Statuses',
    'Actions'
  ],
  endpoints: (builder) => ({
    // Bugs
    getOpenBugs: builder.query<OpenBugViewRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('view_open_bugs')
            .select('*')
            .order('created_at', { ascending: false })
        ),
      providesTags: ['Bugs'],
    }),

    getBugById: builder.query<BugRow, string>({
      queryFn: (id) =>
        supabaseQuery(async () =>
          supabase
            .from('bugs')
            .select('*')
            .eq('id', id)
            .single()
        ),
      providesTags: (result, error, id) => [{ type: 'Bug', id }],
    }),

    updateBug: builder.mutation<BugRow, { id: string; payload: UpdateBugRequest }>({
      queryFn: ({ id, payload }) =>
        supabaseQuery(async () =>
          supabase
            .from('bugs')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        ),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bug', id },
        'Bugs',
        'Stats',
      ],
    }),

    // Point Scale
    getPointScale: builder.query<PointScaleRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('point_scale')
            .select('*')
            .order('value', { ascending: true })
        ),
      providesTags: ['PointScale'],
    }),

    updatePointScale: builder.mutation<PointScaleRow, { id: number; value: number }>({
      queryFn: ({ id, value }) =>
        supabaseQuery(async () =>
          supabase
            .from('point_scale')
            .update({ value })
            .eq('id', id)
            .select()
            .single()
        ),
      invalidatesTags: ['PointScale'],
    }),

    // Bug Statuses
    getBugStatuses: builder.query<BugStatusRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('bug_statuses')
            .select('*')
            .order('label')
        ),
      providesTags: ['Statuses'],
    }),

    // Hunting Actions
    getHuntingActions: builder.query<HuntingActionRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('hunting_actions')
            .select('*')
            .order('label')
        ),
      providesTags: ['Actions'],
    }),

    // Users
    getUsers: builder.query<UserRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('users')
            .select('*')
            .order('display_name')
        ),
      providesTags: ['Users'],
    }),

    updateUser: builder.mutation<UserRow, { id: string; is_admin: boolean }>({
      queryFn: ({ id, is_admin }) =>
        supabaseQuery(async () =>
          supabase
            .from('users')
            .update({ is_admin })
            .eq('id', id)
            .select()
            .single()
        ),
      invalidatesTags: ['Users'],
    }),

    // Groups
    getGroups: builder.query<GroupRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('groups')
            .select('*')
            .order('name')
        ),
      providesTags: ['Groups'],
    }),

    createGroup: builder.mutation<GroupRow, CreateGroupRequest>({
      query: (payload) => ({
        url: '/groups',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Groups'],
    }),

    // User Stats
    getUserStats: builder.query<UserStatsRow, string>({
      queryFn: (userId) =>
        supabaseQuery(async () =>
          supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single()
        ),
      providesTags: (result, error, userId) => [{ type: 'Stats', id: userId }],
    }),

    // Hunting Sessions
    getHuntingSessions: builder.query<HuntingSessionRow[], void>({
      queryFn: () =>
        supabaseQuery(async () =>
          supabase
            .from('hunting_sessions')
            .select('*')
            .order('started_at', { ascending: false })
        ),
      providesTags: ['Hunting'],
    }),

    startHuntingSession: builder.mutation<HuntingSessionRow, StartHuntingRequest>({
      query: (payload) => ({
        url: '/hunting_sessions',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Hunting', 'Stats', 'Bugs'],
    }),

    awardPoints: builder.mutation<ApiResponse, { sessionId: string; payload: AwardPointsRequest }>({
      query: ({ sessionId, payload }) => ({
        url: `/hunting_sessions/${sessionId}/award`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Hunting', 'Stats', 'Bugs'],
    }),

    // Serverless endpoints
    getSuggestedUsers: builder.query<SuggestedUsersResponse, string>({
      query: (bugId) => ({
        url: `/bugs/${bugId}/suggested-users`,
        method: 'GET',
      }),
      providesTags: (result, error, bugId) => [{ type: 'Suggested', id: bugId }],
    }),

    tagUsersToBug: builder.mutation<ApiResponse, { bugId: string; payload: TagUsersRequest }>({
      query: ({ bugId, payload }) => ({
        url: `/bugs/${bugId}/tag-users`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { bugId }) => [
        { type: 'Bug', id: bugId },
        { type: 'Suggested', id: bugId },
      ],
    }),

    tagGroupsToBug: builder.mutation<ApiResponse, { bugId: string; payload: TagGroupsRequest }>({
      query: ({ bugId, payload }) => ({
        url: `/bugs/${bugId}/tag-groups`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { bugId }) => [{ type: 'Bug', id: bugId }],
    }),
  }),
});

export const {
  useGetOpenBugsQuery,
  useGetBugByIdQuery,
  useUpdateBugMutation,
  useGetPointScaleQuery,
  useUpdatePointScaleMutation,
  useGetBugStatusesQuery,
  useGetHuntingActionsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetUserStatsQuery,
  useGetHuntingSessionsQuery,
  useStartHuntingSessionMutation,
  useAwardPointsMutation,
  useGetSuggestedUsersQuery,
  useTagUsersToBugMutation,
  useTagGroupsToBugMutation,
} = rtkApi;
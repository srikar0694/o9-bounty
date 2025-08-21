# Bug Bounty Application

A production-ready React + TypeScript application for managing bug bounties that runs parallel to Azure DevOps (ADO). The app uses Supabase for authentication and data storage, with Redux Toolkit for state management.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: TailwindCSS + Headless UI
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Vercel/Netlify (frontend) + Supabase Edge Functions (serverless)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required for frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for serverless functions (managed by Supabase)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADO_PERSONAL_ACCESS_TOKEN=your_ado_pat
ADO_ORG_URL=your_ado_organization_url
```

## Database Schema

The application requires the following Supabase tables:

### Core Tables
- `users`: User profiles linked to Supabase auth
- `ado_work_items`: Synchronized Azure DevOps work items
- `bugs`: Bug bounty entries linked to ADO work items
- `bug_statuses`: Status lookup (open, in_progress, resolved, closed)
- `hunting_actions`: Action lookup for hunting sessions
- `point_scale`: Point values for different bug sizes (S, M, L, XL, etc.)

### Relationship Tables
- `groups` & `group_members`: Team management
- `tags`, `bug_tags`, `bug_tag_groups`, `bug_tag_users`: Flexible tagging system
- `hunting_sessions`: Tracking user work on bugs
- `points_payments`: Point award history
- `suggested_users`: ML-based user suggestions
- `user_stats`: Aggregated user statistics

### Views
- `view_open_bugs`: Enriched bug view with ADO data and calculated points

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd bug-bounty-app
   npm install
   ```

2. **Setup Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup below)
   - Copy your environment variables

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Deploy Serverless Functions**
   ```bash
   # Using Supabase CLI
   supabase functions deploy
   ```

## Database Setup

### 1. Create Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Create custom types
create type point_size as enum ('S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL');

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid references auth.users not null unique,
  display_name text not null,
  email text not null unique,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ADO work items
create table ado_work_items (
  id bigint primary key,
  title text not null,
  description text,
  work_item_type text,
  state text,
  url text,
  last_synced_at timestamptz default now()
);

-- Point scale configuration
create table point_scale (
  id serial primary key,
  size point_size not null unique,
  value numeric not null
);

-- Bug statuses lookup
create table bug_statuses (
  id serial primary key,
  code text not null unique,
  label text not null
);

-- Bugs main table
create table bugs (
  id uuid primary key default gen_random_uuid(),
  ado_id bigint references ado_work_items(id) not null,
  created_by uuid references users(id) not null,
  assigned_to uuid references users(id),
  points point_size not null,
  start_date date not null default current_date,
  end_date date,
  status_code text references bug_statuses(code) not null default 'open',
  details text,
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table users enable row level security;
alter table bugs enable row level security;
-- ... enable for all tables

-- Create RLS policies
create policy "Users can read all profiles" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid() = auth_uid);

create policy "Anyone can read open bugs" on bugs for select using (status_code = 'open' and not is_archived);
create policy "Admins can manage bugs" on bugs for all using (
  exists (select 1 from users where auth_uid = auth.uid() and is_admin = true)
);
```

### 2. Seed Data

```sql
-- Insert point scale values
insert into point_scale (size, value) values
  ('S', 100), ('M', 200), ('L', 500), ('XL', 1000),
  ('2XL', 2000), ('3XL', 3000), ('4XL', 4000), ('5XL', 5000);

-- Insert bug statuses
insert into bug_statuses (code, label) values
  ('open', 'Open'),
  ('in_progress', 'In Progress'),
  ('resolved', 'Resolved'),
  ('closed', 'Closed');

-- Insert hunting actions
insert into hunting_actions (code, label) values
  ('started', 'Started'),
  ('submitted_rootcause', 'Submitted Root Cause'),
  ('submitted_fix', 'Submitted Fix'),
  ('assigned_to_lead', 'Assigned to Lead'),
  ('accepted_by_lead', 'Accepted by Lead');
```

### 3. Create View

```sql
create or replace view view_open_bugs as
select 
  b.*,
  awi.title,
  awi.description,
  awi.work_item_type,
  awi.state as ado_state,
  awi.url,
  ps.value as points_value,
  bs.label as status_label,
  creator.display_name as creator_name,
  assignee.display_name as assigned_name
from bugs b
join ado_work_items awi on b.ado_id = awi.id
join point_scale ps on b.points = ps.size
join bug_statuses bs on b.status_code = bs.code
join users creator on b.created_by = creator.id
left join users assignee on b.assigned_to = assignee.id
where not b.is_archived;
```

## Features

### Core Features
- **Dashboard**: User stats and bug lists with filtering
- **Bug Management**: View, edit (admin), and assign bugs
- **Hunting Sessions**: Start working on bugs with progress tracking
- **Point System**: Configurable point awards for different contribution types
- **Group Management**: Create teams and tag groups to bugs
- **User Suggestions**: ML-based user recommendations for bugs
- **Admin Panel**: User management, point configuration, session approval

### UI Features
- Responsive design for mobile and desktop
- Dark/light mode support
- Real-time notifications
- Advanced filtering and search
- Accessible components with keyboard navigation

## API Endpoints

The application includes several serverless functions for complex operations:

- `GET /functions/v1/bugs/{id}/suggested-users` - Get suggested users for a bug
- `POST /functions/v1/bugs/{id}/tag-users` - Tag users to a bug
- `POST /functions/v1/bugs/{id}/tag-groups` - Tag groups to a bug
- `POST /functions/v1/hunting_sessions` - Start a hunting session
- `POST /functions/v1/hunting_sessions/{id}/award` - Award points for completed work
- `POST /functions/v1/groups` - Create a new group

## Development

### File Structure

```
src/
├── app/               # Redux store configuration
├── features/          # Redux slices
├── services/          # RTK Query API
├── components/        # React components
├── pages/             # Page components
├── routes/            # Route guards and routing
├── lib/               # Utilities and Supabase client
└── types/             # TypeScript type definitions

supabase/
└── functions/         # Edge functions for serverless API
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push to main

### Serverless Functions (Supabase)
```bash
supabase functions deploy
```

### Database Migrations
Use Supabase CLI to manage database schema changes:
```bash
supabase db diff -f new_migration
supabase db push
```

## Azure DevOps Integration

The application is designed to sync with Azure DevOps work items. To set up ADO integration:

1. Create a Personal Access Token in ADO with work item read permissions
2. Set `ADO_PERSONAL_ACCESS_TOKEN` and `ADO_ORG_URL` environment variables
3. Implement ADO sync webhook (see `docs/ado-integration.md` for details)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details
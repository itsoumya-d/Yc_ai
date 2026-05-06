/**
 * DB Performance upgrade script: P5-03
 * 1. Creates supabase/migrations/002_performance_indexes.sql for all 20 apps
 * 2. Creates lib/db/pagination.ts cursor-based pagination utility for all 10 web apps
 * 3. Creates lib/pagination.ts cursor-based pagination utility for all 10 mobile apps
 */
const fs = require('fs');

// ── Cursor Pagination Utility ────────────────────────────────────────────────

const webPaginationUtil = `import { SupabaseClient } from '@supabase/supabase-js';

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPageOptions {
  cursor?: string; // ISO timestamp of last item's created_at
  limit?: number;
}

/**
 * Cursor-based pagination using created_at as cursor.
 * Avoids OFFSET pagination which degrades at scale (full table scan).
 *
 * Usage:
 *   const page = await cursorPage(supabase, 'invoices', { userId }, { cursor, limit: 25 });
 */
export async function cursorPage<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, unknown>,
  { cursor, limit = 25 }: CursorPageOptions = {}
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1); // fetch one extra to detect hasMore

  // Apply equality filters (user_id, org_id, status, etc.)
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  // Cursor: return items older than the cursor timestamp
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as T[];
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  // Next cursor = created_at of the last item in the page
  const lastItem = page[page.length - 1] as Record<string, unknown> | undefined;
  const nextCursor = hasMore && lastItem
    ? (lastItem.created_at as string)
    : null;

  return { data: page, nextCursor, hasMore };
}

/**
 * Cursor-based pagination with custom column ordering.
 * For tables sorted by non-created_at columns (e.g., score DESC, due_date ASC).
 */
export async function cursorPageByColumn<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, unknown>,
  orderColumn: string,
  orderAscending: boolean,
  { cursor, limit = 25 }: CursorPageOptions = {}
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: orderAscending })
    .order('id', { ascending: true }) // stable secondary sort
    .limit(limit + 1);

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  if (cursor) {
    if (orderAscending) {
      query = query.gt(orderColumn, cursor);
    } else {
      query = query.lt(orderColumn, cursor);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as T[];
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  const lastItem = page[page.length - 1] as Record<string, unknown> | undefined;
  const nextCursor = hasMore && lastItem
    ? String(lastItem[orderColumn])
    : null;

  return { data: page, nextCursor, hasMore };
}
`;

const mobilePaginationUtil = `import { supabase } from './api';

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Cursor-based pagination for React Native / Supabase.
 * Uses created_at DESC as cursor — avoids OFFSET which scans full table.
 */
export async function fetchPage<T = Record<string, unknown>>(
  table: string,
  filters: Record<string, unknown>,
  cursor?: string,
  limit = 25
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value as string);
    }
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const items = (data ?? []) as T[];
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  const lastItem = page[page.length - 1] as Record<string, unknown> | undefined;
  const nextCursor = hasMore && lastItem
    ? (lastItem.created_at as string)
    : null;

  return { data: page, nextCursor, hasMore };
}
`;

// ── Per-App Index Migrations ──────────────────────────────────────────────────

const migrations = {
  // WEB APPS
  skillbridge: `-- SkillBridge: Performance Indexes
-- Migration: 002_performance_indexes
-- Added: composite indexes for common query patterns + cursor pagination support

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- skill_assessments: list by user ordered by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skill_assessments_user_created
  ON skill_assessments(user_id, created_at DESC);

-- career_paths: filter by user + status, ordered by score
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_career_paths_user_status_score
  ON career_paths(user_id, status, transferability_score DESC);

-- learning_plans: filter by user + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_plans_user_status_created
  ON learning_plans(user_id, status, created_at DESC);

-- courses: active courses by provider
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_active
  ON courses(created_at DESC) WHERE is_active = TRUE;

-- course_progress: track user progress efficiently
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_progress_user_created
  ON course_progress(user_id, created_at DESC);

-- jobs: active jobs ordered by date (public listing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_created
  ON jobs(created_at DESC) WHERE status = 'active';

-- job_matches: user's matches sorted by score
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_matches_user_score
  ON job_matches(user_id, match_score DESC);

-- mentor_sessions: user sessions by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentor_sessions_user_status_date
  ON mentor_sessions(user_id, status, scheduled_at DESC);

-- resumes: user resumes by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resumes_user_created
  ON resumes(user_id, created_at DESC);

-- audit_log: filter by user + date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_created
  ON audit_log(user_id, created_at DESC);
`,

  storythread: `-- StoryThread: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- stories: author's stories by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_user_status_created
  ON stories(user_id, status, created_at DESC);

-- stories: public published stories (discovery feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_published_created
  ON stories(created_at DESC) WHERE status = 'published';

-- chapters: story's chapters in order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chapters_story_number
  ON chapters(story_id, chapter_number ASC);

-- comments: story comments by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_story_created
  ON comments(story_id, created_at DESC);

-- reading_progress: user progress per story
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_story
  ON reading_progress(user_id, story_id);

-- reactions: story reactions count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_story
  ON reactions(story_id);

-- notifications: unread notifications per user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- followers: user's followers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_user
  ON followers(following_id, created_at DESC);

-- ai_generations: user AI usage by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generations_user_created
  ON ai_generations(user_id, created_at DESC);
`,

  neighbordao: `-- NeighborDAO: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- posts: neighborhood feed ordered by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_neighborhood_created
  ON posts(neighborhood_id, created_at DESC);

-- events: upcoming events in a neighborhood
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_neighborhood_status_start
  ON events(neighborhood_id, status, start_date ASC);

-- events: active future events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_active_upcoming
  ON events(start_date ASC) WHERE status = 'active';

-- votes: open votes in a neighborhood
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_neighborhood_status_created
  ON votes(neighborhood_id, status, created_at DESC);

-- vote_responses: user's responses
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vote_responses_user
  ON vote_responses(user_id, created_at DESC);

-- treasury_entries: neighborhood ledger by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_treasury_neighborhood_created
  ON treasury_entries(neighborhood_id, created_at DESC);

-- group_orders: neighborhood orders by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_orders_neighborhood_status
  ON group_orders(neighborhood_id, status, created_at DESC);

-- resources: neighborhood resources by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resources_neighborhood_created
  ON resources(neighborhood_id, created_at DESC);

-- resource_bookings: user bookings by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resource_bookings_user_created
  ON resource_bookings(user_id, status, created_at DESC);
`,

  invoiceai: `-- InvoiceAI: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- invoices: user invoices by status + date (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_status_created
  ON invoices(user_id, status, created_at DESC);

-- invoices: client's invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_client_created
  ON invoices(user_id, client_id, created_at DESC);

-- invoices: overdue detection
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_overdue
  ON invoices(due_date ASC) WHERE status = 'sent';

-- payments: user payments by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_created
  ON payments(user_id, created_at DESC);

-- payments: by invoice for reconciliation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice
  ON payments(invoice_id, created_at DESC);

-- expenses: user expenses by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_created
  ON expenses(user_id, created_at DESC);

-- transactions: bank connection transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, transaction_date DESC);

-- clients: user's clients (alphabetical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_name
  ON clients(user_id, company_name ASC);

-- invoice_activities: audit trail per invoice
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_activities_invoice_created
  ON invoice_activities(invoice_id, created_at DESC);
`,

  petos: `-- PetOS: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- pets: user's pets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pets_user_created
  ON pets(user_id, created_at DESC);

-- health_records: pet records by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_records_pet_created
  ON health_records(pet_id, created_at DESC);

-- medication_reminders: upcoming reminders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medication_reminders_pet_status_date
  ON medication_reminders(pet_id, status, next_dose_at ASC);

-- service_bookings: user bookings by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_user_status_created
  ON service_bookings(user_id, status, created_at DESC);

-- community_posts: public feed by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_posts_created
  ON community_posts(created_at DESC) WHERE is_published = TRUE;

-- weight_history: pet weight over time
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weight_history_pet_date
  ON weight_history(pet_id, recorded_at DESC);

-- symptom_checks: pet symptom history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_checks_pet_created
  ON symptom_checks(pet_id, created_at DESC);

-- reviews: provider reviews by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider_created
  ON reviews(service_provider_id, created_at DESC);
`,

  proposalpilot: `-- ProposalPilot: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- proposals: org proposals by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_org_status_created
  ON proposals(org_id, status, created_at DESC);

-- proposals: user's proposals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_user_status_created
  ON proposals(created_by, status, created_at DESC);

-- proposals: client's proposals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_client_created
  ON proposals(client_id, created_at DESC);

-- proposal_views: analytics per proposal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_views_proposal_viewed
  ON proposal_views(proposal_id, viewed_at DESC);

-- proposal_analytics: analytics by proposal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposal_analytics_proposal_created
  ON proposal_analytics(proposal_id, created_at DESC);

-- templates: org templates by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_org_created
  ON templates(org_id, created_at DESC);

-- clients: org clients alphabetically
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_org_name
  ON clients(org_id, company_name ASC);
`,

  complibot: `-- CompliBot: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- controls: org controls by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_controls_org_status_created
  ON controls(org_id, status, created_at DESC);

-- controls: framework controls
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_controls_framework
  ON controls(framework_id, created_at DESC);

-- tasks: org tasks by status + due date (compliance deadline view)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_org_status_due
  ON tasks(org_id, status, due_date ASC);

-- tasks: assigned tasks per user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_assignments_user_status
  ON task_assignments(user_id, created_at DESC);

-- evidence_items: evidence per org + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_org_created
  ON evidence_items(org_id, created_at DESC);

-- gaps: open gaps per org (risk dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gaps_org_status_created
  ON gaps(org_id, status, created_at DESC);

-- policies: org policies by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_policies_org_status_created
  ON policies(org_id, status, created_at DESC);

-- integration_scans: recent scans per integration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_scans_integration_created
  ON integration_scans(integration_id, created_at DESC);
`,

  dealroom: `-- DealRoom: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- deals: org deals by stage + date (pipeline view)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_org_stage_created
  ON deals(org_id, stage_id, created_at DESC);

-- deals: owner's deals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_owner_status_created
  ON deals(owner_id, status, created_at DESC);

-- activities: deal activities by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_deal_created
  ON activities(deal_id, created_at DESC);

-- activities: user's activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_created
  ON activities(user_id, created_at DESC);

-- contacts: org contacts alphabetically
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_org_created
  ON contacts(org_id, created_at DESC);

-- emails: deal emails by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_deal_sent
  ON emails(deal_id, sent_at DESC);

-- calls: deal calls by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_deal_created
  ON calls(deal_id, created_at DESC);

-- forecasts: org forecasts by period
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forecasts_org_period
  ON forecasts(org_id, period_start DESC);
`,

  boardbrief: `-- BoardBrief: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- meetings: org meetings by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meetings_org_status_date
  ON meetings(org_id, status, date DESC);

-- board_decks: meeting decks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_board_decks_meeting
  ON board_decks(meeting_id, created_at DESC);

-- action_items: org action items by status + due date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_items_org_status_due
  ON action_items(org_id, status, due_date ASC);

-- action_items: assignee's action items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_items_assignee_status
  ON action_items(assigned_to, status, due_date ASC);

-- investor_updates: org updates by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_investor_updates_org_created
  ON investor_updates(org_id, created_at DESC);

-- minutes: meeting minutes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_minutes_meeting
  ON minutes(meeting_id, created_at DESC);

-- resolutions: org resolutions by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resolutions_org_status_created
  ON resolutions(org_id, status, created_at DESC);
`,

  claimforge: `-- ClaimForge: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- cases: org cases by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_org_status_created
  ON cases(organization_id, status, created_at DESC);

-- documents: case documents by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_case_created
  ON documents(case_id, created_at DESC);

-- entities: case entities by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entities_case_type
  ON entities(case_id, entity_type, created_at DESC);

-- entity_relationships: fraud network traversal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_case
  ON entity_relationships(case_id, created_at DESC);

-- entity_relationships: source/target lookup for graph traversal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_source
  ON entity_relationships(source_entity_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_relationships_target
  ON entity_relationships(target_entity_id, created_at DESC);

-- timeline_events: case timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_events_case_created
  ON timeline_events(case_id, created_at DESC);

-- generated_reports: case reports by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_reports_case_created
  ON generated_reports(case_id, created_at DESC);

-- audit_log: case audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_case_created
  ON audit_log(case_id, created_at DESC);
`,

  // MOBILE APPS
  mortal: `-- Mortal: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- wishes: user's wishes by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishes_user_created
  ON wishes(user_id, created_at DESC);

-- digital_assets: user's assets by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_digital_assets_user_created
  ON digital_assets(user_id, created_at DESC);

-- documents: user's documents by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_created
  ON documents(user_id, created_at DESC);

-- check_ins: user check-in history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_check_ins_user_created
  ON check_ins(user_id, created_at DESC);

-- access_grants: grants by user + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_access_grants_user_status
  ON access_grants(user_id, status, created_at DESC);

-- trusted_contacts: contacts by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trusted_contacts_user
  ON trusted_contacts(user_id, created_at DESC);

-- audit_log: user audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_created
  ON audit_log(user_id, created_at DESC);
`,

  stockpulse: `-- StockPulse: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- inventory: org + location inventory
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_org_created
  ON inventory(org_id, created_at DESC);

-- inventory: product lookup (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_product
  ON inventory(product_id, quantity ASC);

-- scans: location scan sessions by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_location_created
  ON scans(location_id, created_at DESC);

-- stock_alerts: open alerts by org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_alerts_org_status
  ON stock_alerts(org_id, status, created_at DESC) WHERE status = 'open';

-- expiration_alerts: upcoming expirations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expiration_alerts_org_status_date
  ON expiration_alerts(org_id, status, expires_at ASC) WHERE status = 'open';

-- inventory_history: product history by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_history_product_created
  ON inventory_history(product_id, created_at DESC);

-- purchase_orders: org POs by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_orders_org_status
  ON purchase_orders(org_id, status, created_at DESC);
`,

  routeai: `-- RouteAI: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- jobs: org jobs by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_org_status_created
  ON public.jobs(org_id, status, created_at DESC);

-- stops: route stops in order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stops_route_sequence
  ON public.stops(route_id, sequence_number ASC);

-- routes: driver's routes by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routes_driver_status_created
  ON public.routes(driver_id, status, created_at DESC);

-- routes: org routes by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routes_org_status_created
  ON public.routes(org_id, status, created_at DESC);

-- notifications: user unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- audit_logs: org audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_org_created
  ON public.audit_logs(org_id, created_at DESC);
`,

  'inspector-ai': `-- InspectorAI: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- inspections: org inspections by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inspections_org_status_created
  ON inspections(org_id, status, created_at DESC);

-- inspections: property inspections
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inspections_property_created
  ON inspections(property_id, created_at DESC);

-- photos: inspection photos by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_inspection_created
  ON photos(inspection_id, created_at DESC);

-- damage_assessments: inspection damages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_damage_assessments_inspection_created
  ON damage_assessments(inspection_id, severity DESC, created_at DESC);

-- reports: org reports by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_org_status_created
  ON reports(org_id, status, created_at DESC);

-- properties: org properties
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_org_created
  ON properties(org_id, created_at DESC);

-- sync_queue: pending sync items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_status_created
  ON sync_queue(status, created_at ASC) WHERE status = 'pending';
`,

  sitesync: `-- SiteSync: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- projects: org projects by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_org_status_created
  ON public.projects(org_id, status, created_at DESC);

-- daily_logs: project logs by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_logs_project_created
  ON public.daily_logs(project_id, created_at DESC);

-- issues: project issues by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_status_created
  ON public.issues(project_id, status, created_at DESC);

-- photos: project photos by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_project_created
  ON public.photos(project_id, created_at DESC);

-- rfi_items: project RFIs by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rfi_items_project_status_created
  ON public.rfi_items(project_id, status, created_at DESC);

-- audit_logs: org audit trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_org_created
  ON public.audit_logs(org_id, created_at DESC);
`,

  govpass: `-- GovPass: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- applications: user applications by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status_created
  ON public.applications(user_id, status, created_at DESC);

-- scanned_documents: user documents by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scanned_documents_user_created
  ON public.scanned_documents(user_id, created_at DESC);

-- eligibility_results: user eligibility results
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eligibility_results_user_created
  ON public.eligibility_results(user_id, created_at DESC);

-- saved_benefits: user saved benefits
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_benefits_user_created
  ON public.saved_benefits(user_id, created_at DESC);

-- benefit_programs: active programs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_benefit_programs_active
  ON public.benefit_programs(created_at DESC) WHERE is_active = TRUE;

-- user_activity_log: user activity trail
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_log_user_created
  ON public.user_activity_log(user_id, created_at DESC);
`,

  claimback: `-- ClaimBack: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- bills: user bills by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bills_user_status_created
  ON public.bills(user_id, status, created_at DESC);

-- disputes: user disputes by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_disputes_user_status_created
  ON public.disputes(user_id, status, created_at DESC);

-- detected_fees: user detected fees by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_detected_fees_user_status_created
  ON public.detected_fees(user_id, status, created_at DESC);

-- savings_events: user savings by date (total savings calc)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_savings_events_user_created
  ON public.savings_events(user_id, created_at DESC);

-- dispute_events: dispute history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dispute_events_dispute_created
  ON public.dispute_events(dispute_id, created_at DESC);

-- phone_calls: user calls by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_phone_calls_user_created
  ON public.phone_calls(user_id, created_at DESC);
`,

  'aura-check': `-- AuraCheck: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- skin_checks: user checks by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skin_checks_user_created
  ON public.skin_checks(user_id, created_at DESC);

-- change_comparisons: user comparisons by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_change_comparisons_user_created
  ON public.change_comparisons(user_id, created_at DESC);

-- tracked_areas: user tracked areas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracked_areas_user_status
  ON public.tracked_areas(user_id, status, created_at DESC);

-- finding_annotations: skin check annotations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finding_annotations_check_created
  ON public.finding_annotations(skin_check_id, created_at DESC);

-- dermatologist_referrals: user referrals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dermatologist_referrals_user_created
  ON public.dermatologist_referrals(user_id, created_at DESC);

-- health_snapshots: user health history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_snapshots_user_created
  ON public.health_snapshots(user_id, created_at DESC);
`,

  fieldlens: `-- FieldLens: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- coaching_sessions: user sessions by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coaching_sessions_user_status_created
  ON coaching_sessions(user_id, status, created_at DESC);

-- ai_analyses: session analyses by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_analyses_session_created
  ON ai_analyses(session_id, created_at DESC);

-- guide_progress: user guide progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guide_progress_user_created
  ON guide_progress(user_id, created_at DESC);

-- skill_milestones: user milestones by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_milestones_user_created
  ON user_milestones(user_id, created_at DESC);

-- notifications: user unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- subscriptions: user active subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_status
  ON subscriptions(user_id, status, created_at DESC);
`,

  'compliancesnap-expo': `-- ComplianceSnap: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- inspections: org inspections by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inspections_org_status_created
  ON inspections(org_id, status, created_at DESC);

-- violations: inspection violations by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_violations_inspection_status
  ON violations(inspection_id, status, created_at DESC);

-- corrective_actions: open actions by org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_corrective_actions_org_status
  ON corrective_actions(org_id, status, due_date ASC) WHERE status IN ('open', 'in_progress');

-- evidence: evidence by inspection date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_inspection_created
  ON evidence(inspection_id, created_at DESC);

-- risk_scores: facility risk over time
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_scores_facility_created
  ON risk_scores(facility_id, created_at DESC);

-- compliance_trends: org trends by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_trends_org_created
  ON compliance_trends(org_id, recorded_at DESC);
`,
};

// ── Web Apps ─────────────────────────────────────────────────────────────────
const webApps = [
  'skillbridge', 'storythread', 'neighbordao', 'invoiceai', 'petos',
  'proposalpilot', 'complibot', 'dealroom', 'boardbrief', 'claimforge',
];

// skillbridge uses src/app; others use app at root
const webLibPath = (app) =>
  app === 'skillbridge' ? `E:/Yc_ai/${app}/src/lib` : `E:/Yc_ai/${app}/lib`;

webApps.forEach(app => {
  const dir = `E:/Yc_ai/${app}`;
  if (!fs.existsSync(dir)) { console.log('SKIP web:', app); return; }

  // 1. Write migration
  const migDir = `${dir}/supabase/migrations`;
  if (!fs.existsSync(migDir)) { console.log('SKIP migration (no migrations dir):', app); }
  else {
    fs.writeFileSync(`${migDir}/002_performance_indexes.sql`, migrations[app] || `-- ${app}: Performance Indexes\nCREATE EXTENSION IF NOT EXISTS pg_stat_statements;\n`, 'utf8');
    console.log('Written migration:', app);
  }

  // 2. Write cursor pagination utility
  const libDir = webLibPath(app);
  const dbDir = `${libDir}/db`;
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  fs.writeFileSync(`${dbDir}/pagination.ts`, webPaginationUtil, 'utf8');
  console.log('Written pagination util:', app);
});

// ── Mobile Apps ───────────────────────────────────────────────────────────────
const mobileApps = [
  { dir: 'mortal', key: 'mortal' },
  { dir: 'stockpulse', key: 'stockpulse' },
  { dir: 'routeai', key: 'routeai' },
  { dir: 'inspector-ai', key: 'inspector-ai' },
  { dir: 'sitesync', key: 'sitesync' },
  { dir: 'govpass', key: 'govpass' },
  { dir: 'claimback', key: 'claimback' },
  { dir: 'aura-check', key: 'aura-check' },
  { dir: 'fieldlens', key: 'fieldlens' },
  { dir: 'compliancesnap-expo', key: 'compliancesnap-expo' },
];

mobileApps.forEach(({ dir, key }) => {
  const appDir = `E:/Yc_ai/${dir}`;
  if (!fs.existsSync(appDir)) { console.log('SKIP mobile:', dir); return; }

  // 1. Write migration
  const migDir = `${appDir}/supabase/migrations`;
  if (!fs.existsSync(migDir)) { console.log('SKIP migration (no migrations dir):', dir); }
  else {
    fs.writeFileSync(`${migDir}/002_performance_indexes.sql`, migrations[key] || `-- ${dir}: Performance Indexes\nCREATE EXTENSION IF NOT EXISTS pg_stat_statements;\n`, 'utf8');
    console.log('Written migration:', dir);
  }

  // 2. Write cursor pagination utility to lib/
  fs.writeFileSync(`${appDir}/lib/pagination.ts`, mobilePaginationUtil, 'utf8');
  console.log('Written pagination util:', dir);
});

console.log('Done!');

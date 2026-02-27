-- PetOS: Notification Preferences
-- Migration: 011_notification_preferences

-- Add notification preference columns to users table
alter table public.users
  add column if not exists notify_appointments boolean not null default true,
  add column if not exists notify_medications boolean not null default true,
  add column if not exists notify_health_alerts boolean not null default true;

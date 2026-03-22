-- Add notification_prefs column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{
    "appointment_reminders": true,
    "medication_reminders": true,
    "health_alerts": true,
    "vaccine_due": true,
    "weekly_summary": false
  }'::jsonb;

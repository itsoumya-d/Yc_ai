-- PetOS: Performance Indexes
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

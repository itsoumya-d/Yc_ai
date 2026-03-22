-- 015_performance_indexes.sql
-- Performance indexes for common query patterns

-- pets: primary filter for all pet-related queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pets_user_species_created
  ON public.pets (user_id, species, created_at DESC);

-- health_records: most recent records per pet (vet history feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_records_pet_date_type
  ON public.health_records (pet_id, date DESC, type);

-- medications: active medications per pet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medications_pet_active
  ON public.medications (pet_id, is_active);

-- appointments: upcoming appointments per pet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_pet_status_date
  ON public.appointments (pet_id, status, date);

-- expenses: monthly spend queries per user/pet
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_pet_date
  ON public.expenses (user_id, pet_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_date_category
  ON public.expenses (user_id, date DESC, category);

-- weight history: trend queries per pet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weight_history') THEN
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weight_history_pet_date
      ON public.weight_history (pet_id, recorded_at DESC)';
  END IF;
END $$;

-- notifications table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_date
      ON public.notifications (user_id, read, created_at DESC)';
  END IF;
END $$;

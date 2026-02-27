---
name: new-migration
description: Generate a Supabase PostgreSQL migration following the portfolio's established RLS patterns. Produces both the SQL migration file and the corresponding TypeScript interface for types/database.ts. Arguments: "table-name | col1 TYPE description, col2 TYPE description, ..." (e.g., "appointments | pet_id UUID REFERENCES pets(id), date TIMESTAMPTZ, type TEXT, notes TEXT")
---

Generate a Supabase migration file following the portfolio's canonical patterns.

## Step 1: Parse Arguments

From `$ARGUMENTS`:
- `table-name`: the PostgreSQL table name (snake_case)
- Column definitions: comma-separated list of `column_name TYPE [REFERENCES table(col)]`

## Step 2: Determine Migration Number

List all files in `supabase/migrations/`. The next migration number is the highest existing number + 1, zero-padded to 3 digits (e.g., if latest is `012_xxx.sql`, next is `013`).

## Step 3: Check for `set_updated_at()` Function

Scan existing migrations for `CREATE FUNCTION set_updated_at`. If it exists (likely in `001_init.sql`), use the trigger pattern. If not, include the function definition.

## Step 4: Generate the SQL Migration

Use this exact structure:

```sql
-- Migration: [NNN]_create_[table-name].sql
-- Purpose: [one-line description of what this table stores]

-- [Table Name]
CREATE TABLE [table-name] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  [USER-SPECIFIED COLUMNS — maintain the exact types and REFERENCES from arguments],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[table-name]_user_id ON [table-name](user_id);
CREATE INDEX idx_[table-name]_created_at ON [table-name](user_id, created_at DESC);
[Add domain-specific indexes if a column will be frequently filtered:
  e.g., status column → CREATE INDEX idx_[table-name]_status ON [table-name](user_id, status);
  e.g., foreign key → CREATE INDEX idx_[table-name]_[fk_col] ON [table-name]([fk_col]);]

-- RLS
ALTER TABLE [table-name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own [table-name]" ON [table-name]
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own [table-name]" ON [table-name]
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own [table-name]" ON [table-name]
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own [table-name]" ON [table-name]
  FOR DELETE USING (user_id = auth.uid());

-- updated_at trigger
CREATE TRIGGER set_[table-name]_updated_at
  BEFORE UPDATE ON [table-name]
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## PII Column Rules (MANDATORY)

If any column name contains: `ssn`, `tax_id`, `national_id`, `passport`, `dob`, `date_of_birth`, `medical_record`, `diagnosis`, `credit_card`, `bank_account`, `routing_number`:
- Change the type to `TEXT` (store as encrypted string via application layer) AND add a comment:
  ```sql
  [col_name] TEXT, -- ENCRYPTED: Use pgcrypto encrypt() before storing, decrypt() when reading
  ```
- Add a note in the output recommending Supabase Vault for this column

## Step 5: Generate TypeScript Interface

```typescript
// Add to types/database.ts

export interface [TableNamePascalCase] {
  id: string;
  user_id: string;
  [USER-SPECIFIED COLUMNS mapped to TypeScript types:
    UUID → string
    TEXT, VARCHAR → string
    INTEGER, BIGINT → number
    NUMERIC, DECIMAL → number
    BOOLEAN → boolean
    TIMESTAMPTZ, TIMESTAMP → string (ISO 8601)
    DATE → string (YYYY-MM-DD)
    JSONB, JSON → Record<string, unknown> or specific interface
    TEXT[] → string[]
  ]
  created_at: string;
  updated_at: string;
}

// If the table joins to other tables, also create a "WithDetails" type:
export interface [TableNamePascalCase]WithDetails extends [TableNamePascalCase] {
  [related_entity]: [RelatedType]; // from the REFERENCES columns
}
```

## Step 6: Output Both

1. **SQL file content** — paste this into `supabase/migrations/[NNN]_create_[table-name].sql`
2. **TypeScript interface** — add this to `types/database.ts`
3. **Reminder**: After creating this migration, invoke the `rls-reviewer` agent to verify security

## Common Patterns for This Portfolio

**Status column (if the entity has workflow states):**
```sql
status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'archived')),
CREATE INDEX idx_[table-name]_status ON [table-name](user_id, status);
```

**Soft delete (if records should be recoverable):**
```sql
deleted_at TIMESTAMPTZ,
-- Add to SELECT policy: AND deleted_at IS NULL
```

**File attachments:**
```sql
file_url TEXT,     -- Supabase Storage signed URL
file_size INTEGER, -- bytes
file_type TEXT,    -- MIME type
```

**Tags/Categories:**
```sql
tags TEXT[] DEFAULT '{}',
CREATE INDEX idx_[table-name]_tags ON [table-name] USING gin(tags);
```

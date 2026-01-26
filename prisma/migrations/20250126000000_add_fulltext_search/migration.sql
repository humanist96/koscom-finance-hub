-- Full-text Search Migration for PostgreSQL
-- This adds tsvector columns and GIN indexes for efficient Korean text search

-- Add search_vector column to news table
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Create GIN index on news search_vector
CREATE INDEX IF NOT EXISTS "news_search_vector_idx" ON "news" USING GIN ("search_vector");

-- Create function to update news search_vector
CREATE OR REPLACE FUNCTION news_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for news search_vector update
DROP TRIGGER IF EXISTS news_search_vector_trigger ON "news";
CREATE TRIGGER news_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content, summary ON "news"
  FOR EACH ROW
  EXECUTE FUNCTION news_search_vector_update();

-- Update existing news records
UPDATE "news" SET
  search_vector =
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C');

-- Add search_vector column to personnel_changes table
ALTER TABLE "personnel_changes" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Create GIN index on personnel_changes search_vector
CREATE INDEX IF NOT EXISTS "personnel_changes_search_vector_idx" ON "personnel_changes" USING GIN ("search_vector");

-- Create function to update personnel_changes search_vector
CREATE OR REPLACE FUNCTION personnel_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW."personName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.position, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.department, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for personnel_changes search_vector update
DROP TRIGGER IF EXISTS personnel_search_vector_trigger ON "personnel_changes";
CREATE TRIGGER personnel_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "personName", position, department ON "personnel_changes"
  FOR EACH ROW
  EXECUTE FUNCTION personnel_search_vector_update();

-- Update existing personnel_changes records
UPDATE "personnel_changes" SET
  search_vector =
    setweight(to_tsvector('simple', coalesce("personName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(position, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(department, '')), 'C');

-- Add search_vector column to securities_companies table
ALTER TABLE "securities_companies" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Create GIN index on securities_companies search_vector
CREATE INDEX IF NOT EXISTS "companies_search_vector_idx" ON "securities_companies" USING GIN ("search_vector");

-- Create function to update securities_companies search_vector
CREATE OR REPLACE FUNCTION company_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.code, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for securities_companies search_vector update
DROP TRIGGER IF EXISTS company_search_vector_trigger ON "securities_companies";
CREATE TRIGGER company_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, code ON "securities_companies"
  FOR EACH ROW
  EXECUTE FUNCTION company_search_vector_update();

-- Update existing securities_companies records
UPDATE "securities_companies" SET
  search_vector =
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(code, '')), 'B');

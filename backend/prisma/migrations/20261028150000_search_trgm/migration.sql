-- Recherche tolérante aux fautes (trigrammes) pour le forum, les contacts
-- et les messages. pg_trgm et unaccent sont des extensions « trusted » :
-- le propriétaire de la base peut les créer.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX IF NOT EXISTS "Post_title_trgm_idx" ON "Post" USING GIN (lower("title") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Post_description_trgm_idx" ON "Post" USING GIN (lower("description") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Message_text_trgm_idx" ON "Message" USING GIN (lower("text") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_username_trgm_idx" ON "User" USING GIN (lower("username") gin_trgm_ops);

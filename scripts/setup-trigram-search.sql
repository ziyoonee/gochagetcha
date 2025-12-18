-- 하이브리드 검색 설정 (Trigram + Levenshtein + 줄임말)
-- Supabase SQL Editor에서 실행

-- 1. 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- 2. Trigram 인덱스 생성
CREATE INDEX IF NOT EXISTS gachas_name_trgm_idx
  ON gachas USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gachas_name_ko_trgm_idx
  ON gachas USING gin (name_ko gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gachas_brand_trgm_idx
  ON gachas USING gin (brand gin_trgm_ops);

-- 3. 유사도 검색 함수 (Trigram + Levenshtein + 줄임말)
DROP FUNCTION IF EXISTS search_gachas_trigram(text, float, int);
DROP FUNCTION IF EXISTS search_gachas_trigram(text, double precision, integer);

CREATE OR REPLACE FUNCTION search_gachas_trigram(
  search_query text,
  similarity_threshold float DEFAULT 0.15,
  max_results int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  name_ko text,
  brand text,
  price int,
  image_url text,
  release_date date,
  category text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity_score float
)
LANGUAGE sql
AS $$
  SELECT
    g.id,
    g.name::text,
    g.name_ko::text,
    g.brand::text,
    g.price,
    g.image_url::text,
    g.release_date,
    g.category::text,
    g.created_at,
    g.updated_at,
    GREATEST(
      COALESCE(similarity(g.name::text, search_query), 0),
      COALESCE(similarity(g.name_ko::text, search_query), 0),
      COALESCE(similarity(g.brand::text, search_query), 0),
      -- Levenshtein (3글자 이상, 1글자 오타)
      CASE WHEN length(search_query) >= 3
           AND levenshtein(left(g.name_ko::text, length(search_query)), search_query) <= 1
           THEN 0.6 ELSE 0 END,
      CASE WHEN length(search_query) >= 3
           AND levenshtein(left(g.brand::text, length(search_query)), search_query) <= 1
           THEN 0.6 ELSE 0 END,
      -- 줄임말 매칭 (각 글자가 순서대로 포함)
      CASE WHEN length(search_query) >= 2
           AND g.name_ko::text ~* ('^.*' || array_to_string(regexp_split_to_array(search_query, ''), '.*') || '.*$')
           THEN 0.4 ELSE 0 END
    )::float AS similarity_score
  FROM gachas g
  WHERE
    similarity(g.name::text, search_query) > similarity_threshold
    OR similarity(g.name_ko::text, search_query) > similarity_threshold
    OR similarity(g.brand::text, search_query) > similarity_threshold
    OR (length(search_query) >= 3 AND levenshtein(left(g.name_ko::text, length(search_query)), search_query) <= 1)
    OR (length(search_query) >= 3 AND levenshtein(left(g.brand::text, length(search_query)), search_query) <= 1)
    -- 줄임말 매칭
    OR (length(search_query) >= 2 AND g.name_ko::text ~* ('^.*' || array_to_string(regexp_split_to_array(search_query, ''), '.*') || '.*$'))
  ORDER BY similarity_score DESC
  LIMIT max_results;
$$;

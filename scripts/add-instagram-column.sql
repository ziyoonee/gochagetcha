-- gachashops 테이블에 instagram_url 컬럼 추가
ALTER TABLE gachashops ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 인덱스 추가 (인스타 URL로 검색할 때 유용)
CREATE INDEX IF NOT EXISTS idx_gachashops_instagram ON gachashops(instagram_url) WHERE instagram_url IS NOT NULL;

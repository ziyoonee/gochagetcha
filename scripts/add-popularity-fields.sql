-- 가차샵 인기도 필드 추가
-- Supabase SQL Editor에서 실행

-- 리뷰 수 필드 추가
ALTER TABLE gachashops ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 평점 필드 추가 (1.0 ~ 5.0)
ALTER TABLE gachashops ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL;

-- 네이버 플레이스 ID 저장 (나중에 업데이트용)
ALTER TABLE gachashops ADD COLUMN IF NOT EXISTS naver_place_id VARCHAR(50) DEFAULT NULL;

-- 가차 상품 시드 데이터
-- Supabase SQL Editor에서 실행

-- 1. unique 제약 추가
ALTER TABLE gachas ADD CONSTRAINT gachas_name_unique UNIQUE (name);

-- 2. 가차 상품 데이터 삽입
INSERT INTO gachas (name, brand, price, image_url, release_date, category) VALUES
('포켓몬스터 테라리움 컬렉션 13', '리멘트', 700, 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400', '2024-12-01', '캐릭터'),
('산리오캐릭터즈 마스코트', '타카라토미', 500, 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', '2024-11-15', '캐릭터'),
('동물의 숲 미니어처 컬렉션', '반다이', 400, 'https://images.unsplash.com/photo-1594652634010-275456c808d0?w=400', '2024-11-20', '게임'),
('원피스 월드 콜렉터블', '반다이', 600, 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400', '2024-12-05', '애니메이션'),
('미니언즈 키링 컬렉션', '타카라토미', 400, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400', '2024-10-25', '캐릭터'),
('스누피 미니 피규어', '반다이', 500, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', '2024-11-01', '캐릭터'),
('건담 SD 시리즈', '반다이', 700, 'https://images.unsplash.com/photo-1569466126773-842a038edb86?w=400', '2024-12-10', '로봇'),
('고양이 피규어 컬렉션', '에포크', 400, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400', '2024-11-28', '동물'),
('치이카와 마스코트', '반다이', 500, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', '2024-12-08', '캐릭터'),
('스파이패밀리 피규어', '반다이', 600, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', '2024-11-10', '애니메이션'),
('주술회전 미니 피규어', '반다이', 600, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', '2024-10-30', '애니메이션'),
('디즈니 프린세스 컬렉션', '타카라토미', 500, 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400', '2024-11-05', '캐릭터'),
('짱구는 못말려 피규어', '반다이', 500, 'https://images.unsplash.com/photo-1594652634010-275456c808d0?w=400', '2024-10-20', '애니메이션'),
('귀멸의 칼날 치비 마스터즈', '반다이', 600, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', '2024-12-12', '애니메이션'),
('마리오 컬렉션', '닌텐도', 500, 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400', '2024-11-25', '게임'),
('젤다의 전설 미니어처', '닌텐도', 600, 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400', '2024-10-15', '게임'),
('토토로 마스코트', '반다이', 500, 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400', '2024-11-18', '애니메이션'),
('강아지 피규어 컬렉션', '에포크', 400, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', '2024-12-03', '동물'),
('BT21 캐릭터 마스코트', '라인프렌즈', 500, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', '2024-11-22', '캐릭터'),
('도라에몽 도구 컬렉션', '반다이', 500, 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400', '2024-10-28', '애니메이션'),
('스즈메의 문단속 피규어', '반다이', 700, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', '2024-09-15', '애니메이션'),
('에반게리온 미니 피규어', '반다이', 700, 'https://images.unsplash.com/photo-1569466126773-842a038edb86?w=400', '2024-08-20', '로봇'),
('헬로키티 악세서리', '산리오', 400, 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', '2024-12-01', '캐릭터'),
('드래곤볼 미니 피규어', '반다이', 600, 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400', '2024-11-12', '애니메이션'),
('나루토 치비 컬렉션', '반다이', 600, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', '2024-10-05', '애니메이션'),
('커비 마스코트', '닌텐도', 500, 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400', '2024-11-30', '게임'),
('짱아 피규어 컬렉션', '반다이', 500, 'https://images.unsplash.com/photo-1594652634010-275456c808d0?w=400', '2024-09-25', '애니메이션'),
('진격의 거인 미니 피규어', '반다이', 600, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', '2024-08-10', '애니메이션'),
('몰랑이 마스코트', '몰랑', 400, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', '2024-12-05', '캐릭터'),
('코난 미니 피규어', '반다이', 500, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', '2024-11-08', '애니메이션')
ON CONFLICT DO NOTHING;

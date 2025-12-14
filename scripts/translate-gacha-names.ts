/**
 * 가챠 이름을 일본어에서 한국어로 번역
 * OpenAI GPT-4o-mini 사용
 * 실행: npx tsx scripts/translate-gacha-names.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 배치로 번역 (비용 절감)
async function translateBatch(names: string[]): Promise<string[]> {
  const prompt = `다음 일본어 가챠(캡슐토이) 상품명들을 한국어로 번역해주세요.
번역 규칙:
1. 애니메이션/게임/캐릭터 이름은 한국에서 공식적으로 사용하는 이름으로 번역
   - クレヨンしんちゃん → 짱구는 못말려
   - 名探偵コナン → 명탐정 코난
   - ドラゴンボール → 드래곤볼
   - ワンピース → 원피스
   - ポケットモンスター → 포켓몬스터
   - 鬼滅の刃 → 귀멸의 칼날
   - 呪術廻戦 → 주술회전
   - 進撃の巨人 → 진격의 거인
   - ちいかわ → 치이카와
   - サンリオ → 산리오
   - ハローキティ → 헬로키티
   - シナモロール → 시나모롤
   - マイメロディ → 마이멜로디
   - ブルーアーカイブ → 블루 아카이브
   - 僕のヒーローアカデミア → 나의 히어로 아카데미아
   - NARUTO → 나루토
   - HUNTER×HUNTER → 헌터x헌터
   - ハイキュー → 하이큐
   - ガンダム → 건담
2. 상품 종류는 자연스럽게 번역
   - カプセルラバーマスコット → 캡슐 러버 마스코트
   - ミニチュアコレクション → 미니어처 컬렉션
   - フィギュア → 피규어
   - ライトブレス → 라이트 브레스
   - アクリルスタンド → 아크릴 스탠드
3. 고유명사(영어)는 그대로 유지: Disney, MINECRAFT 등
4. 번호(Vol.5, 2 등)는 그대로 유지

각 줄에 하나씩 번역 결과만 출력하세요. 설명 없이 번역만.

상품명 목록:
${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content || '';
    const lines = result.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    // 결과 개수가 맞지 않으면 개별 처리
    if (lines.length !== names.length) {
      console.log(`  ⚠️ 배치 결과 불일치 (${lines.length}/${names.length}), 원본 유지`);
      return names.map((name, i) => lines[i] || name);
    }

    return lines;
  } catch (error: any) {
    console.error('번역 오류:', error.message);
    return names; // 오류 시 원본 반환
  }
}

async function main() {
  console.log('=== 가챠 이름 한국어 번역 시작 ===\n');

  // 모든 가챠 가져오기 (페이지네이션으로 전체)
  let allGachas: { id: string; name: string; name_ko: string }[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error: fetchError } = await supabase
      .from('gachas')
      .select('id, name, name_ko')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (fetchError) {
      console.error('가챠 조회 실패:', fetchError);
      return;
    }

    if (!data || data.length === 0) break;

    allGachas = allGachas.concat(data);
    offset += pageSize;

    if (data.length < pageSize) break;
  }

  const gachas = allGachas;
  const error = null;

  if (error || !gachas) {
    console.error('가챠 조회 실패:', error);
    return;
  }

  console.log(`총 ${gachas.length}개 가챠 번역 예정\n`);

  // 10개씩 배치 처리
  const batchSize = 10;
  let updatedCount = 0;

  for (let i = 0; i < gachas.length; i += batchSize) {
    const batch = gachas.slice(i, i + batchSize);
    const names = batch.map(g => g.name);

    console.log(`[${i + 1}-${Math.min(i + batchSize, gachas.length)}/${gachas.length}] 번역 중...`);

    const translations = await translateBatch(names);

    // DB 업데이트
    for (let j = 0; j < batch.length; j++) {
      const gacha = batch[j];
      const newNameKo = translations[j];

      if (newNameKo && newNameKo !== gacha.name_ko) {
        const { error: updateError } = await supabase
          .from('gachas')
          .update({ name_ko: newNameKo })
          .eq('id', gacha.id);

        if (!updateError) {
          updatedCount++;
          console.log(`  ✓ ${gacha.name.substring(0, 30)}...`);
          console.log(`    → ${newNameKo}`);
        }
      }
    }

    // API 속도 제한
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n=== 번역 완료 ===');
  console.log(`업데이트된 가챠: ${updatedCount}개`);
}

main().catch(console.error);

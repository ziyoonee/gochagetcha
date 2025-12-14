/**
 * 네이버 플레이스에서 가차샵 SNS URL 수집
 * 실행: npx tsx scripts/collect-sns-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

interface SNSUrls {
  instagram_url: string | null;
  twitter_url: string | null;
  blog_url: string | null;
  naver_place_id: string | null;
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

// 네이버 플레이스 검색으로 장소 ID 찾기
async function searchNaverPlace(shopName: string, address: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(shopName);
    const url = `https://map.naver.com/p/api/search/allSearch?query=${query}&type=all&searchCoord=&boundary=`;

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data.result?.place?.list && data.result.place.list.length > 0) {
      // 주소가 비슷한 첫 번째 결과 반환
      for (const place of data.result.place.list) {
        if (place.address && (
          place.address.includes(address.split(' ')[0]) ||
          address.includes(place.address.split(' ')[0])
        )) {
          return place.id;
        }
      }
      // 주소 매칭 안되면 첫 번째 결과
      return data.result.place.list[0].id;
    }
    return null;
  } catch (error) {
    console.error(`검색 실패 (${shopName}):`, error);
    return null;
  }
}

// 네이버 플레이스 상세 페이지에서 SNS URL 추출
async function getPlaceSNSUrls(placeId: string): Promise<SNSUrls> {
  const result: SNSUrls = {
    instagram_url: null,
    twitter_url: null,
    blog_url: null,
    naver_place_id: placeId,
  };

  try {
    // 네이버 플레이스 API로 상세 정보 가져오기
    const url = `https://map.naver.com/p/api/place/info/${placeId}?lang=ko`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data) {
      // SNS 링크 추출
      const links = data.links || data.businessInfo?.links || [];

      for (const link of links) {
        const linkUrl = link.url || link;
        if (typeof linkUrl === 'string') {
          if (linkUrl.includes('instagram.com')) {
            result.instagram_url = linkUrl;
          } else if (linkUrl.includes('twitter.com') || linkUrl.includes('x.com')) {
            result.twitter_url = linkUrl;
          } else if (linkUrl.includes('blog.naver.com') || linkUrl.includes('blog.')) {
            result.blog_url = linkUrl;
          }
        }
      }

      // 홈페이지 정보에서도 확인
      const homepage = data.homepage || data.businessInfo?.homepages;
      if (homepage) {
        const homepages = Array.isArray(homepage) ? homepage : [homepage];
        for (const hp of homepages) {
          const hpUrl = hp.url || hp;
          if (typeof hpUrl === 'string') {
            if (hpUrl.includes('instagram.com') && !result.instagram_url) {
              result.instagram_url = hpUrl;
            } else if ((hpUrl.includes('twitter.com') || hpUrl.includes('x.com')) && !result.twitter_url) {
              result.twitter_url = hpUrl;
            } else if (hpUrl.includes('blog') && !result.blog_url) {
              result.blog_url = hpUrl;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`상세 정보 가져오기 실패 (${placeId}):`, error);
  }

  return result;
}

// 대안: 네이버 검색에서 SNS 링크 찾기
async function searchSNSFromNaver(shopName: string): Promise<SNSUrls> {
  const result: SNSUrls = {
    instagram_url: null,
    twitter_url: null,
    blog_url: null,
    naver_place_id: null,
  };

  try {
    // 인스타그램 검색
    const igQuery = encodeURIComponent(`${shopName} 인스타그램`);
    const igUrl = `https://search.naver.com/search.naver?query=${igQuery}`;
    const igResponse = await fetch(igUrl, { headers });
    const igHtml = await igResponse.text();

    const igMatch = igHtml.match(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+/);
    if (igMatch) {
      result.instagram_url = igMatch[0];
    }

    await new Promise(r => setTimeout(r, 200));

    // 트위터 검색
    const twQuery = encodeURIComponent(`${shopName} 트위터`);
    const twUrl = `https://search.naver.com/search.naver?query=${twQuery}`;
    const twResponse = await fetch(twUrl, { headers });
    const twHtml = await twResponse.text();

    const twMatch = twHtml.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/);
    if (twMatch) {
      result.twitter_url = twMatch[0];
    }
  } catch (error) {
    console.error(`네이버 검색 실패 (${shopName}):`, error);
  }

  return result;
}

async function main() {
  console.log('=== 가차샵 SNS URL 수집 시작 ===\n');

  // 1. 모든 가차샵 가져오기
  const { data: shops, error } = await supabase
    .from('gachashops')
    .select('id, name, address')
    .order('name');

  if (error || !shops) {
    console.error('가차샵 조회 실패:', error);
    return;
  }

  console.log(`총 ${shops.length}개 가차샵 처리 중...\n`);

  let updatedCount = 0;
  let foundInstagram = 0;
  let foundTwitter = 0;
  let foundBlog = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    console.log(`[${i + 1}/${shops.length}] ${shop.name} 처리 중...`);

    // 네이버 플레이스 검색
    const placeId = await searchNaverPlace(shop.name, shop.address);

    let snsUrls: SNSUrls = {
      instagram_url: null,
      twitter_url: null,
      blog_url: null,
      naver_place_id: placeId,
    };

    if (placeId) {
      // 플레이스 상세에서 SNS URL 가져오기
      snsUrls = await getPlaceSNSUrls(placeId);
      await new Promise(r => setTimeout(r, 300));
    }

    // 플레이스에서 못 찾으면 네이버 검색으로 시도
    if (!snsUrls.instagram_url && !snsUrls.twitter_url) {
      const searchResult = await searchSNSFromNaver(shop.name);
      snsUrls.instagram_url = snsUrls.instagram_url || searchResult.instagram_url;
      snsUrls.twitter_url = snsUrls.twitter_url || searchResult.twitter_url;
      await new Promise(r => setTimeout(r, 300));
    }

    // DB 업데이트
    if (snsUrls.instagram_url || snsUrls.twitter_url || snsUrls.blog_url || snsUrls.naver_place_id) {
      const { error: updateError } = await supabase
        .from('gachashops')
        .update({
          instagram_url: snsUrls.instagram_url,
          twitter_url: snsUrls.twitter_url,
          blog_url: snsUrls.blog_url,
          naver_place_id: snsUrls.naver_place_id,
        })
        .eq('id', shop.id);

      if (!updateError) {
        updatedCount++;
        if (snsUrls.instagram_url) {
          foundInstagram++;
          console.log(`  ✓ Instagram: ${snsUrls.instagram_url}`);
        }
        if (snsUrls.twitter_url) {
          foundTwitter++;
          console.log(`  ✓ Twitter: ${snsUrls.twitter_url}`);
        }
        if (snsUrls.blog_url) {
          foundBlog++;
          console.log(`  ✓ Blog: ${snsUrls.blog_url}`);
        }
        if (snsUrls.naver_place_id) {
          console.log(`  ✓ Place ID: ${snsUrls.naver_place_id}`);
        }
      }
    } else {
      console.log(`  - SNS 정보 없음`);
    }

    // API 속도 제한
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== 수집 완료 ===');
  console.log(`업데이트된 가차샵: ${updatedCount}개`);
  console.log(`Instagram 발견: ${foundInstagram}개`);
  console.log(`Twitter 발견: ${foundTwitter}개`);
  console.log(`Blog 발견: ${foundBlog}개`);
}

main().catch(console.error);

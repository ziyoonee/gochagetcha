import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsswbuxxvdirrzdkaouw.supabase.co',
  'sb_publishable_8Jgm3Pia07hPA77NbkinMg_Hwj8wx6q'
);

async function main() {
  const { data, error } = await supabase.from('gachashops').select('*').limit(3);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  if (data && data[0]) {
    console.log('컬럼:', Object.keys(data[0]).join(', '));
    console.log('\n샘플 데이터:');
    for (const shop of data) {
      console.log(`- ${shop.name}`);
      console.log(`  instagram_url: ${shop.instagram_url || '없음'}`);
    }
  }
}

main();

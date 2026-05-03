import { getSupabaseClient } from './src/db/supabaseClient.js';

async function main() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('attendances').select('*').limit(1);
  console.log('DATA:', data);
  console.log('ERROR:', error);
}

main();

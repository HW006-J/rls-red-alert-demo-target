import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://demoexampleproject.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZW1vIjoiZmFrZSJ9.EXAMPLE_NOT_A_REAL_SIGNATURE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function listClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, phone')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function listSessionNotes(clientId: string) {
  const { data, error } = await supabase
    .from('session_notes')
    .select('*')
    .eq('client_id', clientId);

  if (error) throw error;
  return data;
}

export async function getClientPhotos(clientId: string) {
  const { data, error } = await supabase.rpc('get_client_photos', {
    p_client_id: clientId,
  });

  if (error) throw error;
  return data;
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = await supabase.from('Testimoni').select('*').order('created_at', { ascending: false });
    return res.status(200).json(data || []);
  }
  
  if (req.method === 'POST') {
    const { id, rating, kritsar, nama, balasan, password } = req.body;
    
    // Jika Admin membalas review
    if (balasan && password === process.env.ADMIN_PASSWORD) {
      await supabase.from('Testimoni').update({ balasan_admin: balasan }).eq('id', id);
    } 
    // Jika User mengirim testimoni baru dari web
    else {
      const { error } = await supabase.from('Testimoni').insert([{ 
        nama_pembeli: nama, 
        rating: rating, 
        kritsar: kritsar 
      }]);
      // Jika database menolak, lemparkan error
      if (error) return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'DELETE') {
    const { id, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Salah' });
    await supabase.from('Testimoni').delete().eq('id', id);
    return res.status(200).json({ success: true });
  }
                                                 }

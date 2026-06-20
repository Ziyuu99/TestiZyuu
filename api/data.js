const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  // Setup database
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  try {
    // 1. Mengambil Data (GET)
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('Testimoni').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    
    // 2. Mengirim Data Baru atau Membalas Review (POST)
    if (req.method === 'POST') {
      const { id, rating, kritsar, nama, balasan, password } = req.body;
      
      if (balasan && password === process.env.ADMIN_PASSWORD) {
        const { error } = await supabase.from('Testimoni').update({ balasan_admin: balasan }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('Testimoni').insert([{ 
          nama_pembeli: nama, 
          rating: rating, 
          kritsar: kritsar 
        }]);
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    }
    
    // 3. Menghapus Data (DELETE)
    if (req.method === 'DELETE') {
      const { id, password } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Password Admin Salah' });
      }
      const { error } = await supabase.from('Testimoni').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    
    // Jika ada request lain, tolak dengan aman
    return res.status(405).json({ error: 'Metode tidak diizinkan' });

  } catch (error) {
    // Tangkap error agar Vercel tidak memunculkan pesan aneh "Unexpected token T"
    return res.status(500).json({ error: error.message });
  }
          }

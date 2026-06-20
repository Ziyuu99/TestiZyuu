if (req.method === 'POST') {
  const { id, rating, kritsar, nama, balasan, password } = req.body;
  
  // Jika admin ingin membalas
  if (balasan && password === process.env.ADMIN_PASSWORD) {
    await supabase.from('Testimoni').update({ balasan_admin: balasan }).eq('id', id);
  } else {
    // Jika user isi testimoni baru
    await supabase.from('Testimoni').update({ rating, kritsar, nama_pembeli: nama }).eq('id', id);
  }
  return res.status(200).json({ success: true });
}

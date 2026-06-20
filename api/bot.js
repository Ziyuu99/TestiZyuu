const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const msg = req.body.message;
    if (msg && msg.photo) {
      const chatId = msg.chat.id;
      try {
        const photoId = msg.photo[msg.photo.length - 1].file_id;
        const fileLink = await bot.getFileLink(photoId);
        const response = await fetch(fileLink);
        const buffer = await response.arrayBuffer();
        const fileName = `foto_${Date.now()}.jpg`;
        
        // Menggunakan bucket 'Testimoni_photos'
        const { error: uploadError } = await supabase.storage.from('Testimoni_photos').upload(fileName, Buffer.from(buffer), { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('Testimoni_photos').getPublicUrl(fileName);
        
        // Menggunakan tabel 'Testimoni'
        await supabase.from('Testimoni').insert([{ photo_url: data.publicUrl }]);
        
        bot.sendMessage(chatId, "Foto berhasil masuk ke website!");
      } catch (err) {
        bot.sendMessage(chatId, "Gagal: " + err.message);
      }
    }
    return res.status(200).send('OK');
  }
  return res.status(200).send('Bot aktif');
}

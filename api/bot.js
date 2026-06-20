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
        // Ambil ID foto kualitas tertinggi
        const photoId = msg.photo[msg.photo.length - 1].file_id;
        const fileLink = await bot.getFileLink(photoId);
        
        // Download foto
        const response = await fetch(fileLink);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `foto_${Date.now()}.jpg`;
        
        // Upload ke Supabase Storage
        const { error: uploadError } = await supabase.storage.from('testimoni_photos').upload(fileName, buffer, { contentType: 'image/jpeg' });
        
        if (uploadError) throw uploadError;

        // Ambil Link Publik dengan cara yang benar
        const { data } = supabase.storage.from('testimoni_photos').getPublicUrl(fileName);
        
        // Simpan ke Tabel Testimoni
        await supabase.from('Testimoni').insert([{ photo_url: data.publicUrl }]);
        
        bot.sendMessage(chatId, "Foto berhasil masuk ke website!");
      } catch (err) {
        bot.sendMessage(chatId, "Gagal: " + err.message);
      }
    }
    res.status(200).send('OK');
  } else {
    res.status(200).send('Bot aktif');
  }
    }

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "nsfw",
  aliases: ["hentai", "animepp"],
  version: "1.0.0",
  author: "AI",
  role: 0,
  description: "Envoie des images anime NSFW (hentai, waifu, neko, etc.)",
  category: "nsfw",
  countDown: 5,
  guide: {
    en: "{pn} [type]\nTypes disponibles: waifu, neko, trap, blowjob"
  }
};

module.exports.onStart = async function ({ message, event, args }) {
  // Liste des types supportés par l'API waifu.pics (NSFW)
  const allowedTypes = ["waifu", "neko", "trap", "blowjob"];
  const type = args[0] || "waifu";

  if (!allowedTypes.includes(type)) {
    return message.reply(`❌ Type invalide. Utilisez l'un des types suivants : ${allowedTypes.join(", ")}`);
  }

  await message.reaction("⏳", event.messageID);

  try {
    // Appel à l'API waifu.pics pour obtenir une URL d'image NSFW
    const res = await axios.get(`https://api.waifu.pics/nsfw/${type}`);
    const imageUrl = res.data.url;

    if (!imageUrl) {
      return message.reply("❌ Impossible de trouver une image pour le moment.");
    }

    // Chemin temporaire pour stocker l'image avant l'envoi
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const fileName = `nsfw_${Date.now()}.jpg`;
    const filePath = path.join(cacheDir, fileName);

    // Téléchargement de l'image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    await message.reaction("✅", event.messageID);

    // Envoi du message avec l'image en pièce jointe
    await message.reply({
      body: `🔞 Image Anime NSFW (${type})\nDemandée par : ${event.senderID}`,
      attachment: fs.createReadStream(filePath)
    });

    // Nettoyage du fichier temporaire après un court délai
    setTimeout(() => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 15000);

  } catch (e) {
    console.error(e);
    message.reaction("❌", event.messageID);
    message.reply("❌ Une erreur est survenue lors de la récupération de l'image. Vérifiez votre connexion ou l'état de l'API.");
  }
};
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const fs = require('fs');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    fs.writeFileSync('models-v2.json', JSON.stringify(data, null, 2));
    console.log("Written to models-v2.json");
  } catch(e) {
    console.error("Error details:", e);
  }
}
run();

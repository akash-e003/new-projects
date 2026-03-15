require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfjsLib = require('pdfjs-dist');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for PDF upload
const upload = multer({ storage: multer.memoryStorage() });

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile || !jobDescription) {
      return res.status(400).json({ error: 'Missing resume or job description' });
    }

    // Extract text from PDF using pdfjs-dist
    const dataArray = new Uint8Array(resumeFile.buffer);
    const loadingTask = pdfjsLib.getDocument({ data: dataArray });
    const pdf = await loadingTask.promise;
    
    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    // Gemini API Prompt
    const prompt = `Compare this resume with the job description. 
Return ONLY JSON in this format: {"score": number, "matched": [], "missing": [], "tips": []}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON from AI's response
    // Sometimes AI wraps JSON in markdown blocks
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const resultJson = JSON.parse(cleanJson);
      res.json(resultJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw AI Response:', responseText);
      res.status(500).json({ error: 'Failed to parse AI response. The AI might not have returned valid JSON.' });
    }

  } catch (error) {
    console.error('Detailed Analysis Error:', error);
    
    let errorMessage = 'Internal server error during analysis.';
    let details = error.message;

    if (error.response) {
      console.error('API Response Data:', error.response.data);
      errorMessage += ' API Key or Quota issue.';
    } else if (error.message && error.message.includes('pdf')) {
      errorMessage = 'Error parsing PDF file.';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: details,
      suggestion: 'Please verify your API key in the server/.env file and ensure you have enough quota.'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

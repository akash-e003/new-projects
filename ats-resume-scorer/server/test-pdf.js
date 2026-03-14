const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function testExtraction() {
  try {
    const data = fs.readFileSync('dummy_resume.pdf');
    const dataArray = new Uint8Array(data);
    const loadingTask = pdfjsLib.getDocument({ data: dataArray });
    const pdf = await loadingTask.promise;
    
    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        resumeText += pageText + "\n";
    }
    console.log("Extraction Success! Text length:", resumeText.length);
    console.log("Sample Text:", resumeText.substring(0, 100));
  } catch (e) {
    console.error("Extraction Failed:", e);
  }
}
testExtraction();

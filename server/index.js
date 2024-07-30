import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to testing" });
});

app.get("/summarize", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('style, script, noscript, .mw-editsection, .mw-parser-output > div').remove();

    const content = $('#mw-content-text').text();
    const cleanedContent = cleanText(content);

    const limitedSummary = cleanedContent.length > 4000 ? cleanedContent.substring(0, 4000) : cleanedContent;

    res.json({ cleanedContent: limitedSummary });
  } catch (error) {
    console.error("Error during summarization:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

function cleanText(text) {
  return text
    .replace(/(\[\d+\])/g, '') 
    .replace(/(Toggle the table of contents|Languages|Edit links|Article|Talk|Tools|General|From Wikipedia|the free encyclopedia)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Notion Client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ========================================
// Helper Functions
// ========================================

async function createPage(data) {
  const properties = {
    Name: {
      title: [{ text: { content: data.title } }],
    },
    Status: {
      status: { name: data.status || 'Inbox' },
    },
  };

  if (data.date) {
    properties.Date = { date: { start: data.date } };
  }

  if (data.area) {
    properties.Area = { select: { name: data.area } };
  }

  if (data.url) {
    properties.URL = { url: data.url };
  }

  if (data.aiProcessing) {
    properties['AI Processing'] = { select: { name: data.aiProcessing } };
  }

  if (data.categories && data.categories.length > 0) {
    properties.Category = {
      multi_select: data.categories.map((cat) => ({ name: cat })),
    };
  }

  if (data.summary) {
    properties['AI Summary'] = {
      rich_text: [{ text: { content: data.summary } }],
    };
  }

  if (data.mapsUrl) {
    properties['Google Maps'] = { url: data.mapsUrl };
  }

  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
  });

  return response.id;
}

async function updatePage(pageId, updates) {
  const properties = {};

  if (updates.aiProcessing) {
    properties['AI Processing'] = { select: { name: updates.aiProcessing } };
  }

  if (updates.title) {
    properties.Name = { title: [{ text: { content: updates.title } }] };
  }

  if (updates.area) {
    properties.Area = { select: { name: updates.area } };
  }

  if (updates.summary) {
    properties['AI Summary'] = {
      rich_text: [{ text: { content: updates.summary } }],
    };
  }

  if (updates.mapsUrl) {
    properties['Google Maps'] = { url: updates.mapsUrl };
  }

  if (updates.categories && updates.categories.length > 0) {
    properties.Category = {
      multi_select: updates.categories.map((cat) => ({ name: cat })),
    };
  }

  await notion.pages.update({
    page_id: pageId,
    properties,
  });
}

async function getPageById(pageId) {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
}

async function scrapeUrl(url) {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('google.com') && url.includes('/maps/')) {
      return await scrapeGoogleMaps(url);
    }

    return await scrapeGeneralWebsite(url);
  } catch (error) {
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

async function scrapeGoogleMaps(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      'Google Maps 地點';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const image = $('meta[property="og:image"]').attr('content');

    return {
      title: title.replace(' - Google 地圖', '').trim(),
      description,
      image,
      content: `${title}\n${description}`,
      url,
    };
  } catch (error) {
    const placeName = url.split('/').pop() || 'Google Maps 地點';
    return {
      title: placeName,
      description: 'Google Maps 地點',
      content: placeName,
      url,
    };
  }
}

async function scrapeGeneralWebsite(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '未命名網頁';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 20)
      .slice(0, 5)
      .join('\n');

    const content = paragraphs || description || title;

    return {
      title: title.trim(),
      description: description.trim(),
      image,
      content: content.substring(0, 1000),
      url,
    };
  } catch (error) {
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

async function analyzeContent(scrapedData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `你是一個專業的旅遊助手,負責分析旅遊相關資訊並提取關鍵資料。

請分析以下內容,並回傳 JSON 格式的結果:

## 輸入資料
URL: ${scrapedData.url}
標題: ${scrapedData.title}
描述: ${scrapedData.description}
內容預覽: ${scrapedData.content.substring(0, 500)}

## 輸出格式要求
請回傳純 JSON 格式,不要包含 markdown 標記。

JSON Schema:
{
  "title": "店名或景點名稱 (繁體中文，簡潔有力)",
  "area": "地區名稱 (例如: 澀谷, 新宿, 京都, 大阪)",
  "category": ["類型1", "類型2"],
  "summary": "實用摘要 (3-5句話)",
  "mapsUrl": "Google Maps 連結 (若有的話，若無則為 null)"
}

## 類型 (category) 選項
請從以下選項中選擇 1-2 個最符合的:
- "美食" (餐廳、咖啡廳、小吃)
- "景點" (觀光景點、寺廟、公園)
- "購物" (商場、商店街、藥妝店)
- "住宿" (飯店、旅館、民宿)
- "交通" (車站、機場、交通樞紐)

請開始分析並回傳 JSON:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/```\n?/g, '');
  }

  const parsed = JSON.parse(cleanText.trim());

  return {
    title: parsed.title || '未命名地點',
    area: parsed.area || '待定',
    category: Array.isArray(parsed.category)
      ? parsed.category
      : [parsed.category || '景點'],
    summary: parsed.summary || '',
    mapsUrl: parsed.mapsUrl || undefined,
  };
}

// ========================================
// API Routes
// ========================================

// POST /api/capture
app.post('/api/capture', async (req, res) => {
  try {
    const { url, title, date, area, status = 'Inbox' } = req.body;

    if (!url && !title) {
      return res.status(400).json({ error: 'Either URL or title is required' });
    }

    const needsAI = !!url;
    const finalTitle = title || url || '未命名項目';

    const pageId = await createPage({
      title: finalTitle,
      url: url || undefined,
      date: date || undefined,
      area: area || undefined,
      status: status,
      aiProcessing: needsAI ? 'Pending' : undefined,
    });

    res.json({
      success: true,
      pageId,
      message: needsAI ? '已加入待定清單，稍後將自動分析' : '已加入行程',
    });
  } catch (error) {
    console.error('Capture API error:', error);
    res.status(500).json({
      error: 'Failed to capture item',
      details: error.message,
    });
  }
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  let pageId = '';

  try {
    pageId = req.body.pageId;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    console.log(`[Analyze] Step 1: Checking status for page ${pageId}`);

    const page = await getPageById(pageId);
    const aiStatus = page.properties['AI Processing']?.select?.name;
    const url = page.properties.URL?.url;

    if (aiStatus === 'Processing' || aiStatus === 'Done') {
      console.log(`[Analyze] Skipped: Status is ${aiStatus}`);
      return res.json({
        status: 'skipped',
        message: `Task already ${aiStatus.toLowerCase()}`,
        aiStatus,
      });
    }

    if (!url) {
      console.log(`[Analyze] Error: No URL found`);
      await updatePage(pageId, { aiProcessing: 'Error' });
      return res.status(400).json({
        status: 'error',
        message: 'No URL found in page',
      });
    }

    console.log(`[Analyze] Step 2: Locking page ${pageId}`);
    await updatePage(pageId, { aiProcessing: 'Processing' });

    console.log(`[Analyze] Step 3: Executing analysis for ${url}`);
    const scrapedData = await scrapeUrl(url);

    console.log(`[Analyze] 3.2: Analyzing with Gemini...`);
    const analyzedData = await analyzeContent(scrapedData);

    console.log(`[Analyze] Step 4: Updating page with results`);
    await updatePage(pageId, {
      title: analyzedData.title,
      area: analyzedData.area,
      categories: analyzedData.category,
      summary: analyzedData.summary,
      mapsUrl: analyzedData.mapsUrl,
      aiProcessing: 'Done',
    });

    console.log(`[Analyze] ✅ Success for page ${pageId}`);

    res.json({
      status: 'success',
      message: 'Analysis completed',
      data: analyzedData,
    });
  } catch (error) {
    console.error(`[Analyze] ❌ Error for page ${pageId}:`, error);

    if (pageId) {
      try {
        await updatePage(pageId, { aiProcessing: 'Error' });
      } catch (updateError) {
        console.error('[Analyze] Failed to update error status:', updateError);
      }
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Analysis failed',
      error: error.toString(),
    });
  }
});

// GET /api/analyze
app.get('/api/analyze', async (req, res) => {
  try {
    const pageId = req.query.pageId;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const page = await getPageById(pageId);
    const aiStatus = page.properties['AI Processing']?.select?.name;

    res.json({
      pageId,
      aiStatus: aiStatus || 'Unknown',
      title: page.properties.Name.title[0]?.plain_text || '',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check status',
      details: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/capture`);
  console.log(`   POST http://localhost:${PORT}/api/analyze`);
  console.log(`   GET  http://localhost:${PORT}/api/analyze?pageId=xxx`);
});

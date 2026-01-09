# 🚀 Tabiflow 設定指南

## 問題說明

你的專案是 **Vite + React**,不是 Next.js,所以無法使用 Next.js 的 API 路由。

我已經為你建立了一個 **Express 後端伺服器** (`server.js`) 來處理所有 API 請求。

---

## 📋 啟動步驟

### 1. 確認 Notion 資料庫設定

請確保你的 Notion 資料庫有以下欄位:

| 欄位名稱 | 類型 | 選項 |
|---------|------|------|
| Name | Title | - |
| Date | Date | - |
| Status | Status | Inbox, To Review, Scheduled, Done |
| Area | Select | (自行新增地區選項) |
| Category | Multi-select | 美食, 景點, 購物, 住宿, 交通 |
| Google Maps | URL | - |
| AI Summary | Text | - |
| **URL** | **URL** | - (新增!) |
| **AI Processing** | **Select** | **Pending, Processing, Done, Error** (新增!) |

### 2. 啟動專案

**方式 1: 同時啟動前端和後端 (推薦)**
```bash
npm run dev:full
```

**方式 2: 分別啟動**
```bash
# Terminal 1: 啟動後端 (Port 3001)
npm run server

# Terminal 2: 啟動前端 (Port 3000)
npm run dev
```

### 3. 測試

1. 開啟瀏覽器: http://localhost:3000
2. 點擊「+」按鈕
3. 切換到「AI 連結」tab
4. 貼上一個 Google Maps URL,例如:
   ```
   https://maps.google.com/?q=澀谷+星巴克
   ```
5. 勾選「加入待定清單」
6. 點擊「分析並新增」
7. 應該立即顯示成功!

### 4. 查看結果

1. 前往你的 Notion 資料庫
2. 應該會看到新增的項目,狀態為 `Inbox`,AI Processing 為 `Pending`
3. 回到應用,前往 Inbox 頁面 (你需要整合這個組件)
4. 點擊「分析全部」或「立即分析」按鈕
5. 等待 10-20 秒,系統會自動分析並更新

---

## 🔍 API 端點

後端伺服器運行在 `http://localhost:3001`,提供以下 API:

| 端點 | 方法 | 說明 |
|-----|------|------|
| `/api/capture` | POST | 快速收集項目 |
| `/api/analyze` | POST | 分析單一項目 |
| `/api/analyze?pageId=xxx` | GET | 查詢分析狀態 |
| `/health` | GET | 健康檢查 |

---

## ⚠️ 常見問題

### Q: 為什麼需要兩個伺服器?

A: 因為你的專案是 Vite,不支援後端 API 路由。Express 伺服器提供後端功能,Vite 提供前端開發環境。

### Q: 部署時怎麼辦?

A: 有幾個選項:
1. **Vercel**: 將 `server.js` 改為 Serverless Functions
2. **Railway/Render**: 直接部署 Express 後端 + Vite 前端
3. **分離部署**: 後端部署到 Railway,前端部署到 Netlify/Vercel

### Q: 資料儲存在哪裡?

A: **所有資料都儲存在 Notion**,不需要額外的資料庫!
- Notion 就是你的資料庫
- 所有行程、分析結果、狀態都存在 Notion
- 不需要 MySQL/PostgreSQL

---

## 🎯 下一步

1. ✅ 啟動後端: `npm run server`
2. ✅ 啟動前端: `npm run dev`
3. ⬜ 整合 InboxView 組件到主頁面
4. ⬜ 測試完整流程
5. ⬜ 部署到生產環境

---

## 📝 關於資料庫的說明

**你不需要額外的資料庫!**

你的架構是:
```
前端 (Vite React) ←→ 後端 (Express) ←→ Notion (資料庫)
                                    ↓
                                 Gemini AI
```

- **Notion** = 你的資料庫
- **Express** = API 伺服器 (處理邏輯、呼叫 AI)
- **Vite** = 前端開發伺服器

所有資料都存在 Notion,包括:
- 行程資訊
- URL
- AI 分析結果
- 處理狀態

這樣的好處:
- ✅ 不需要管理額外的資料庫
- ✅ 可以在 Notion 直接編輯資料
- ✅ Notion 提供權限管理、備份、同步
- ✅ 開發成本低

---

需要幫助嗎?請查看 Console log 或聯繫開發者。

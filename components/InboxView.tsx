import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ItineraryItem } from "@/types/notion";

export const InboxView = ({
  items,
  onRefresh,
}: {
  items: ItineraryItem[];
  onRefresh: () => void;
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [autoPolling, setAutoPolling] = useState(true);

  // Auto-refresh every 10 seconds when there are pending/processing items
  useEffect(() => {
    if (!autoPolling) return;

    const hasPendingOrProcessing = items.some(
      (item) =>
        item.aiProcessing === "Pending" || item.aiProcessing === "Processing"
    );

    if (hasPendingOrProcessing) {
      const interval = setInterval(() => {
        console.log("[Inbox] Auto-refreshing...");
        onRefresh();
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [items, autoPolling, onRefresh]);

  const handleAnalyzeAll = async () => {
    const pendingItems = items.filter(
      (item) => item.aiProcessing === "Pending"
    );

    if (pendingItems.length === 0) {
      alert("沒有待分析的項目");
      return;
    }

    setAnalyzing(true);

    // Process in batches of 3
    const batchSize = 3;
    for (let i = 0; i < pendingItems.length; i += batchSize) {
      const batch = pendingItems.slice(i, i + batchSize);

      await Promise.all(
        batch.map((item) =>
          fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pageId: item.id }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(`[Inbox] Analyzed ${item.id}:`, data.status);
            })
            .catch((err) => {
              console.error(`[Inbox] Failed to analyze ${item.id}:`, err);
            })
        )
      );

      // Delay between batches to avoid rate limiting
      if (i + batchSize < pendingItems.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setAnalyzing(false);
    onRefresh();
  };

  const handleAnalyzeOne = async (itemId: string) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageId: itemId }),
      });

      const data = await response.json();
      console.log(`[Inbox] Analyzed ${itemId}:`, data.status);

      // Refresh after a short delay
      setTimeout(onRefresh, 1000);
    } catch (error) {
      console.error(`[Inbox] Failed to analyze:`, error);
      alert("分析失敗,請稍後再試");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-400">
            <Clock size={12} />
            待分析
          </div>
        );
      case "Processing":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded-full text-xs text-yellow-400">
            <Loader2 size={12} className="animate-spin" />
            分析中...
          </div>
        );
      case "Error":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-900/30 border border-red-700/50 rounded-full text-xs text-red-400">
            <AlertCircle size={12} />
            失敗
          </div>
        );
      case "Done":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-xs text-green-400">
            <CheckCircle2 size={12} />
            完成
          </div>
        );
      default:
        return null;
    }
  };

  const pendingCount = items.filter(
    (item) => item.aiProcessing === "Pending"
  ).length;
  const processingCount = items.filter(
    (item) => item.aiProcessing === "Processing"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">待定清單</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {items.length} 個項目 · {pendingCount} 待分析 · {processingCount}{" "}
            分析中
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          {pendingCount > 0 && (
            <button
              onClick={handleAnalyzeAll}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  批次分析中...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  分析全部 ({pendingCount})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>沒有待定項目</p>
            <p className="text-sm mt-2">使用 AI 連結模式新增項目到這裡</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(item.aiProcessing)}
                    {item.area && item.area !== "待定" && (
                      <span className="text-xs text-zinc-500">{item.area}</span>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1 truncate">
                    {item.title}
                  </h3>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 truncate block"
                    >
                      {item.url}
                    </a>
                  )}
                  {item.summary && (
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0">
                  {item.aiProcessing === "Pending" && (
                    <button
                      onClick={() => handleAnalyzeOne(item.id)}
                      className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-600/50 text-indigo-400 rounded text-xs font-medium hover:bg-indigo-600/30 transition-colors"
                    >
                      立即分析
                    </button>
                  )}
                  {item.aiProcessing === "Error" && (
                    <button
                      onClick={() => handleAnalyzeOne(item.id)}
                      className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 text-red-400 rounded text-xs font-medium hover:bg-red-600/30 transition-colors"
                    >
                      重試
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

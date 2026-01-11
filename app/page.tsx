"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import useSWR from 'swr';

// Types & Libs
import { ExtendedItineraryItem, ItineraryStatus } from "@/types/notion";
import { getStatusLabel, getTypeLabel } from "@/lib/utils";

// Components
import { ToastContainer, ToastContext, ToastType, Toast } from "@/components/Toast";
import { DetailSheet } from "@/components/DetailSheet";
import { QuickCapture } from "@/components/QuickCapture";
import { WelcomeModal, AboutModal, SettingsModal } from "@/components/Modals";

// Refactored Components
import { MainHeader } from "@/components/MainHeader";
import { TimelineView } from "@/components/TimelineView";
import { InboxView } from "@/components/InboxView";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function App() {
  // SWR for smart polling and caching
  const { data: serverItems, mutate } = useSWR<ExtendedItineraryItem[]>('/api/inbox', fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds
    revalidateOnFocus: true,
  });

  // Local state for optimistic UI updates (synced with SWR data)
  const [items, setItems] = useState<ExtendedItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync SWR data to local state
  useEffect(() => {
     if (serverItems) {
         setItems(serverItems);
         setIsLoading(false);
     }
  }, [serverItems]);

  const [editingItem, setEditingItem] = useState<ExtendedItineraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'inbox'>('timeline'); 

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info', undoAction?: () => void) => {
     const id = Math.random().toString(36).substr(2, 9);
     setToasts(prev => [...prev, { id, message, type, undoAction }]);
     setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
     setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to trigger revalidate
  const fetchItems = () => mutate();

  // Current time state
  const [now, setNow] = useState(new Date());

  // Update time every 30 seconds to keep UI fresh
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000); 
    return () => clearInterval(timer);
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const now = new Date();
      return now.toISOString().split('T')[0];
    } catch (e) {
      return "2024-01-01";
    }
  });

  // Auto-switch date if current one becomes empty, OR if new date added
  useEffect(() => {
      // Get all valid dates
      const scheduledDates = Array.from(new Set(items
        .filter(i => i.status !== 'Inbox' && i.date)
        .map(i => i.date)
      )).sort();

      if (scheduledDates.length === 0) return;

      if (!scheduledDates.includes(selectedDate)) {
          if (scheduledDates.length > 0) {
             setSelectedDate(scheduledDates[0]);
          }
      }
  }, [items, selectedDate]);

  const [selectedItem, setSelectedItem] = useState<ExtendedItineraryItem | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('tabiflow_welcome_seen');
    if (hasSeenWelcome !== 'true') {
      setTimeout(() => setIsWelcomeOpen(true), 500);
    }
  }, []);

  // Filter and Sort for Timeline
  const timelineItems = useMemo(() => {
     return items
        .filter(item => item.date === selectedDate && item.status !== 'Inbox')
        .sort((a, b) => a.time.localeCompare(b.time));
  }, [items, selectedDate]);
  
  const dailyCost = useMemo(() => {
     return timelineItems.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  }, [timelineItems]);

  const inboxItems = items.filter(item => item.status === 'Inbox');

  let heroItem = timelineItems[0];
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  if (selectedDate === todayStr && timelineItems.length > 0) {
      const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const startedItems = timelineItems.filter(item => item.time <= currentTimeStr);
      if (startedItems.length > 0) {
          heroItem = startedItems[startedItems.length - 1];
      }
  }

  const displayTimelineItems = timelineItems.filter(item => item.id !== heroItem?.id);

  const handleStatusChange = async (id: string, newStatus: ItineraryStatus) => {
      // Optimistic Update
      const oldItems = [...items];
      setItems(items.map(i => i.id === id ? { ...i, status: newStatus } : i));

      try {
        await fetch(`/api/inbox/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        addToast(`狀態已更新為：${getStatusLabel(newStatus)}`, 'success');
        fetchItems(); // Sync
      } catch (e) {
        setItems(oldItems); // Revert
        addToast("更新失敗", "error");
      }

      if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, status: newStatus });
      }
  };

  const handleEditClick = (item: ExtendedItineraryItem) => {
      setEditingItem(item);
      setSelectedItem(null); 
  };

  const handleDeleteItem = async (id: string) => {
      try {
          await fetch(`/api/inbox/${id}`, { method: 'DELETE' });
          setItems(items.filter(i => i.id !== id));
          setSelectedItem(null);
          addToast("已刪除行程", 'info');
      } catch (e) {
          addToast("刪除失敗", "error");
      }
  };

  const handleUpdateItem = async (data: any) => {
      setEditingItem(null);
      setIsQuickCaptureOpen(false);

      // AI Mode Handling
      if (data.type === 'ai_pending') {
         addToast("AI 分析請求已送出，正在建立頁面...", 'success');
         
         const payload = {
             url: data.url,
             title: "AI Analyzing...",
             status: data.status, // Inbox or Scheduled
             date: data.date,
             time: data.time || "TBD",
             aiProcessing: "Processing", // Mark as initial processing state
             summary: data.summary // Context
         };

         try {
             // 1. Create Page
             const res = await fetch('/api/inbox', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });
             
             if (!res.ok) throw new Error('Create page failed');
             const { id } = await res.json();
             
             // 2. Trigger Analysis immediately (don't wait for poll)
             fetch('/api/analyze', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ pageId: id })
             }).then(() => {
                 fetchItems(); // Refresh again after analysis returns
             });

             // 3. Initial Refresh to show the "Processing" card
             fetchItems();

         } catch (e) {
             console.error(e);
             addToast("AI 請求失敗", 'error');
         }
         return;
      }

      // FORCE SWITCH to the target date
      if (data.date) {
          setSelectedDate(data.date);
      }

      const type = data.selectedType || "activity";
      let finalTitle = data.title;
      let transportInfo = undefined;
      let accommodationInfo = undefined;

      if (type === 'transport') {
        const mode = data.transportMode || "交通工具";
        if (!data.id) {
             finalTitle = `前往 ${data.title}`; 
        } else {
             if (!data.title.startsWith("前往 ")) {
                finalTitle = `前往 ${data.title}`;
             } else {
                finalTitle = data.title;
             }
        }
        
        transportInfo = {
           mode: mode,
           from: data.area || "出發地",
           to: data.title,
           platform: data.transportPlatform || "-",
           car: data.transportCar || "-",
           seat: data.transportSeat || "自由座",
           duration: "-",
           terminal: data.transportTerminal,
           gate: data.transportGate,
           flightNumber: data.transportFlightNumber 
        };
      } else if (type === 'stay') {
         accommodationInfo = data.accommodation;
      }

      let summaryText = data.summary || data.memo || "";

      if (data.websiteUrl && !summaryText.includes(data.websiteUrl)) {
          summaryText += `\n🔗 網站: ${data.websiteUrl}`;
      }

      // Strip out auto-generated details
      summaryText = summaryText
        .replace(/\n\n🚆 .*?(\|.*?)*/g, "")
        .replace(/\n\n🏨 .*?(\|.*?)*/g, "")
        .trim();

      const payload = {
        title: finalTitle,
        time: data.time === "待定" ? "TBD" : data.time,
        area: type === 'transport' ? "交通" : (data.area || "待定"),
        status: data.status,
        mapsUrl: data.mapsUrl,
        date: data.date,
        summary: summaryText,
        cost: data.cost,
        categories: [getTypeLabel(type)],
        transport: transportInfo,
        accommodation: accommodationInfo 
      };

      try {
        if (data.id) {
           // [更新模式]
           const updatedItems = items.map(i => i.id === data.id ? { ...i, ...payload, type: type as any } : i);
           setItems(updatedItems);
           mutate(updatedItems, false);
           
           const res = await fetch(`/api/inbox/${data.id}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
           });

           if (!res.ok) {
               const errData = await res.json();
               console.error("[Update Failed] Server response:", errData);
               throw new Error(errData.error || "Update failed");
           }

           addToast("行程已更新", 'success');
        } else {
           // [新增模式]
           const tempId = "temp_" + Date.now();
           const newItem: ExtendedItineraryItem = { 
               id: tempId, 
               ...payload, 
               type: type as any, 
               coverImage: "",
               lastEdited: new Date().toISOString() 
            };
           const updatedItems = [...items, newItem];
           
           setItems(updatedItems);
           mutate(updatedItems, false);

           const res = await fetch('/api/inbox', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
           });
           
           if (!res.ok) {
               const errData = await res.json();
               console.error("[Create Failed] Server response:", errData);
               throw new Error(errData.error || "Create failed");
           }

           const json = await res.json(); 
           if (json.id) {
               const fixedItems = updatedItems.map(i => i.id === tempId ? { ...i, id: json.id } : i);
               setItems(fixedItems);
               mutate(fixedItems, false);
           }
           
           addToast("已新增行程", 'success');
        }
      } catch (e: any) {
        console.error("HandleUpdateItem Error:", e);
        addToast(`儲存失敗: ${e.message || "未知錯誤"}`, "error");
        fetchItems(); 
      }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
    <div className="min-h-screen pb-24 relative selection:bg-zinc-800">
      
      <MainHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        inboxCount={inboxItems.length}
        dailyCost={dailyCost}
        onSettingsClick={() => setIsSettingsOpen(true)}
        items={items}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Main Content Stream */}
      <main className="p-5 space-y-8 min-h-[60vh]">
        
        {viewMode === 'timeline' ? (
           <TimelineView 
              isLoading={isLoading}
              heroItem={heroItem}
              items={displayTimelineItems}
              onSelectItem={setSelectedItem}
           />
        ) : (
            <InboxView 
                items={inboxItems}
                onSelectItem={setSelectedItem}
            />
        )}

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6 z-30">
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="w-14 h-14 bg-zinc-50 text-black rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all"
        >
          <Plus size={28} strokeWidth={2} />
        </button>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <AnimatePresence>
        {isWelcomeOpen && <WelcomeModal onClose={() => setIsWelcomeOpen(false)} />}
        
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            onOpenAnnouncement={() => setIsWelcomeOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onContactSupport={() => addToast("就只有我一個還想找客服喔", 'error')}
          />
        )}

        {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}

        {selectedItem && (
          <DetailSheet 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
            onStatusChange={handleStatusChange}
            onEdit={handleEditClick}
            onDelete={handleDeleteItem}
          />
        )}
        
        {(isQuickCaptureOpen || editingItem) && (
          <QuickCapture 
            onClose={() => {
                setIsQuickCaptureOpen(false);
                setEditingItem(null);
            }}
            onSave={handleUpdateItem}
            defaultDate={selectedDate}
            initialData={editingItem}
          />
        )}
      </AnimatePresence>
    </div>
    </ToastContext.Provider>
  );
}
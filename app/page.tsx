"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CalendarDays, Archive, Wallet, Settings, Navigation, Plus, MapPin, 
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Types & Libs
import { ExtendedItineraryItem, ItineraryStatus, ItineraryType } from "@/types/notion";
import { INITIAL_DATA, DATES, MOCK_IMAGES, getImageForType } from "@/lib/data";
import { getStatusColor, getStatusLabel, getTypeLabel } from "@/lib/utils";

// Components
import { ToastContainer, ToastContext, ToastType, Toast } from "@/components/Toast";
import { DetailSheet } from "@/components/DetailSheet";
import { QuickCapture } from "@/components/QuickCapture";
import { WelcomeModal, AboutModal, SettingsModal } from "@/components/Modals";
import { ItineraryCard } from "@/components/ItineraryCard";

// Skeleton Component
const SkeletonItem = () => (
    <div className="relative flex items-center gap-4 animate-pulse opacity-60">
        <div className="w-12 flex flex-col items-end gap-1">
            <div className="h-3 w-8 bg-zinc-800 rounded" />
        </div>
        <div className="relative z-10 flex-shrink-0">
            <div className="w-14 h-14 bg-zinc-800 rounded-sm" />
        </div>
        <div className="flex-1 border-b border-zinc-800/50 pb-6 pt-1">
             <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
             <div className="flex gap-2">
                 <div className="h-3 w-10 bg-zinc-800 rounded" />
                 <div className="h-3 w-16 bg-zinc-800 rounded" />
             </div>
        </div>
    </div>
);

const staggerContainer: Variants = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function App() {
  const [items, setItems] = useState<ExtendedItineraryItem[]>([]);
  const [editingItem, setEditingItem] = useState<ExtendedItineraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'inbox'>('timeline'); 
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch Data
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inbox');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      // addToast("無法載入資料", 'error'); 
    }
  };

  // Initial Fetch & Polling
  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

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
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
      
      return today; // Always use today's date as default
    } catch (e) {
      console.error('Date initialization error:', e);
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
  });

  // Skeleton Loading Logic (Only on initial load or date switch if needed, but here generic)
  /* 
  useEffect(() => {
     setIsLoading(true);
     const timer = setTimeout(() => setIsLoading(false), 600);
     return () => clearTimeout(timer);
  }, [selectedDate, viewMode]);
  */ 
  // Disable fake skeleton logic, rely on real data loading state

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
          // No undo for API delete easily unless we implement restore or soft delete specific logic
      } catch (e) {
          addToast("刪除失敗", "error");
      }
  };

  const handleUpdateItem = async (data: any) => {
      setEditingItem(null);
      setIsQuickCaptureOpen(false);

      const type = data.selectedType || "activity";
      let finalTitle = data.title;
      let transportInfo = undefined;
      let accommodationInfo = undefined;

      if (type === 'transport') {
        const mode = data.transportMode || "交通工具";
        if (!data.id) {
             finalTitle = `前往 ${data.title}`; // Only add prefix for new items
        } else {
             finalTitle = data.title;
        }
        
        transportInfo = {
           mode: mode,
           from: data.area || "出發地",
           to: data.title,
           platform: "-",
           car: "-",
           seat: "自由座",
           duration: "-" 
        };
      } else if (type === 'stay') {
         accommodationInfo = data.accommodation;
      }

      let summaryText = data.memo || "";
      // Construct summary if empty
      if (!summaryText) {
         if (type === 'transport') summaryText = `預計搭乘 ${data.transportMode} 前往 ${data.title}`;
         else if (type === 'stay') summaryText = "住宿行程";
      }

      if (data.websiteUrl && !summaryText.includes(data.websiteUrl)) {
          summaryText += `\n🔗 網站: ${data.websiteUrl}`;
      }

      const payload = {
        title: finalTitle,
        time: data.time === "待定" ? "TBD" : data.time,
        area: type === 'transport' ? "交通" : (data.area || "待定"),
        status: data.status,
        mapsUrl: data.mapsUrl,
        date: data.date,
        summary: summaryText,
        cost: data.cost,
        categories: [getTypeLabel(type)], // Simple category mapping
        // Logic to pass transport/accommodation details? 
        // Notion schema doesn't have detailed transport struct, so we might lose it or stuff it in summary.
        // For now, let's keep it simple as per schema.
      };

      try {
        if (data.id) {
           await fetch(`/api/inbox/${data.id}`, {
               method: 'PATCH',
               body: JSON.stringify(payload)
           });
           addToast("行程已更新", 'success');
        } else {
           await fetch('/api/inbox', {
               method: 'POST',
               body: JSON.stringify(payload)
           });
           addToast("已新增行程", 'success');
        }
        fetchItems();
      } catch (e) {
        addToast("儲存失敗", "error");
      }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
    <div className="min-h-screen pb-24 relative selection:bg-zinc-800">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 transition-all">
        <div className="px-5 py-3 flex justify-between items-center">
           <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800/50">
               <button 
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'timeline' 
                      ? 'bg-zinc-800 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
               >
                   <CalendarDays size={14} />
                   行程
               </button>
               <button 
                  onClick={() => setViewMode('inbox')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'inbox' 
                      ? 'bg-zinc-800 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
               >
                   <Archive size={14} />
                   待定
                   {inboxItems.length > 0 && (
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1" />
                   )}
               </button>
           </div>

          <div className="flex items-center gap-3">
            {viewMode === 'timeline' && (
                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                    <Wallet size={14} />
                    <span className="text-xs font-mono font-bold">¥{dailyCost.toLocaleString()}</span>
                </div>
            )}
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-zinc-600 hover:text-white transition-colors p-1"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {viewMode === 'timeline' && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 px-5 pb-4 overflow-x-auto no-scrollbar"
            >
            {DATES.map((date, index) => {
                const isActive = date.full === selectedDate;
                const prevDate = DATES[index - 1];
                const isNewMonth = !prevDate || date.month !== prevDate.month;

                return (
                <React.Fragment key={date.full}>
                    {isNewMonth && (
                    <div className="flex flex-col justify-center items-center h-14 min-w-[32px] pl-1 pr-3 border-r border-transparent">
                        <span className="text-xs font-bold text-zinc-500 writing-vertical-rl">{date.month}</span>
                    </div>
                    )}
                    
                    <button
                    onClick={() => setSelectedDate(date.full)}
                    className={`flex flex-col items-center justify-center min-w-[50px] h-14 rounded-sm border transition-all ${
                        isActive 
                        ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                    >
                    <span className="text-[10px] uppercase font-bold tracking-wide">{date.day}</span>
                    <span className="text-lg font-bold leading-none">{date.label}</span>
                    </button>
                </React.Fragment>
                );
            })}
            </motion.div>
        )}
      </header>

      {/* Main Content Stream */}
      <main className="p-5 space-y-8 min-h-[60vh]">
        
        {isLoading ? (
            <div className="space-y-6 animate-pulse">
                <div className="w-full aspect-[4/3] bg-zinc-900 rounded-sm" />
                <div className="space-y-6 pl-4">
                    <SkeletonItem />
                    <SkeletonItem />
                    <SkeletonItem />
                </div>
            </div>
        ) : viewMode === 'timeline' ? (
           <>
                {/* Hero Card (Next Up) */}
                {heroItem ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full aspect-[4/3] rounded-sm overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedItem(heroItem)}
                >
                    <img src={heroItem.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={heroItem.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {heroItem.mapsUrl && (
                    <div 
                        className="absolute bottom-0 right-0 z-20 w-24 h-24 flex items-center justify-center active:bg-white/5 transition-colors cursor-pointer"
                        onClick={(e) => {
                        e.stopPropagation();
                        window.open(heroItem.mapsUrl!, '_blank');
                        }}
                    >
                        <div className="w-16 h-16 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10 hover:bg-black/40 transition-colors">
                            <Navigation size={32} className="text-white drop-shadow-md" />
                        </div>
                    </div>
                    )}

                    <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <div className="max-w-[70%]">
                        <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white text-black text-xs font-bold px-1.5 py-0.5 rounded-sm font-mono">
                            {heroItem.time}
                        </span>
                        <span className="text-zinc-300 text-xs font-mono uppercase tracking-wider truncate">
                            {heroItem.area}
                        </span>
                        {heroItem.status !== 'Scheduled' && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${getStatusColor(heroItem.status)} text-white`}>
                                {heroItem.status}
                            </span>
                        )}
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2">{heroItem.title}</h2>
                    </div>
                    </div>
                </motion.div>
                ) : (
                <div className="w-full aspect-video bg-zinc-900 rounded-sm flex flex-col items-center justify-center text-zinc-600 border border-zinc-800 border-dashed">
                    <span className="text-sm font-mono">本日無行程</span>
                </div>
                )}

                {/* Timeline List */}
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative pl-4 space-y-6"
                >
                <div className="absolute left-[29px] top-4 bottom-4 w-[1px] bg-zinc-800" />

                {displayTimelineItems.map((item, index) => (
                    <ItineraryCard 
                        key={item.id} 
                        item={item} 
                        prevItem={displayTimelineItems[index - 1]}
                        onClick={setSelectedItem}
                    />
                ))}
                </motion.div>
           </>
        ) : (
            // INBOX VIEW
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
            >
                {inboxItems.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-zinc-600 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/20">
                        <Archive size={32} className="mb-4 opacity-50" />
                        <p className="text-sm">待定清單是空的</p>
                        <p className="text-xs mt-2">隨手記下想去的地方，之後再排程</p>
                    </div>
                ) : (
                    inboxItems.map(item => (
                         <div 
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                         >
                             <div className="h-32 relative">
                                 <img src={item.coverImage} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                                 <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase bg-zinc-800 border border-zinc-700 text-zinc-300">
                                     {getTypeLabel(item.type)}
                                 </span>
                             </div>
                             <div className="p-3">
                                 <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</h3>
                                 <div className="flex items-center gap-1 text-xs text-zinc-500">
                                     <MapPin size={10} />
                                     {item.area}
                                 </div>
                             </div>
                         </div>
                    ))
                )}
            </motion.div>
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
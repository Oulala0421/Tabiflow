import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { 
  MapPin, 
  Plus, 
  Check, 
  Navigation,
  Settings,
  CloudSun,
  X,
  Edit2,
  ExternalLink,
  Clock,
  Link2,
  Sparkles,
  AlignLeft,
  Type,
  TrainFront,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Camera,
  Car,
  Bus,
  Plane,
  Footprints,
  Calendar,
  Info,
  Bell,
  Trash2,
  HelpCircle,
  AlertCircle,
  Megaphone,
  Github,
  BedDouble,
  Coffee,
  Wifi,
  Bath,
  ConciergeBell,
  Soup,
  ChevronDown,
  ChevronUp,
  Globe,
  StickyNote,
  ListTodo,
  CheckCircle2,
  Circle,
  Archive,
  LayoutGrid,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ItineraryItem, ItineraryType, ItineraryStatus } from "@/types/notion";

// --- Mock Data (Synced with types/notion.ts Schema) ---
const MOCK_IMAGES = {
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
  park: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  train: "https://images.unsplash.com/photo-1534053915-c2d1316b231d?w=800&q=80",
  food: "https://images.unsplash.com/photo-1596426724391-766323c21a4f?w=800&q=80",
  night: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
  market: "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  default: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
};

// Helper for translation
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'food': return '美食';
    case 'transport': return '交通';
    case 'shop': return '購物';
    case 'activity': return '景點';
    case 'stay': return '住宿';
    case 'manual': return '自訂';
    case 'ai': return 'AI';
    default: return type;
  }
};

const getStatusColor = (status: ItineraryStatus) => {
    switch (status) {
        case "Inbox": return "bg-zinc-500";
        case "To Review": return "bg-yellow-500";
        case "Scheduled": return "bg-indigo-500";
        case "Done": return "bg-emerald-500";
        default: return "bg-zinc-500";
    }
};

const getStatusLabel = (status: ItineraryStatus) => {
    switch (status) {
        case "Inbox": return "待定";
        case "To Review": return "待確認";
        case "Scheduled": return "已排程";
        case "Done": return "已完成";
        default: return status;
    }
};


// Generate 30-minute interval time options
const TIME_OPTIONS_30_MIN = (() => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    options.push(`${hour}:00`);
    options.push(`${hour}:30`);
  }
  return options;
})();

// Update Mock Data to span across months (Oct -> Nov)
const INITIAL_DATA: ItineraryItem[] = [
  {
    id: "1",
    time: "09:00",
    title: "Fuglen 東京",
    area: "澀谷",
    type: "food",
    status: "Scheduled",
    categories: ["咖啡廳", "早午餐"],
    mapsUrl: "https://goo.gl/maps/example",
    date: "2023-10-30",
    coverImage: MOCK_IMAGES.cafe,
    summary: "以淺焙咖啡和復古家具聞名。必點挪威鬆餅，早上去氣氛最好。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "2",
    title: "Parco 屋頂花園",
    time: "10:30",
    area: "澀谷",
    type: "activity",
    status: "Scheduled",
    categories: ["公園", "景觀"],
    mapsUrl: "https://goo.gl/maps/example",
    date: "2023-10-30",
    coverImage: MOCK_IMAGES.park,
    summary: "免費的屋頂花園，可俯瞰澀谷十字路口與周邊美景。適合購物後休息片刻。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "Inbox1",
    time: "TBD",
    title: "teamLab Planets",
    area: "豐洲",
    type: "activity",
    status: "Inbox",
    categories: ["展覽"],
    mapsUrl: "",
    date: "",
    coverImage: MOCK_IMAGES.night,
    summary: "想去但還沒決定哪天，記得要先買票。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "4",
    title: "前往新宿",
    time: "12:00",
    area: "交通",
    type: "transport",
    status: "Scheduled",
    categories: ["電車"],
    mapsUrl: "",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.train,
    summary: "搭乘山手線外回線，注意避開車頭車尾人潮。",
    lastEdited: new Date().toISOString(),
    transport: {
      mode: "JR 山手線",
      from: "澀谷",
      to: "新宿",
      platform: "2",
      car: "4",
      seat: "自由座",
      duration: "7分"
    }
  },
  {
    id: "5",
    title: "思出橫丁",
    time: "12:30",
    area: "新宿",
    type: "food",
    status: "Scheduled",
    categories: ["美食", "串燒"],
    mapsUrl: "",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.food,
    summary: "充滿昭和風情的小巷。大部分店家中午就開始營業，推薦嘗試鰻魚串。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "Inbox2",
    time: "TBD",
    title: "銀座 LoFt",
    area: "銀座",
    type: "shop",
    status: "Inbox",
    categories: ["購物"],
    mapsUrl: "",
    date: "",
    coverImage: MOCK_IMAGES.shop,
    summary: "有空的話可以去逛逛文具。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "7",
    title: "築地場外市場",
    time: "08:00",
    area: "築地",
    type: "food",
    status: "Scheduled",
    categories: ["市場", "早餐"],
    mapsUrl: "",
    date: "2023-11-02",
    coverImage: MOCK_IMAGES.market,
    summary: "先去排玉子燒。早上 9 點後人潮會非常多，建議提早抵達。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "8",
    title: "APA Hotel 新宿歌舞伎町",
    time: "15:00",
    area: "新宿",
    type: "stay",
    status: "Scheduled",
    categories: ["住宿", "飯店"],
    mapsUrl: "https://goo.gl/maps/exampleHotel",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.hotel,
    summary: "位於歌舞伎町中心，交通便利。頂樓設有大浴場。",
    lastEdited: new Date().toISOString(),
    accommodation: {
        isBreakfastIncluded: true,
        isDinnerIncluded: false,
        checkIn: "15:00",
        checkOut: "11:00",
        facilities: ["大浴場", "Wifi", "行李寄放"]
    }
  }
];

// --- Dates (Spanning Months) ---
const DATES = [
  { label: "30", full: "2023-10-30", day: "週一", month: "10月" },
  { label: "31", full: "2023-10-31", day: "週二", month: "10月" },
  { label: "01", full: "2023-11-01", day: "週三", month: "11月" },
  { label: "02", full: "2023-11-02", day: "週四", month: "11月" },
  { label: "03", full: "2023-11-03", day: "週五", month: "11月" },
];

// --- Animations ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer: Variants = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// --- Components ---

const DetailSheet = ({ 
    item, 
    onClose,
    onStatusChange,
    onEdit
}: { 
    item: ItineraryItem, 
    onClose: () => void,
    onStatusChange: (id: string, newStatus: ItineraryStatus) => void,
    onEdit: (item: ItineraryItem) => void
}) => {
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  const statuses: ItineraryStatus[] = ["Inbox", "Scheduled", "Done"];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-40"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 rounded-t-2xl max-h-[90vh] overflow-y-auto"
        style={{ height: '85vh' }}
      >
        {/* Header Image */}
        <div className="relative h-64 w-full">
          <img src={item.coverImage} className="w-full h-full object-cover rounded-t-2xl opacity-90" alt={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white border border-white/10 hover:bg-black/60"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-white mb-2 uppercase tracking-wider">
              {getTypeLabel(item.type)}
            </span>
            <h1 className="text-3xl font-bold text-white leading-none tracking-tight">{item.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-zinc-300 font-mono text-sm">
              <MapPin size={14} />
              {item.area}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-4 gap-3 p-6 border-b border-zinc-900 relative">
          <button 
            onClick={() => {
                if(item.mapsUrl) window.open(item.mapsUrl, '_blank');
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-transform group-active:scale-95 ${item.mapsUrl ? 'bg-zinc-900 border-zinc-800 group-active:bg-zinc-800 cursor-pointer' : 'bg-zinc-900/50 border-zinc-900 cursor-not-allowed opacity-50'}`}>
              <Navigation size={24} className={item.mapsUrl ? "text-white" : "text-zinc-600"} />
            </div>
            <span className="text-[10px] uppercase font-mono text-zinc-500">地圖</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-active:scale-95 transition-transform group-active:bg-zinc-800">
              <ExternalLink size={24} className="text-zinc-400" />
            </div>
            <span className="text-[10px] uppercase font-mono text-zinc-500">連結</span>
          </button>

          <div className="relative flex flex-col items-center gap-2 group">
            <button 
                onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                className="flex flex-col items-center gap-2 w-full"
            >
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-active:scale-95 transition-transform group-active:bg-zinc-800 relative">
                    <Check size={24} className={item.status === 'Done' ? "text-emerald-400" : "text-zinc-400"} />
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                </div>
                <span className="text-[10px] uppercase font-mono text-zinc-500">狀態</span>
            </button>
            
            {/* Status Picker Popover */}
            <AnimatePresence>
                {isStatusPickerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-16 left-1/2 -translate-x-1/2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 p-1"
                    >
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    onStatusChange(item.id, s);
                                    setIsStatusPickerOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors ${item.status === s ? 'text-white bg-zinc-800' : 'text-zinc-400'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s)}`} />
                                {getStatusLabel(s)}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => onEdit(item)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-active:scale-95 transition-transform group-active:bg-zinc-800">
              <Edit2 size={24} className="text-zinc-400" />
            </div>
            <span className="text-[10px] uppercase font-mono text-zinc-500">編輯</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-8">
          
          {/* Stay / Accommodation Card */}
          {item.type === 'stay' && item.accommodation && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-3">住宿詳情</h2>
               <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-800/20">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                           <BedDouble size={20} />
                        </div>
                        <div>
                           <div className="text-xs text-zinc-500">Booking Info</div>
                           <div className="font-bold text-white">已預訂</div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {item.accommodation.isBreakfastIncluded && (
                           <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-950/30 border border-orange-900/50 text-orange-400 text-[10px] font-bold" title="含早餐">
                              <Coffee size={10} />
                              早餐
                           </div>
                        )}
                        {item.accommodation.isDinnerIncluded && (
                           <div className="flex items-center gap-1 px-2 py-1 rounded bg-pink-950/30 border border-pink-900/50 text-pink-400 text-[10px] font-bold" title="含晚餐">
                              <Soup size={10} />
                              晚餐
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 divide-x divide-zinc-800">
                     <div className="p-4 text-center">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Check-in</div>
                        <div className="text-xl font-mono font-bold text-white">{item.accommodation.checkIn}</div>
                     </div>
                     <div className="p-4 text-center">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Check-out</div>
                        <div className="text-xl font-mono font-bold text-zinc-400">{item.accommodation.checkOut}</div>
                     </div>
                  </div>

                  {item.accommodation.facilities && item.accommodation.facilities.length > 0 && (
                     <div className="p-4 border-t border-zinc-800 bg-zinc-950/30 flex flex-wrap gap-2 justify-center">
                        {item.accommodation.facilities.map((fac, idx) => (
                           <span key={idx} className="text-[10px] px-2 py-1 bg-zinc-800 rounded text-zinc-400 border border-zinc-700">
                              {fac}
                           </span>
                        ))}
                     </div>
                  )}
               </div>
            </div>
          )}

          {/* Transport Card (Digital Ticket) */}
          {item.type === 'transport' && item.transport && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-3">交通資訊</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative">
                 {/* Top: Route */}
                 <div className="p-5 border-b border-zinc-800 bg-zinc-800/20 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">From</div>
                      <div className="text-xl font-bold text-white">{item.transport.from}</div>
                    </div>
                    <div className="flex flex-col items-center px-4">
                       <span className="text-zinc-600 text-[10px] mb-1">{item.transport.duration}</span>
                       <ArrowRight className="text-indigo-400" size={20} />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xs text-zinc-500 mb-1">To</div>
                      <div className="text-xl font-bold text-white">{item.transport.to}</div>
                    </div>
                 </div>

                 {/* Middle: Grid Details */}
                 <div className="grid grid-cols-3 divide-x divide-zinc-800">
                    <div className="p-3 text-center">
                       <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">月台</div>
                       <div className="text-lg font-mono font-bold text-indigo-400">{item.transport.platform || "-"}</div>
                    </div>
                    <div className="p-3 text-center">
                       <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">車廂</div>
                       <div className="text-lg font-mono font-bold text-white">{item.transport.car || "-"}</div>
                    </div>
                    <div className="p-3 text-center">
                       <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">座位</div>
                       <div className="text-lg font-mono font-bold text-white">{item.transport.seat || "-"}</div>
                    </div>
                 </div>

                 {/* Bottom: Info Footer */}
                 <div className="bg-zinc-950 p-3 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono border-t border-zinc-800">
                    <TrainFront size={14} />
                    <span>{item.transport.mode}</span>
                 </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">AI 摘要</h2>
            <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
              {item.summary || "暫無摘要內容。"}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">詳細資訊</h2>
            <div className="bg-zinc-900/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">時間</span>
                <span className="font-mono text-zinc-300">{item.time}</span>
              </div>
               <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">類別</span>
                <span className="text-zinc-300">{getTypeLabel(item.type)}</span>
              </div>
               <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">狀態</span>
                <span className={`text-xs font-bold border border-zinc-700 bg-zinc-800 px-2 py-0.5 rounded ${
                    item.status === 'Done' ? 'text-emerald-400' : 'text-zinc-300'
                }`}>{getStatusLabel(item.status)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const AboutModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl"
    >
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="font-bold text-white">關於 Tabiflow</h3>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Navigation className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Tabiflow</h2>
          <div className="flex flex-col items-center">
            <span className="text-xs font-mono text-zinc-500">v1.0.0 (Beta)</span>
            <span className="text-xs text-zinc-400 font-bold mt-1">Author: 黃奕維 (Willy)</span>
          </div>
        </div>
        <p className="text-sm text-zinc-400 text-center leading-relaxed">
           Tabiflow 是一個專為現代旅人設計的行程管理工具。結合 AI 智慧分析與 Notion 資料庫同步，讓您的旅行規劃更加流暢。
        </p>
        
        <div className="pt-4 border-t border-zinc-800/50 flex flex-col gap-2">
           <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors group">
              <span className="text-sm text-zinc-300 flex items-center gap-2"><Github size={16} /> GitHub</span>
              <ExternalLink size={14} className="text-zinc-600 group-hover:text-white" />
           </a>
        </div>

        <div className="pt-2 text-center">
            <p className="text-[10px] text-zinc-600">
                Designed & Built with ❤️ for Travelers.
            </p>
        </div>
      </div>
    </motion.div>
  </div>
);

const WelcomeModal = ({ onClose }: { onClose: () => void }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('tabiflow_welcome_seen', 'true');
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
              <Megaphone className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">重要公告</h2>
          </div>
          
          <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line text-center">
              此網站為 2026 日本寒假行特別設計。
              <br/><br/>
              目前手機只支援IOS，android會怎樣我不知道。
              <br/><br/>
              我已經設計得很<span className="text-indigo-400 font-bold">防呆</span>了，
              請<span className="text-red-400 font-bold">不要當天才</span>拜託 🙏
              <br/><br/>
              網站若有真正的問題，請截圖回報給黃奕維。
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600 bg-transparent'}`}>
              {dontShowAgain && <Check size={10} className="text-white" />}
            </div>
            <span className="text-xs text-zinc-500 select-none">下次不再顯示此公告</span>
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors active:scale-95"
          >
            收到，我會乖乖的
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SettingsModal = ({ 
    onClose, 
    onOpenAnnouncement,
    onOpenAbout 
}: { 
    onClose: () => void,
    onOpenAnnouncement: () => void,
    onOpenAbout: () => void
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-zinc-950 border-t sm:border border-zinc-800 sm:rounded-2xl rounded-t-2xl w-full max-w-sm overflow-hidden shadow-2xl h-[80vh] sm:h-auto"
      >
         <div className="p-4 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Settings size={18} />
                設定
            </h3>
            <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
         </div>

         <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(80vh-60px)] sm:max-h-[60vh]">
            <div className="px-4 py-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">一般</h4>
            </div>
            
            <button 
                onClick={() => {
                    onClose();
                    onOpenAnnouncement();
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Megaphone size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">查看公告</span>
                </div>
                <ChevronDown size={16} className="text-zinc-600 -rotate-90" />
            </button>

             <button 
                onClick={() => {
                    localStorage.removeItem('tabiflow_welcome_seen');
                    window.location.reload();
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-zinc-500 group-hover:text-red-400" />
                    <span className="text-sm text-zinc-300 group-hover:text-red-400">重置本機狀態</span>
                </div>
            </button>

            <div className="h-px bg-zinc-900 my-2" />

            <div className="px-4 py-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">支援</h4>
            </div>

            <button 
                onClick={() => {
                    onClose();
                    onOpenAbout();
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Info size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">關於我們</span>
                </div>
                <ChevronDown size={16} className="text-zinc-600 -rotate-90" />
            </button>
            
            <button 
                onClick={() => {
                    alert("就只有我一個還想找客服喔");
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">聯絡客服</span>
                </div>
                {/* No external link icon, as it is an internal action */}
            </button>
         </div>
         
         <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 text-center">
            <span className="text-[10px] text-zinc-600 font-mono">Build 2023.10.30-alpha</span>
         </div>
      </motion.div>
    </div>
  );
};

const QuickCapture = ({ 
    onClose, 
    onSave, 
    defaultDate,
    initialData 
}: { 
    onClose: () => void, 
    onSave: (data: any) => void, 
    defaultDate: string,
    initialData?: ItineraryItem | null
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  
  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [area, setArea] = useState("");
  const [selectedType, setSelectedType] = useState<ItineraryType>('activity');
  const [transportMode, setTransportMode] = useState("");
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInboxMode, setIsInboxMode] = useState(false); // New state for Inbox mode
  
  // Advanced Settings State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedMapUrl, setAdvancedMapUrl] = useState("");
  const [advancedWebUrl, setAdvancedWebUrl] = useState("");
  const [advancedMemo, setAdvancedMemo] = useState("");

  // Accommodation Fields
  const [checkIn, setCheckIn] = useState("15:00");
  const [checkOut, setCheckOut] = useState("11:00");
  const [isBreakfastIncluded, setIsBreakfastIncluded] = useState(false);
  const [isDinnerIncluded, setIsDinnerIncluded] = useState(false);
  const [facilities, setFacilities] = useState("");

  // Initialize form with initialData if in Edit Mode
  useEffect(() => {
    if (initialData) {
        setTitle(initialData.title.replace(/^前往 /, "")); // Clean up transport titles
        setDate(initialData.date);
        setTime(initialData.time === "TBD" ? "" : initialData.time);
        setArea(initialData.area === "交通" ? "" : initialData.area);
        setSelectedType(initialData.type);
        setAdvancedMapUrl(initialData.mapsUrl || "");
        setAdvancedMemo(initialData.summary || "");
        
        // Handle Transport
        if (initialData.type === 'transport' && initialData.transport) {
            setTransportMode(initialData.transport.mode || "");
            setArea(initialData.transport.from || "");
        }

        // Handle Accommodation
        if (initialData.type === 'stay' && initialData.accommodation) {
            setCheckIn(initialData.accommodation.checkIn || "15:00");
            setCheckOut(initialData.accommodation.checkOut || "11:00");
            setIsBreakfastIncluded(initialData.accommodation.isBreakfastIncluded || false);
            setIsDinnerIncluded(initialData.accommodation.isDinnerIncluded || false);
            setFacilities(initialData.accommodation.facilities?.join(", ") || "");
        }

        // Open advanced if there's data there
        if (initialData.mapsUrl || initialData.summary) {
            setIsAdvancedOpen(true);
        }

        // Check if item is in Inbox
        if (initialData.status === 'Inbox') {
            setIsInboxMode(true);
        }
    }
  }, [initialData]);


  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const facilitiesInputRef = useRef<HTMLInputElement>(null);
  const mapUrlInputRef = useRef<HTMLInputElement>(null);
  const webUrlInputRef = useRef<HTMLInputElement>(null);
  const memoInputRef = useRef<HTMLTextAreaElement>(null);


  const TYPE_OPTIONS: { value: ItineraryType, label: string, icon: any }[] = [
    { value: 'food', label: '美食', icon: Utensils },
    { value: 'activity', label: '景點', icon: Camera },
    { value: 'shop', label: '購物', icon: ShoppingBag },
    { value: 'stay', label: '住宿', icon: BedDouble },
    { value: 'transport', label: '交通', icon: TrainFront },
  ];

  const TRANSPORT_MODES = [
    { label: "電車", icon: TrainFront },
    { label: "地鐵", icon: TrainFront },
    { label: "新幹線", icon: TrainFront },
    { label: "公車", icon: Bus },
    { label: "計程車", icon: Car },
    { label: "步行", icon: Footprints },
    { label: "飛機", icon: Plane },
  ];

  useEffect(() => {
    // Focus appropriate input on mount or tab change
    setTimeout(() => {
      if (activeTab === 'manual') {
        titleInputRef.current?.focus();
      } else {
        urlInputRef.current?.focus();
      }
    }, 50);
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'manual') {
      if (title.trim()) {
        const payload: any = { 
          // If editing, preserve ID, otherwise handleSaveItem will generate one
          id: initialData?.id,
          title, 
          date: isInboxMode ? "" : date, // Clear date if inbox mode
          time: isInboxMode ? "TBD" : (time || "待定"), 
          area: area || "待定", 
          type: 'manual',
          selectedType: selectedType,
          status: isInboxMode ? 'Inbox' : (initialData?.status === 'Inbox' ? 'Scheduled' : (initialData?.status || 'Scheduled')), // Logic to move out of inbox if date set
          // Advanced Fields
          mapsUrl: advancedMapUrl,
          websiteUrl: advancedWebUrl,
          memo: advancedMemo
        };

        if (selectedType === 'transport') {
             payload.transportMode = transportMode;
        }

        if (selectedType === 'stay') {
            payload.accommodation = {
                checkIn: checkIn || "15:00",
                checkOut: checkOut || "11:00",
                isBreakfastIncluded,
                isDinnerIncluded,
                facilities: facilities.split(',').map(f => f.trim()).filter(Boolean)
            };
        }

        onSave(payload);
        onClose();
      }
    } else {
      if (url.trim()) {
        setIsAnalyzing(true);
        // Simulate AI Network Request
        setTimeout(() => {
          onSave({ 
            title: "AI 分析地點", 
            date: isInboxMode ? "" : date,
            time: isInboxMode ? "TBD" : (time || "待定"), 
            area: area || "待定", 
            url, 
            context,
            type: 'ai',
            status: isInboxMode ? 'Inbox' : 'Scheduled'
          });
          onClose();
        }, 1500);
      }
    }
  };

  const getPlaceholder = () => {
    if (selectedType === 'transport') return "目的地 (例如：新宿)";
    if (selectedType === 'stay') return "飯店名稱";
    return "想去哪裡？";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
      >
        <X size={32} strokeWidth={1.5} />
      </button>

      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar pb-10">
        
        {/* Tabs - Hide tabs if editing */}
        {!initialData && (
            <div className="flex justify-center mb-6 border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10 pt-2">
            <button 
                onClick={() => setActiveTab('manual')}
                className={`pb-3 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all gap-2 flex items-center ${
                activeTab === 'manual' 
                    ? 'text-white border-white' 
                    : 'text-zinc-600 border-transparent hover:text-zinc-400'
                }`}
            >
                <Type size={16} />
                手動輸入
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`pb-3 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all gap-2 flex items-center ${
                activeTab === 'ai' 
                    ? 'text-indigo-400 border-indigo-400' 
                    : 'text-zinc-600 border-transparent hover:text-zinc-400'
                }`}
            >
                <Sparkles size={16} />
                AI 連結
            </button>
            </div>
        )}

        {initialData && (
            <div className="flex justify-center mb-8">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Edit2 size={18} />
                    編輯行程
                </h2>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Inbox Toggle */}
            <div 
                onClick={() => setIsInboxMode(!isInboxMode)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isInboxMode 
                    ? "bg-indigo-900/20 border-indigo-500/50" 
                    : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isInboxMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Archive size={16} />
                    </div>
                    <div>
                        <div className={`text-sm font-bold ${isInboxMode ? 'text-indigo-200' : 'text-zinc-300'}`}>加入待定清單</div>
                        <div className="text-[10px] text-zinc-500">不設定日期與時間，稍後再排程</div>
                    </div>
                </div>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isInboxMode ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'}`}>
                     {isInboxMode && <Check size={12} className="text-white" />}
                </div>
            </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Title Input (Dynamic Placeholder) */}
                <input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full bg-transparent text-3xl md:text-4xl font-bold text-center text-white placeholder:text-zinc-800 outline-none border-b border-zinc-800 pb-4 focus:border-white transition-colors"
                />

                {/* Transport Mode Selection (Visible only for transport) */}
                {selectedType === 'transport' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                     <div 
                        onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="交通方式 (例如：JR 山手線)"]')?.focus()}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors"
                     >
                        <TrainFront size={16} className="text-zinc-500 shrink-0" />
                        <input
                          type="text"
                          value={transportMode}
                          onChange={(e) => setTransportMode(e.target.value)}
                          placeholder="交通方式 (例如：JR 山手線)"
                          className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700"
                        />
                     </div>
                     
                     <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {TRANSPORT_MODES.map((mode) => (
                           <button
                             key={mode.label}
                             type="button"
                             onClick={() => setTransportMode(mode.label)}
                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border whitespace-nowrap transition-colors ${
                               transportMode === mode.label 
                                 ? "bg-white text-black border-white" 
                                 : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                             }`}
                           >
                              <mode.icon size={12} />
                              {mode.label}
                           </button>
                        ))}
                     </div>
                  </motion.div>
                )}

                {/* Stay Fields (Visible only for stay) */}
                {selectedType === 'stay' && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="space-y-3"
                  >
                     {/* Check-in / Check-out with 30-min precision */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 relative">
                           <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Check-in</label>
                           <div className="relative">
                              <select 
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full bg-transparent text-white outline-none font-mono text-sm appearance-none py-1 relative z-10"
                              >
                                {TIME_OPTIONS_30_MIN.map(t => (
                                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                                ))}
                              </select>
                           </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 relative">
                           <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Check-out</label>
                           <div className="relative">
                              <select 
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full bg-transparent text-white outline-none font-mono text-sm appearance-none py-1 relative z-10"
                              >
                                {TIME_OPTIONS_30_MIN.map(t => (
                                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                                ))}
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* Meals Toggle Group */}
                     <div className="grid grid-cols-2 gap-3">
                        <div 
                            onClick={() => setIsBreakfastIncluded(!isBreakfastIncluded)}
                            className={`flex items-center gap-3 p-3 rounded-sm border transition-all cursor-pointer ${
                                isBreakfastIncluded 
                                ? "bg-orange-950/20 border-orange-500/50" 
                                : "bg-zinc-900/50 border-zinc-800"
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isBreakfastIncluded ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'}`}>
                                {isBreakfastIncluded && <Check size={12} className="text-black" strokeWidth={3} />}
                            </div>
                            <div className="flex items-center gap-2">
                                <Coffee size={16} className={isBreakfastIncluded ? "text-orange-400" : "text-zinc-500"} />
                                <span className={`text-sm font-medium ${isBreakfastIncluded ? "text-orange-100" : "text-zinc-400"}`}>含早餐</span>
                            </div>
                        </div>

                        <div 
                            onClick={() => setIsDinnerIncluded(!isDinnerIncluded)}
                            className={`flex items-center gap-3 p-3 rounded-sm border transition-all cursor-pointer ${
                                isDinnerIncluded 
                                ? "bg-pink-950/20 border-pink-500/50" 
                                : "bg-zinc-900/50 border-zinc-800"
                            }`}
                        >
                             <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isDinnerIncluded ? 'bg-pink-500 border-pink-500' : 'border-zinc-600'}`}>
                                {isDinnerIncluded && <Check size={12} className="text-black" strokeWidth={3} />}
                            </div>
                            <div className="flex items-center gap-2">
                                <Soup size={16} className={isDinnerIncluded ? "text-pink-400" : "text-zinc-500"} />
                                <span className={`text-sm font-medium ${isDinnerIncluded ? "text-pink-100" : "text-zinc-400"}`}>含晚餐</span>
                            </div>
                        </div>
                     </div>

                     {/* Facilities */}
                     <div 
                        onClick={() => facilitiesInputRef.current?.focus()}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-start gap-3 focus-within:border-zinc-600 transition-colors"
                     >
                        <ConciergeBell size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                        <input
                          ref={facilitiesInputRef}
                          type="text"
                          value={facilities}
                          onChange={(e) => setFacilities(e.target.value)}
                          placeholder="設施 / 備註 (以逗號分隔)"
                          className="bg-transparent text-white w-full outline-none text-sm placeholder:text-zinc-700"
                        />
                     </div>
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* URL Input */}
                <div 
                  onClick={() => urlInputRef.current?.focus()}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4 flex items-start gap-3 focus-within:border-indigo-500/50 transition-colors"
                >
                  <Link2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <input
                    ref={urlInputRef}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="貼上 Google Maps 或部落格連結..."
                    className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700"
                  />
                </div>

                {/* AI Context Memo (Added) */}
                <div 
                  onClick={() => document.getElementById('ai-memo-input')?.focus()}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-4 flex items-start gap-3 focus-within:border-indigo-500/50 transition-colors"
                >
                  <StickyNote size={18} className="text-zinc-500 shrink-0 mt-0.5" />
                  <textarea
                    id="ai-memo-input"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    placeholder="給 AI 的備註 (例如：幫我找這附近的拉麵...)"
                    className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700 resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared Fields: Date & Time & Area */}
          <motion.div 
            animate={{ opacity: isInboxMode ? 0.3 : 1, pointerEvents: isInboxMode ? 'none' : 'auto' }}
            className="space-y-3 transition-opacity"
          >
             {/* Row 1: Date & Time */}
             <div className="flex gap-4">
                <div 
                   onClick={() => {
                      if (!isInboxMode) {
                        try {
                            dateInputRef.current?.showPicker();
                        } catch (err) {
                            dateInputRef.current?.focus();
                            dateInputRef.current?.click();
                        }
                      }
                   }}
                   className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors cursor-pointer"
                >
                   <Calendar size={16} className="text-zinc-500 shrink-0" />
                   <input
                     ref={dateInputRef}
                     type="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     className="bg-transparent text-white w-full outline-none font-mono text-sm cursor-pointer"
                     disabled={isInboxMode}
                   />
                </div>
                
                <div 
                   onClick={() => {
                      if (!isInboxMode) {
                        try {
                            timeInputRef.current?.showPicker();
                        } catch (err) {
                            timeInputRef.current?.focus();
                            timeInputRef.current?.click();
                        }
                      }
                   }}
                   className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors cursor-pointer"
                >
                   <Clock size={16} className="text-zinc-500 shrink-0" />
                   <input
                     ref={timeInputRef}
                     type="time"
                     value={time}
                     onChange={(e) => setTime(e.target.value)}
                     className="bg-transparent text-white w-full outline-none font-mono text-sm cursor-pointer"
                     disabled={isInboxMode}
                   />
                </div>
             </div>
          </motion.div>

          {/* Area - Always visible but styled subtly */}
           <div 
               onClick={() => areaInputRef.current?.focus()}
               className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors"
             >
                <MapPin size={16} className="text-zinc-500 shrink-0" />
                <input
                  ref={areaInputRef}
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={selectedType === 'transport' ? "出發地 (選填)" : "地區 (選填)"}
                  className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700"
                />
            </div>


          {/* Category Selection (Manual Only) */}
          {activeTab === 'manual' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-5 gap-2 pt-2"
            >
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedType(opt.value)}
                  className={`flex flex-col items-center justify-center p-2 rounded-sm border transition-all ${
                    selectedType === opt.value
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <opt.icon size={18} className="mb-1.5" strokeWidth={2} />
                  <span className="text-[10px] font-bold tracking-wide whitespace-nowrap">{opt.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Advanced Settings (Manual Only) */}
          {activeTab === 'manual' && (
            <div className="pt-2">
                <button 
                   type="button"
                   onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                   className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:text-zinc-300 transition-colors mb-4 w-full justify-center"
                >
                   {isAdvancedOpen ? '隱藏進階設定' : '顯示進階設定'}
                   {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                   {isAdvancedOpen && (
                      <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="space-y-3 overflow-hidden"
                      >
                         {/* Map URL */}
                         <div 
                           onClick={() => mapUrlInputRef.current?.focus()}
                           className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors"
                         >
                            <Navigation size={16} className="text-zinc-500 shrink-0" />
                            <input
                              ref={mapUrlInputRef}
                              type="text"
                              value={advancedMapUrl}
                              onChange={(e) => setAdvancedMapUrl(e.target.value)}
                              placeholder="Google Maps 連結"
                              className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700"
                            />
                         </div>

                         {/* Web URL */}
                         <div 
                           onClick={() => webUrlInputRef.current?.focus()}
                           className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors"
                         >
                            <Globe size={16} className="text-zinc-500 shrink-0" />
                            <input
                              ref={webUrlInputRef}
                              type="text"
                              value={advancedWebUrl}
                              onChange={(e) => setAdvancedWebUrl(e.target.value)}
                              placeholder="網站 / 部落格連結"
                              className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700"
                            />
                         </div>

                         {/* Memo / Notes */}
                         <div 
                            onClick={() => memoInputRef.current?.focus()}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-start gap-3 focus-within:border-zinc-600 transition-colors"
                         >
                           <StickyNote size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                           <textarea
                             ref={memoInputRef}
                             rows={3}
                             value={advancedMemo}
                             onChange={(e) => setAdvancedMemo(e.target.value)}
                             placeholder="詳細備註..."
                             className="bg-transparent text-white w-full outline-none font-mono text-sm placeholder:text-zinc-700 resize-none"
                           />
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
            </div>
          )}

          <div className="flex justify-center mt-8">
             <button 
              type="submit"
              disabled={activeTab === 'manual' ? !title.trim() : !url.trim() || isAnalyzing}
              className={`px-10 py-3 rounded-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto flex items-center justify-center gap-2 ${
                activeTab === 'ai' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  分析中...
                </>
              ) : (
                activeTab === 'ai' ? '分析並新增' : (initialData ? (isInboxMode ? '更新至待定' : '更新行程') : (isInboxMode ? '加入待定' : '加入行程'))
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const App = () => {
  const [items, setItems] = useState<ItineraryItem[]>(INITIAL_DATA);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'inbox'>('timeline'); // New state for view toggle

  // Current time state
  const [now, setNow] = useState(new Date());

  // Update time every 30 seconds to keep UI fresh
  useEffect(() => {
    // Initial set
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000); 
    return () => clearInterval(timer);
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const now = new Date();
      // Format: YYYY-MM-DD
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
      
      const found = DATES.find(d => d.full === today);
      return found ? found.full : DATES[0].full;
    } catch (e) {
      return DATES[0].full;
    }
  });

  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Check for welcome message on mount
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('tabiflow_welcome_seen');
    if (hasSeenWelcome !== 'true') {
      // Small delay to make it feel natural after load
      setTimeout(() => setIsWelcomeOpen(true), 500);
    }
  }, []);

  // Filter and Sort for Timeline
  const timelineItems = items
    .filter(item => item.date === selectedDate && item.status !== 'Inbox')
    .sort((a, b) => a.time.localeCompare(b.time));

  // Filter for Inbox (Backlog)
  const inboxItems = items.filter(item => item.status === 'Inbox');

  // Determine Hero Item (Auto-advance logic)
  let heroItem = timelineItems[0];
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  // Only apply auto-advance if we are looking at "Today"
  if (selectedDate === todayStr && timelineItems.length > 0) {
      const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:mm format
      
      // Find all items that have already "started" (time <= current time)
      const startedItems = timelineItems.filter(item => item.time <= currentTimeStr);
      
      if (startedItems.length > 0) {
          // The last started item is the "current" one
          heroItem = startedItems[startedItems.length - 1];
      }
      // If no items started (it's early morning), default to timelineItems[0] (Next Up)
  }

  // Final List to display in Timeline (exclude Hero)
  const displayTimelineItems = timelineItems.filter(item => item.id !== heroItem?.id);

  const getImageForType = (type: ItineraryType) => {
    switch (type) {
      case 'food': return MOCK_IMAGES.food;
      case 'transport': return MOCK_IMAGES.train;
      case 'shop': return MOCK_IMAGES.shop;
      case 'activity': return MOCK_IMAGES.park;
      case 'stay': return MOCK_IMAGES.hotel;
      default: return MOCK_IMAGES.default;
    }
  };

  const handleStatusChange = (id: string, newStatus: ItineraryStatus) => {
      setItems(items.map(i => i.id === id ? { ...i, status: newStatus } : i));
      
      // Update selected item if it's currently open
      if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, status: newStatus });
      }
  };

  const handleEditClick = (item: ItineraryItem) => {
      setEditingItem(item);
      setSelectedItem(null); // Close detail sheet
  };

  const handleUpdateItem = (data: any) => {
      // Close capture modal
      setEditingItem(null);
      setIsQuickCaptureOpen(false);

      // Process Data into Item Structure
      const type = data.selectedType || "activity";
      let finalTitle = data.title;
      let transportInfo = undefined;
      let accommodationInfo = undefined;

      // Handle Transport specific formatting
      if (type === 'transport') {
        const mode = data.transportMode || "交通工具";
        if (!data.id) {
             finalTitle = `前往 ${data.title}`;
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

      // Construct Summary
      let summaryText = "";
      if (data.memo) {
         summaryText = data.memo; // Use memo directly as summary
      } else {
         // Fallback default summaries
         if (type === 'transport') {
            summaryText += `預計搭乘 ${data.transportMode || "交通工具"} 前往 ${data.title}\n\n`;
         } else if (type === 'stay') {
            summaryText += "住宿行程\n\n";
         } else {
            summaryText += "手動新增項目\n\n";
         }
      }
      
      if (data.websiteUrl) {
         if (!summaryText.includes(data.websiteUrl)) {
             summaryText += `\n🔗 網站: ${data.websiteUrl}`;
         }
      }

      const newItem: ItineraryItem = {
        id: data.id || Date.now().toString(),
        title: finalTitle,
        time: data.time,
        area: type === 'transport' ? "交通" : (data.area || "待定"),
        type: type,
        status: data.status, // Use status passed from QuickCapture (can be Inbox or Scheduled)
        categories: [],
        mapsUrl: data.mapsUrl || null,
        date: data.date, 
        coverImage: getImageForType(type),
        summary: summaryText.trim(),
        lastEdited: new Date().toISOString(),
        transport: transportInfo,
        accommodation: accommodationInfo
      };

      if (data.id) {
          // Update existing
          setItems(items.map(i => i.id === data.id ? newItem : i));
      } else {
          // Add new
          setItems([...items, newItem]);
      }
  };

  const handleSaveNewItem = (data: any) => {
      handleUpdateItem(data);
  };

  return (
    <div className="min-h-screen pb-24 relative selection:bg-zinc-800">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 transition-all">
        <div className="px-5 py-3 flex justify-between items-center">
            {/* View Toggle */}
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
              <CloudSun size={14} />
              <span className="text-xs font-mono">18°C</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-zinc-600 hover:text-white transition-colors p-1"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Date Pills (Only show in Timeline mode) */}
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
        
        {viewMode === 'timeline' ? (
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
                    
                    {/* Map Jump Button */}
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

                {displayTimelineItems.map((item) => (
                    <motion.div 
                    key={item.id}
                    variants={fadeInUp}
                    className="relative flex items-center gap-4 group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                    >
                    <div className="w-12 text-right">
                        <span className={`text-sm font-mono font-medium block ${item.status === 'Done' ? 'text-zinc-600 line-through' : 'text-zinc-500'}`}>{item.time}</span>
                    </div>

                    <div className="relative z-10 flex-shrink-0">
                        <div 
                            onClick={(e) => {
                            if (item.mapsUrl) {
                                e.stopPropagation();
                                window.open(item.mapsUrl, '_blank');
                            }
                            }}
                            className={`relative w-14 h-14 rounded-sm border border-zinc-800 bg-zinc-900 overflow-hidden transition-all ${item.mapsUrl ? 'active:scale-95 active:border-white ring-offset-2 ring-offset-zinc-950 hover:border-zinc-500' : ''}`}
                        >
                        <img 
                            src={item.coverImage} 
                            className={`w-full h-full object-cover transition-opacity ${item.status === 'Done' ? 'opacity-40 grayscale' : ''}`}
                            alt={item.title}
                        />
                        {item.status === 'Done' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                        )}
                        {item.mapsUrl && item.status !== 'Done' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Navigation size={16} className="text-white drop-shadow-md" />
                            </div>
                        )}
                        </div>
                    </div>

                    <div className="flex-1 border-b border-zinc-900 pb-6 pt-1 group-last:border-0">
                        <h3 className={`font-medium text-base transition-colors ${item.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'}`}>{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                            {getTypeLabel(item.type)}
                        </span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{item.area}</span>
                        {item.status !== 'Scheduled' && item.status !== 'Done' && (
                            <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${getStatusColor(item.status)} text-white`}>
                                {item.status}
                            </span>
                        )}
                        </div>
                    </div>
                    </motion.div>
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

      {/* Modals */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <WelcomeModal onClose={() => setIsWelcomeOpen(false)} />
        )}
        
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            onOpenAnnouncement={() => setIsWelcomeOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
          />
        )}

        {isAboutOpen && (
          <AboutModal onClose={() => setIsAboutOpen(false)} />
        )}

        {selectedItem && (
          <DetailSheet 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
            onStatusChange={handleStatusChange}
            onEdit={handleEditClick}
          />
        )}
        
        {(isQuickCaptureOpen || editingItem) && (
          <QuickCapture 
            onClose={() => {
                setIsQuickCaptureOpen(false);
                setEditingItem(null);
            }}
            onSave={handleSaveNewItem}
            defaultDate={selectedDate}
            initialData={editingItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
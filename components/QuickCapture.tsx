import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Type, Sparkles, Edit2, Archive, Check, TrainFront, Bus, Car, Footprints, Plane,
  Coffee, Soup, ConciergeBell, Link2, StickyNote, Calendar, Clock, MapPin, Banknote,
  Utensils, Camera, ShoppingBag, BedDouble, ChevronUp, ChevronDown, Navigation, Globe
} from "lucide-react";
import { ExtendedItineraryItem, ItineraryType } from "@/types/notion";
import { TIME_OPTIONS_30_MIN } from "@/lib/data";

export const QuickCapture = ({ 
    onClose, 
    onSave, 
    defaultDate,
    initialData 
}: { 
    onClose: () => void, 
    onSave: (data: any) => void, 
    defaultDate: string,
    initialData?: ExtendedItineraryItem | null
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
  const [isInboxMode, setIsInboxMode] = useState(false);
  
  // Cost State
  const [money, setMoney] = useState("");
  const [memo, setMemo] = useState(""); // Restored missing state

  // Advanced Settings State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedMapUrl, setAdvancedMapUrl] = useState("");
  const [advancedWebUrl, setAdvancedWebUrl] = useState("");
  const [advancedMemo, setAdvancedMemo] = useState("");
  
  // Transport Fields
  const [platform, setPlatform] = useState("");
  const [car, setCar] = useState("");
  const [seat, setSeat] = useState("");

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
        setMoney(initialData.cost ? initialData.cost.toString() : "");
        
        // Handle Transport
        if (initialData.type === 'transport' && initialData.transport) {
            setTransportMode(initialData.transport.mode || "");
            setArea(initialData.transport.from || "");
            setPlatform(initialData.transport.platform || "");
            setCar(initialData.transport.car || "");
            setSeat(initialData.transport.seat || "");
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
    } else {
        // Reset to Defaults
        setTitle("");
        setSelectedType("activity"); // Default
        setMemo("");
        setMoney("");
        setTransportMode("");
        setPlatform("");
        setCar("");
        setSeat("");
        setCheckIn("11:00");
        setCheckOut("15:00");
        setFacilities("");
        setIsBreakfastIncluded(false);
        setIsDinnerIncluded(false);
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
          date: isInboxMode ? undefined : date,
          time: isInboxMode ? "TBD" : (time || "TBD"),
          area: area,
          selectedType,
          status: isInboxMode ? 'Inbox' : (initialData?.status || 'Scheduled'),
          // Use advanced values if present
          mapsUrl: advancedMapUrl,
          cost: money ? parseInt(money) : undefined
        };

        if (advancedWebUrl) payload.url = advancedWebUrl;
        if (advancedMemo) payload.summary = advancedMemo; // Override simple memo if advanced used

        if (initialData) payload.id = initialData.id;

        if (selectedType === 'transport') {
            payload.transportMode = transportMode;
            payload.transportPlatform = platform;
            payload.transportCar = car;
            payload.transportSeat = seat;
        }    
        if (selectedType === 'stay') {
            payload.accommodation = {
                checkIn: checkIn || "11:00",
                checkOut: checkOut || "15:00",
                isBreakfastIncluded,
                isDinnerIncluded,
                facilities: facilities.split(',').map(f => f.trim()).filter(Boolean)
            };
        }

        onSave(payload);
        onClose();
      }
    } else {
      // AI Mode: Fire-and-forget to /api/capture
      if (url.trim()) {
        setIsAnalyzing(true);

        // Call capture API
        fetch('/api/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            title: url, // Use URL as temporary title
            date: isInboxMode ? undefined : date,
            area: area || undefined,
            status: isInboxMode ? 'Inbox' : 'Scheduled',
          }),
        })
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              // Notify parent to refresh
              onSave({
                type: 'ai',
                status: isInboxMode ? 'Inbox' : 'Scheduled',
              });
              onClose();
            } else {
              throw new Error('Failed to capture');
            }
          })
          .catch((error) => {
            console.error('Capture failed:', error);
            alert('加入失敗,請稍後再試');
            setIsAnalyzing(false);
          });
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

      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar pb-10">
        
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
                    ? 'text-white border-white' 
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
                     
                     {/* Platform / Car / Seat Inputs */}
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-2 flex items-center gap-2">
                           <span className="text-zinc-600 text-xs whitespace-nowrap">月台</span>
                           <input
                             value={platform}
                             onChange={(e) => setPlatform(e.target.value)}
                             placeholder="-"
                             className="bg-transparent text-white w-full outline-none font-mono text-xs text-center"
                           />
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-2 flex items-center gap-2">
                           <span className="text-zinc-600 text-xs whitespace-nowrap">車廂</span>
                           <input
                             value={car}
                             onChange={(e) => setCar(e.target.value)}
                             placeholder="-"
                             className="bg-transparent text-white w-full outline-none font-mono text-xs text-center"
                           />
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-2 flex items-center gap-2">
                           <span className="text-zinc-600 text-xs whitespace-nowrap">座位</span>
                           <input
                             value={seat}
                             onChange={(e) => setSeat(e.target.value)}
                             placeholder="-"
                             className="bg-transparent text-white w-full outline-none font-mono text-xs text-center"
                           />
                        </div>
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
          <div className="space-y-3">
             {/* Row 1: Date & Time */}
             <div className="flex gap-4">
                <div 
                   onClick={() => {
                        // If inbox mode, allow clicking to enable
                        if (isInboxMode) {
                            // setIsInboxMode(false); // Don't force false immediately, let user pick
                            // Actually we need to allow picker.
                        }
                        
                        // Open picker
                        setTimeout(() => {
                             try {
                                dateInputRef.current?.showPicker();
                            } catch (err) {
                                dateInputRef.current?.focus();
                            }
                        }, 50);
                   }}
                   className={`flex-1 bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors cursor-pointer ${isInboxMode ? 'opacity-70' : ''}`}
                >
                   <Calendar size={16} className="text-zinc-500 shrink-0" />
                   <input
                     ref={dateInputRef}
                     type="date"
                     value={date}
                     onChange={(e) => {
                         setDate(e.target.value);
                         if(e.target.value) setIsInboxMode(false);
                     }}
                     className="bg-transparent text-white w-full outline-none font-mono text-sm cursor-pointer"
                   />
                </div>
                
                <div 
                   onClick={() => {
                      if (isInboxMode) setIsInboxMode(false);
                      setTimeout(() => {
                            try {
                                timeInputRef.current?.showPicker();
                            } catch (err) {
                                timeInputRef.current?.focus();
                            }
                       }, 50);
                   }}
                   className={`flex-1 bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors cursor-pointer ${isInboxMode ? 'opacity-70' : ''}`}
                >
                   <Clock size={16} className="text-zinc-500 shrink-0" />
                   <input
                     ref={timeInputRef}
                     type="time"
                     value={time}
                     onChange={(e) => {
                         setTime(e.target.value);
                         if(e.target.value) setIsInboxMode(false);
                     }}
                     className="bg-transparent text-white w-full outline-none font-mono text-sm cursor-pointer"
                   />
                </div>
             </div>
          </div>

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
            
            {/* Cost Input (New) */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 flex items-center gap-3 focus-within:border-zinc-600 transition-colors">
                <Banknote size={16} className="text-yellow-500 shrink-0" />
                <input
                    type="number"
                    value={money}
                    onChange={(e) => setMoney(e.target.value)}
                    placeholder="預估花費 (JPY)"
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

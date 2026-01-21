import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Navigation, ExternalLink, Check, Edit2, Banknote, BedDouble, 
  Coffee, Soup, TrainFront, ArrowRight, Trash2, Plane 
} from "lucide-react";
import { ExtendedItineraryItem, ItineraryStatus } from "@/types/notion";
import { getTypeLabel, getStatusColor, getStatusLabel } from "@/lib/utils";
import { VisualFallback } from "./VisualFallback";

export const DetailSheet = ({ 
    item, 
    onClose,
    onStatusChange,
    onEdit,
    onDelete,
    currency = 'JPY'
}: { 
    item: ExtendedItineraryItem, 
    onClose: () => void,
    onStatusChange: (id: string, newStatus: ItineraryStatus) => void,
    onEdit: (item: ExtendedItineraryItem) => void,
    onDelete: (id: string) => void,
    currency?: 'JPY' | 'TWD'
}) => {
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const statuses: ItineraryStatus[] = ["Inbox", "Scheduled", "Done"];

  // Reset delete confirm when opening new item
  useEffect(() => {
    setDeleteConfirm(false);
  }, [item.id]);

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
          <VisualFallback item={item} className="w-full h-full rounded-t-2xl opacity-90" iconSize="text-6xl" />
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
          
          {/* Cost Display */}
          <div className="animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Banknote size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">預估開銷</div>
                        <div className="text-white font-bold">
                            {item.cost && item.cost > 0 
                                ? (currency === 'JPY' 
                                    ? `¥${item.cost.toLocaleString()}` 
                                    : `NT$${Math.round(item.cost / 5).toLocaleString()}`)
                                : "免費"
                            }
                        </div>
                    </div>
                </div>
                {item.cost && item.cost > 0 && (
                    <span className="text-xs text-zinc-600 font-mono">
                         ≈ {currency === 'JPY' 
                             ? `TWD ${Math.round(item.cost / 5).toLocaleString()}` 
                             : `JPY ${item.cost.toLocaleString()}`
                           }
                    </span>
                )}
             </div>
          </div>

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
                    {/* Conditional Rendering for Flight vs Standard */}
                    {item.transport.mode?.includes("飛機") ? (
                         <>
                            <div className="p-3 text-center">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">班機</div>
                                <div className="text-lg font-mono font-bold text-indigo-400">{item.transport.flightNumber || "-"}</div>
                            </div>
                            <div className="p-3 text-center">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">航廈</div>
                                <div className="text-lg font-mono font-bold text-white">{item.transport.terminal || "-"}</div>
                            </div>
                            <div className="p-3 text-center">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">登機門</div>
                                <div className="text-lg font-mono font-bold text-white">{item.transport.gate || "-"}</div>
                            </div>
                         </>
                    ) : (
                        <>
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
                        </>
                    )}
                 </div>

                 {/* Bottom: Info Footer */}
                 <div className="bg-zinc-950 p-3 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono border-t border-zinc-800">
                    {item.transport.mode?.includes("飛機") ? <Plane size={14} /> : <TrainFront size={14} />}
                    <span>{item.transport.mode}</span>
                    {/* Show Seat separately for flight if needed, or include in grid if space allows. 
                        Design consistency implies 3 columns. For flight we have Flight, Terminal, Gate. Seat can be secondary or 4th?
                        Let's check if we can add seat somewhere else or if 3 slots are enough. 
                        Usually Flight#, Terminal, Gate are key. Seat is on ticket. 
                        User screenshot showed Seat "Free Seating". 
                        Let's put Seat in the footer or replace Flight#? No Flight# is important.
                        Maybe 4 columns for flight? Or add seat to footer text.
                    */}
                    {item.transport.mode?.includes("飛機") && item.transport.seat && item.transport.seat !== "-" && (
                        <span className="ml-2 border-l border-zinc-800 pl-2">座位 {item.transport.seat}</span>
                    )}
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

          {/* Destructive Action */}
          <div className="pt-6 border-t border-zinc-900">
             <button 
                onClick={() => {
                   if (deleteConfirm) {
                      onDelete(item.id);
                      onClose();
                   } else {
                      setDeleteConfirm(true);
                   }
                }}
                className={`w-full py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                   deleteConfirm 
                   ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                   : "bg-transparent border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50"
                }`}
             >
                <Trash2 size={16} />
                {deleteConfirm ? "確定要刪除嗎？" : "刪除此行程"}
             </button>
             {deleteConfirm && (
                <div className="text-center mt-2">
                    <span className="text-[10px] text-zinc-500">再次點擊以永久刪除</span>
                </div>
             )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

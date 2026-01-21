import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Archive, Wallet, Settings } from "lucide-react";
import { ExtendedItineraryItem } from "@/types/notion";

interface MainHeaderProps {
  viewMode: 'timeline' | 'inbox';
  setViewMode: (mode: 'timeline' | 'inbox') => void;
  inboxCount: number;
  dailyCost: number;
  onSettingsClick: () => void;
  items: ExtendedItineraryItem[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currency: 'JPY' | 'TWD';
  onToggleCurrency: () => void;
}

export const MainHeader = ({
  viewMode,
  setViewMode,
  inboxCount,
  dailyCost,
  onSettingsClick,
  items,
  selectedDate,
  setSelectedDate,
  currency,
  onToggleCurrency
}: MainHeaderProps) => {
  return (
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
                 {inboxCount > 0 && (
                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1" />
                 )}
             </button>
         </div>

        <div className="flex items-center gap-3">
          {viewMode === 'timeline' && (
              <button 
                  onClick={onToggleCurrency}
                  className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 active:scale-95 transition-transform"
              >
                  <Wallet size={14} />
                  <span className="text-xs font-mono font-bold">
                    {currency === 'JPY' 
                        ? `¥${dailyCost.toLocaleString()}` 
                        : `NT$${Math.round(dailyCost / 5).toLocaleString()}`
                    }
                  </span>
              </button>
          )}
          
          <button 
            onClick={onSettingsClick}
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
          {(() => {
              // Computed Dates from Items (Expanded for ranges)
              const scheduledItems = items.filter(i => i.status !== 'Inbox' && i.date);
              const uniqueDates = Array.from(new Set(scheduledItems.flatMap(i => {
                    // Start with the primary date
                    const dates = [i.date];
                    // Expand Range if endDate exists
                    if (i.endDate && i.endDate > i.date) {
                        let current = new Date(i.date);
                        // Start loop from next day
                        current.setDate(current.getDate() + 1);
                        const end = new Date(i.endDate);
                        
                        while (current <= end) {
                            dates.push(current.toISOString().split('T')[0]);
                            current.setDate(current.getDate() + 1);
                        }
                    }
                    return dates;
              }))).sort();
              
              const formatDate = (dateStr: string) => {
                  try {
                    const date = new Date(dateStr);
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()];
                    return { full: dateStr, month: `${month}月`, day: dayOfWeek, label: String(day).padStart(2, '0') };
                  } catch (e) {
                    return { full: dateStr, month: '', day: '', label: '' };
                  }
              };

              const displayDates = uniqueDates.map(formatDate);

              if (displayDates.length === 0) {
                 return (
                     <div className="w-full text-center py-2 text-zinc-600 text-xs font-mono border border-zinc-900 border-dashed rounded bg-zinc-900/10">
                         尚無已排程日期 -&gt; 點擊 + 新增
                     </div>
                 );
              }

              return displayDates.map((date, index) => {
                  const isActive = date.full === selectedDate;
                  const prevDate = displayDates[index - 1];
                  const isNewMonth = !prevDate || date.month !== prevDate.month; // Simple check

                  return (
                  <React.Fragment key={date.full}>
                      {isNewMonth && (
                      <div className="flex flex-col justify-center items-center h-14 min-w-[32px] pl-1 pr-3 border-r border-transparent">
                          <span className="text-xs font-bold text-zinc-500 writing-vertical-rl">{date.month}</span>
                      </div>
                      )}
                      
                      <button
                      onClick={() => setSelectedDate(date.full)}
                      className={`relative flex flex-col items-center justify-center min-w-[50px] h-14 rounded-sm border transition-all ${
                          isActive 
                          ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      >
                      <span className="text-[10px] uppercase font-bold tracking-wide">{date.day}</span>
                      <span className="text-lg font-bold leading-none">{date.label}</span>
                      
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isActive ? 'bg-black' : 'bg-indigo-500'}`} />
                      </button>
                  </React.Fragment>
                  );
              });
          })()}
          </motion.div>
      )}
    </header>
  );
};

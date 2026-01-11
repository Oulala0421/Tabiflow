import React from "react";
import { motion, Variants } from "framer-motion";
import { Coffee, CheckCircle2, Navigation, TrainFront, BedDouble, ArrowRight, Soup } from "lucide-react";
import { ExtendedItineraryItem } from "@/types/notion";
import { getTypeLabel, getStatusColor, parseMinutes } from "@/lib/utils";
import { VisualFallback } from "@/components/VisualFallback";

// Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

interface ItineraryCardProps {
    item: ExtendedItineraryItem;
    prevItem?: ExtendedItineraryItem;
    onClick: (item: ExtendedItineraryItem) => void;
}

export const ItineraryCard = ({ item, prevItem, onClick }: ItineraryCardProps) => {
    // Time Gap Logic
    let showGap = false;
    let gapMinutes = 0;
    
    if (prevItem && prevItem.time !== 'TBD' && item.time !== 'TBD') {
        const prevMins = parseMinutes(prevItem.time);
        const currMins = parseMinutes(item.time);
        gapMinutes = currMins - prevMins;
        // Threshold: 30 mins
        if (gapMinutes > 30) {
            showGap = true;
        }
    }

    return (
        <React.Fragment>
            {showGap && (
                <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-4 py-2 opacity-50"
                >
                    <div className="w-12 text-right">
                            <span className="text-[10px] text-zinc-600 font-mono">+{Math.floor(gapMinutes / 60)}h {gapMinutes % 60}m</span>
                    </div>
                    <div className="flex-1 border-t border-dashed border-zinc-700 flex items-center justify-center relative">
                            <div className="absolute bg-zinc-950 px-2 text-[10px] text-zinc-500 flex items-center gap-1">
                            <Coffee size={10} />
                            自由時間
                            </div>
                    </div>
                </motion.div>
            )}

            <motion.div 
            variants={fadeInUp}
            className="relative flex items-center gap-4 group cursor-pointer"
            onClick={() => onClick(item)}
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
                <VisualFallback item={item} className={`w-full h-full ${item.status === 'Done' ? 'opacity-40 grayscale' : ''}`}>
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
                </VisualFallback>
                </div>
            </div>

            <div className="flex-1 border-b border-zinc-900 pb-6 pt-1 group-last:border-0">
                <div className="flex justify-between items-start">
                    <h3 className={`font-medium text-base transition-colors ${item.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'}`}>{item.title}</h3>
                    {item.cost && item.cost > 0 && (
                        <span className="text-[10px] font-mono text-zinc-600 mt-1">¥{item.cost.toLocaleString()}</span>
                    )}
                </div>

                {/* Rich Details Logic */}
                {item.type === 'transport' && item.transport && (
                     <div className="my-2 p-2 bg-zinc-900/50 rounded border border-zinc-800/50 flex flex-col gap-2">
                        {/* Top Row: Route Info */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-indigo-500/10 text-indigo-400 shrink-0">
                                 <TrainFront size={12} />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-2 text-xs text-zinc-400">
                                 <span className="truncate max-w-[80px]">{item.transport.from}</span>
                                 <ArrowRight size={10} className="text-zinc-600" />
                                 <span className="truncate flex-1 text-zinc-300">{item.transport.to || item.title}</span>
                            </div>
                        </div>

                        {/* Bottom Row: Badges (Mode, Platform, Car, Seat) */}
                        <div className="flex flex-wrap items-center gap-2 pl-9">
                            {item.transport.mode && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 whitespace-nowrap">
                                    {item.transport.mode}
                                </span>
                            )}
                            {(item.transport.platform && item.transport.platform !== '-') && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 border border-zinc-700 whitespace-nowrap">
                                    月台 {item.transport.platform}
                                </span>
                            )}
                             {(item.transport.car && item.transport.car !== '-') && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 border border-zinc-700 whitespace-nowrap">
                                    {item.transport.car} 號車
                                </span>
                            )}
                             {(item.transport.seat && item.transport.seat !== '-') && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300 border border-zinc-700 whitespace-nowrap">
                                    {item.transport.seat}
                                </span>
                            )}
                        </div>
                     </div>
                )}

                {item.type === 'stay' && item.accommodation && (
                    <div className="my-2 p-2 bg-zinc-900/50 rounded border border-zinc-800/50 flex items-center gap-4">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 shrink-0">
                             <BedDouble size={12} />
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                             <div className="flex flex-col">
                                 <span className="text-[9px] text-zinc-600 uppercase">Check-in</span>
                                 <span className="text-zinc-300 font-mono">{item.accommodation.checkIn}</span>
                             </div>
                             <div className="w-[1px] h-4 bg-zinc-800" />
                             <div className="flex items-center gap-2">
                                {item.accommodation.isBreakfastIncluded && (
                                    <div title="含早餐">
                                        <Coffee size={12} className="text-orange-400" />
                                    </div>
                                )}
                                {item.accommodation.isDinnerIncluded && (
                                    <div title="含晚餐">
                                        <Soup size={12} className="text-pink-400" />
                                    </div>
                                )}
                                 {!item.accommodation.isBreakfastIncluded && !item.accommodation.isDinnerIncluded && (
                                     <span className="text-zinc-600">無餐點</span>
                                 )}
                             </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                    {getTypeLabel(item.type)}
                </span>
                {item.area && item.area !== getTypeLabel(item.type) && (
                    <>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{item.area}</span>
                    </>
                )}
                {item.status !== 'Scheduled' && item.status !== 'Done' && (
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${getStatusColor(item.status)} text-white`}>
                        {item.status}
                    </span>
                )}
                </div>
            </div>
            </motion.div>
        </React.Fragment>
    );
};

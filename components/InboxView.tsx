import React from "react";
import { motion } from "framer-motion";
import { Archive, MapPin } from "lucide-react";
import { ExtendedItineraryItem } from "@/types/notion";
import { getTypeLabel } from "@/lib/utils";
import { VisualFallback } from "@/components/VisualFallback";

interface InboxViewProps {
    items: ExtendedItineraryItem[];
    onSelectItem: (item: ExtendedItineraryItem) => void;
}

export const InboxView = ({ items, onSelectItem }: InboxViewProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
        >
            {items.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-zinc-600 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/20">
                    <Archive size={32} className="mb-4 opacity-50" />
                    <p className="text-sm">待定清單是空的</p>
                    <p className="text-xs mt-2">隨手記下想去的地方，之後再排程</p>
                </div>
            ) : (
                items.map(item => (
                        <div 
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="h-32 relative">
                                <VisualFallback item={item} className="w-full h-full" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent pointer-events-none" />
                                <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase bg-zinc-800 border border-zinc-700 text-zinc-300 pointer-events-none">
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
    );
};

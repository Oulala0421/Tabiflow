import React from "react";
import { motion, Variants } from "framer-motion";
import { Navigation } from "lucide-react";
import { ExtendedItineraryItem } from "@/types/notion";
import { getStatusColor } from "@/lib/utils";
import { ItineraryCard } from "@/components/ItineraryCard";
import { VisualFallback } from "@/components/VisualFallback";

// Skeleton Component
export const SkeletonItem = () => (
    <div className="flex items-center gap-4 py-2">
        <div className="w-12 flex flex-col items-end gap-1">
            <div className="h-3 w-8 bg-zinc-900 rounded skeleton-shimmer" />
        </div>
        <div className="relative z-10 flex-shrink-0">
            <div className="w-14 h-14 bg-zinc-900 rounded-sm skeleton-shimmer" />
        </div>
        <div className="flex-1 border-b border-zinc-900 pb-6 pt-1">
             <div className="h-5 w-3/4 bg-zinc-900 rounded mb-2 skeleton-shimmer" />
             <div className="flex gap-2">
                 <div className="h-3 w-16 bg-zinc-900 rounded skeleton-shimmer" />
             </div>
        </div>
    </div>
);

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

interface TimelineViewProps {
  isLoading: boolean;
  heroItem?: ExtendedItineraryItem;
  items: ExtendedItineraryItem[];
  onSelectItem: (item: ExtendedItineraryItem) => void;
}

export const TimelineView = ({ 
  isLoading, 
  heroItem, 
  items, 
  onSelectItem 
}: TimelineViewProps) => {

  if (isLoading) {
    return (
        <div className="space-y-6">
            {/* Hero Skeleton */}
            <div className="w-full aspect-[4/3] bg-zinc-900 rounded-sm skeleton-shimmer" />
            
            {/* List Skeleton */}
            <div className="space-y-6 pl-4 pt-4">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
            </div>
        </div>
    );
  }

  return (
      <>
        {/* Hero Card (Next Up) */}
        {heroItem ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-[4/3] rounded-sm overflow-hidden group cursor-pointer"
            onClick={() => onSelectItem(heroItem)}
        >
            <VisualFallback 
                item={heroItem} 
                className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                iconSize="text-6xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            
            {heroItem.mapsUrl && (
            <div 
                className="absolute bottom-0 right-0 z-20 w-24 h-24 flex items-center justify-center active:bg-white/5 transition-colors cursor-pointer"
                onClick={(e) => {
                e.stopPropagation();
                window.open(heroItem.mapsUrl!, '_blank');
                }}
            >
                <div className="w-16 h-16 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10 hover:bg-black/40 transition-colors pointer-events-auto">
                    <Navigation size={32} className="text-white drop-shadow-md" />
                </div>
            </div>
            )}

            <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end pointer-events-none">
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

        {items.map((item, index) => (
            <ItineraryCard 
                key={item.id} 
                item={item} 
                prevItem={items[index - 1]}
                onClick={onSelectItem}
            />
        ))}
        </motion.div>
      </>
  );
};

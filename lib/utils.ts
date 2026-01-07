import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ItineraryStatus, ItineraryType } from "@/types/notion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper for translation
export const getTypeLabel = (type: string) => {
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

export const getStatusColor = (status: ItineraryStatus) => {
    switch (status) {
        case "Inbox": return "bg-zinc-500";
        case "To Review": return "bg-yellow-500";
        case "Scheduled": return "bg-indigo-500";
        case "Done": return "bg-emerald-500";
        default: return "bg-zinc-500";
    }
};

export const getStatusLabel = (status: ItineraryStatus) => {
    switch (status) {
        case "Inbox": return "待定";
        case "To Review": return "待確認";
        case "Scheduled": return "已排程";
        case "Done": return "已完成";
        default: return status;
    }
};

export const parseMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};
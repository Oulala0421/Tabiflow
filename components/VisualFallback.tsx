import React, { useState } from "react";
import { ItineraryItem, ExtendedItineraryItem } from "@/types/notion";
import { getVisualForItem } from "@/lib/visuals";
import { cn } from "@/lib/utils";

interface VisualFallbackProps {
  item: ExtendedItineraryItem | ItineraryItem;
  className?: string; children?: React.ReactNode;
  iconSize?: string; // e.g. "text-2xl"
}

export const VisualFallback = ({ item, className, children, iconSize = "text-2xl" }: VisualFallbackProps) => {
  const [imgError, setImgError] = useState(false);
  
  // Deterministic visual data
  const { gradient, emoji } = getVisualForItem(item.id, item.type, item.title, item.transport?.mode);

  // Check if we have a valid image URL (and not failed previously)
  // Logic: if coverImage exists AND not errored, try to show it.
  // Note: Some "valid" URLs might be empty strings or "default" placeholders which we might want to skip if we prefer gradients.
  // For now, let's assume non-empty string is an intent to show image.
  const hasImage = item.coverImage && item.coverImage.length > 5 && !imgError;

  return (
    <div className={cn("relative overflow-hidden bg-zinc-800", className)}>
      {hasImage ? (
        <img
          src={item.coverImage}
          alt={item.title}
          className="w-full h-full object-cover transition-opacity"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center", gradient)}>
          <span className={cn("drop-shadow-lg select-none", iconSize)}>
            {emoji}
          </span>
        </div>
      )}
      
      {/* Overlays (Status, etc) passed as children */}
      {children}
    </div>
  );
};

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Undo2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  undoAction?: () => void;
}

export const ToastContext = React.createContext<{
  addToast: (msg: string, type?: ToastType, undo?: () => void) => void;
}>({ addToast: () => {} });

export const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) => {
    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="pointer-events-auto bg-zinc-900 border border-zinc-800 shadow-2xl text-white px-4 py-3 rounded-lg flex items-center gap-3 min-w-[300px] max-w-sm"
                    >
                        {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                        {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
                        {toast.type === 'info' && <Info size={18} className="text-indigo-500" />}
                        
                        <span className="text-sm font-medium flex-1">{toast.message}</span>
                        
                        {toast.undoAction && (
                            <button 
                                onClick={() => {
                                    toast.undoAction!();
                                    removeToast(toast.id);
                                }}
                                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded transition-colors"
                            >
                                <Undo2 size={12} />
                                UNDO
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

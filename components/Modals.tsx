import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Navigation, Github, ExternalLink, Megaphone, Check, Settings, 
  ChevronDown, Trash2, Info, HelpCircle 
} from 'lucide-react';

export const AboutModal = ({ onClose }: { onClose: () => void }) => (
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

export const WelcomeModal = ({ onClose }: { onClose: () => void }) => {
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

export const SettingsModal = ({ 
    onClose, 
    onOpenAnnouncement,
    onOpenAbout,
    onContactSupport
}: { 
    onClose: () => void,
    onOpenAnnouncement: () => void,
    onOpenAbout: () => void,
    onContactSupport: () => void
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
                onClick={onContactSupport}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">聯絡客服</span>
                </div>
            </button>
         </div>
         
         <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 text-center">
            <span className="text-[10px] text-zinc-600 font-mono">Build 2023.10.30-alpha</span>
         </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useAuth } from "../store/context/AuthContext";

interface GlobalAlert {
  id: string;
  message: string;
  status: string;
}

export const GlobalAlertsDisplay = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [closedAlertIds, setClosedAlertIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
        const res = await fetch(`${apiUrl}/api/alerts`);
        if (res.ok) {
          const data = await res.json();
          const activeAlerts = data.filter((a: any) => a.status === "Active");
          setAlerts(activeAlerts);
        }
      } catch (e) {}
    };
    fetchAlerts();
  }, []);

  if (alerts.length === 0 || user?.role === 'admin') return null;

  const activePopupAlert = alerts.find(a => !closedAlertIds.has(a.id));

  const handleClose = (id: string) => {
    setClosedAlertIds(prev => new Set(prev).add(id));
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
      
      <div className="w-full bg-red-600 text-white overflow-hidden py-2.5 relative flex items-center shadow-md">
        <div className="flex-none px-4 font-black uppercase tracking-widest text-[11px] z-10 bg-red-700 h-full flex items-center absolute left-0 shadow-[10px_0_20px_5px_rgba(185,28,28,1)]">
          <AlertCircle size={14} className="inline mr-2" /> IMPORTANT ALERT
        </div>
        <div className="whitespace-nowrap animate-marquee ml-[140px]">
          {alerts.map((a, i) => (
            <span key={a.id} className="mx-10 font-bold text-sm tracking-wide">
              {a.message} {i < alerts.length - 1 && " • "}
            </span>
          ))}
        </div>
      </div>

      {activePopupAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative border-t-8 border-red-500 transform transition-all">
            <button 
              onClick={() => handleClose(activePopupAlert.id)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                Important Alert
              </h3>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-300 leading-relaxed mb-8 px-2">
                {activePopupAlert.message}
              </p>
              <button 
                onClick={() => handleClose(activePopupAlert.id)}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-xl shadow-red-600/20 active:scale-95"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

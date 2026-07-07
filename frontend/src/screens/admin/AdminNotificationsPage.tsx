"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface GlobalAlert {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

export function AdminNotificationsPage() {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      const res = await fetch(`${apiUrl}/api/alerts`);
      if (res.ok) {
        const data = await res.json();
        // sort by newest
        setAlerts(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleTransliterate = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    
    if (val.endsWith(' ')) {
      const words = val.trimEnd().split(' ');
      const lastWord = words[words.length - 1];
      if (/[a-zA-Z]/.test(lastWord)) {
        try {
          const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=ta-t-i0-und&num=1`);
          const data = await res.json();
          if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
            const converted = data[1][0][1][0];
            words[words.length - 1] = converted;
            setNewMessage(words.join(' ') + ' ');
          }
        } catch(e) {}
      }
    }
  };

  const handleCreateAlert = async () => {
    if (!newMessage.trim()) return;
    setIsLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      const res = await fetch(`${apiUrl}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim(), status: "Inactive" })
      });
      if (res.ok) {
        setNewMessage("");
        fetchAlerts();
        Swal.fire({ title: "Success", text: "Alert message added successfully.", icon: "success", confirmButtonColor: "#005c3a" });
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      Swal.fire({ title: "Error", text: "Failed to create alert message.", icon: "error" });
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (alert: GlobalAlert) => {
    const activeCount = alerts.filter(a => a.status === "Active").length;
    
    const newStatus = alert.status === "Active" ? "Inactive" : "Active";
    
    if (newStatus === "Active" && activeCount >= 2) {
      Swal.fire({
        title: "Limit Reached",
        text: "You can only have 2 active alerts at a time. Please deactivate one before activating another.",
        icon: "warning",
        confirmButtonColor: "#005c3a"
      });
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      await fetch(`${apiUrl}/api/alerts/${alert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this alert message?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
        await fetch(`${apiUrl}/api/alerts/${id}`, { method: "DELETE" });
        fetchAlerts();
      } catch (e) {}
    }
  };

  return (
    <AppShell activePage="Notifications">
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Global Notifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Create and manage alert messages for Retailer and Distributor dashboards.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            New Alert Message (Type in Tanglish to auto-convert to Tamil)
          </label>
          <textarea 
            value={newMessage}
            onChange={handleTransliterate}
            placeholder="Type your message here..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#005c3a]"
            rows={4}
          />
          <button 
            onClick={handleCreateAlert}
            disabled={isLoading || !newMessage.trim()}
            className="self-end px-6 py-2.5 bg-[#005c3a] text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[#004d30] disabled:opacity-60 flex items-center gap-2"
          >
            <Plus size={18} />
            {isLoading ? "Saving..." : "Add Alert"}
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase">
            Saved Alert Messages
          </h2>
          
          {alerts.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-400">
              No alert messages saved.
            </div>
          ) : (
            <div className="grid gap-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-2xl border ${alert.status === "Active" ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.status === "Active" ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <AlertCircle size={12} /> Inactive
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm ${alert.status === "Active" ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                      {alert.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleToggleStatus(alert)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${alert.status === "Active" ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      {alert.status === "Active" ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Check, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../store/context/AuthContext';

interface ServiceMessage {
  id: string;
  serviceId: string;
  message: string;
  status: string;
  createdAt: string;
}

export const ServiceMessageManager = ({ serviceId, serviceName }: { serviceId: string, serviceName: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      const res = await fetch(`${apiUrl}/api/service-messages/${serviceId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMessages();
  }, [serviceId]);

  const handleTransliterate = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    
    // Simple naive transliteration trigger on space
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

  const handleSave = async () => {
    if (!newMessage.trim()) return;
    setIsLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      const res = await fetch(`${apiUrl}/api/service-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, message: newMessage.trim(), status: "Inactive" })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch(e) {}
    setIsLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    
    // If activating, we might want to deactivate others, but let backend or just UI handle it
    // Actually we'll just deactivate all others in UI and send requests
    if (newStatus === "Active") {
      for (const msg of messages) {
        if (msg.id !== id && msg.status === "Active") {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
          await fetch(`${apiUrl}/api/service-messages/${msg.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Inactive" })
          });
        }
      }
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      await fetch(`${apiUrl}/api/service-messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchMessages();
    } catch(e) {}
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      await fetch(`${apiUrl}/api/service-messages/${id}`, { method: "DELETE" });
      fetchMessages();
    } catch(e) {}
  };

  const activeMessage = messages.find(m => m.status === "Active");

  return (
    <>
      <div className="flex flex-col gap-2 mb-6">
        {activeMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
            <p className="text-red-600 dark:text-red-400 font-bold text-sm text-center">
              {activeMessage.message}
            </p>
          </div>
        )}
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline self-end flex items-center gap-1"
          >
            <Pencil size={12} /> Manage Service Alert Messages
          </button>
        )}
      </div>

      {isOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Manage Messages for {serviceName}
            </h3>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase">Add New Message (Type in Tanglish for Tamil)</label>
              <textarea 
                value={newMessage}
                onChange={handleTransliterate}
                placeholder="Type here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button 
                onClick={handleSave}
                disabled={isLoading || !newMessage.trim()}
                className="self-end px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Message'}
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Saved Messages</h4>
              {messages.length === 0 && <p className="text-sm text-slate-400">No messages saved.</p>}
              
              {messages.map(msg => (
                <div key={msg.id} className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${msg.status === 'Active' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <p className={`text-sm flex-1 ${msg.status === 'Active' ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {msg.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggle(msg.id, msg.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${msg.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      {msg.status === 'Active' ? 'Active' : 'Set Active'}
                    </button>
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

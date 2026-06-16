"use client";

import { useState, useEffect } from "react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "eseva-admin-2024";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function AdminPage() {
  const [state, setState] = useState<string>("unknown");
  const [publicIP, setPublicIP] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  const headers = { "X-Admin-Key": ADMIN_KEY, "Content-Type": "application/json" };

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/ec2/status`, { headers });
      const data = await res.json();
      setState(data.state || "unknown");
      setPublicIP(data.public_ip || "");
    } catch {
      setState("unreachable");
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleStart() {
    setLoading(true);
    setLog("Starting instance... (may take ~30s)");
    try {
      const res = await fetch(`${API_BASE}/api/admin/ec2/start`, { method: "POST", headers });
      const data = await res.json();
      setState("running");
      setPublicIP(data.public_ip || "");
      setLog(`Started! New IP: ${data.public_ip}`);
    } catch (e: any) {
      setLog(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  async function handleStop() {
    setLoading(true);
    setLog("Stopping instance...");
    try {
      await fetch(`${API_BASE}/api/admin/ec2/stop`, { method: "POST", headers });
      setState("stopped");
      setPublicIP("");
      setLog("Instance stopped.");
    } catch (e: any) {
      setLog(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  const stateColor =
    state === "running" ? "text-green-400" :
    state === "stopped" ? "text-red-400" :
    "text-yellow-400";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-700">
        <h1 className="text-xl font-bold text-white mb-6">EC2 Admin Panel</h1>

        <div className="mb-4 space-y-1">
          <p className="text-slate-400 text-sm">Status: <span className={`font-semibold ${stateColor}`}>{state}</span></p>
          {publicIP && <p className="text-slate-400 text-sm">IP: <span className="text-white font-mono">{publicIP}:8080</span></p>}
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleStart}
            disabled={loading || state === "running"}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold py-2 rounded-lg transition"
          >
            Start
          </button>
          <button
            onClick={handleStop}
            disabled={loading || state === "stopped"}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-2 rounded-lg transition"
          >
            Stop
          </button>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 bg-slate-600 hover:bg-slate-500 disabled:opacity-40 text-white rounded-lg transition"
          >
            ↻
          </button>
        </div>

        {log && <p className="text-slate-300 text-xs bg-slate-900 rounded p-2">{log}</p>}
      </div>
    </div>
  );
}

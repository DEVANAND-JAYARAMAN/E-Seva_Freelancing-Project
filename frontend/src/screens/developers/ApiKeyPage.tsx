"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, RefreshCw, Save } from "lucide-react";
import Swal from "sweetalert2";
import { AppShell } from "../../layouts/AppShell";
import { apiUrl, authFetch } from "../../utils/apiBase";
import { API_BASE_URL } from "../../config/apiDocs";

export function ApiKeyPage() {
  const [apiKey, setApiKey] = useState("");
  const [whitelist, setWhitelist] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(apiUrl("developers/api-key"), {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApiKey(String(data.apiKey || ""));
        const list = Array.isArray(data.whitelist) ? data.whitelist : [];
        const padded = [...list.map(String), "", "", "", "", ""].slice(0, 5);
        setWhitelist(padded);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const copyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      await Swal.fire({
        icon: "success",
        title: "Copied",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({ icon: "error", title: "Copy failed" });
    }
  };

  const generateKey = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Generate new API key?",
      text: "Old key will stop working immediately.",
      showCancelButton: true,
      confirmButtonText: "Generate",
      confirmButtonColor: "#0f766e",
    });
    if (!confirm.isConfirmed) return;
    setGenerating(true);
    try {
      const res = await authFetch(apiUrl("developers/api-key/generate"), {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Could not generate key",
        });
        return;
      }
      setApiKey(String(data.apiKey || ""));
      await Swal.fire({
        icon: "success",
        title: "New key ready",
        timer: 1400,
        showConfirmButton: false,
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveWhitelist = async () => {
    setSaving(true);
    try {
      const res = await authFetch(apiUrl("developers/api-key/whitelist"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whitelist }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Save failed",
          text: data.error || "Could not save whitelist",
        });
        return;
      }
      const list = Array.isArray(data.whitelist) ? data.whitelist : [];
      setWhitelist([...list.map(String), "", "", "", "", ""].slice(0, 5));
      await Swal.fire({
        icon: "success",
        title: "Whitelist saved",
        timer: 1200,
        showConfirmButton: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activePage="API Key">
      <section className="flex flex-col gap-6 w-full max-w-4xl">
        <header className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            API Key
          </h1>
          <p className="text-base font-medium text-slate-600 dark:text-slate-300">
            Base URL:{" "}
            <code className="font-bold text-teal-700 dark:text-teal-300">
              {API_BASE_URL}
            </code>
          </p>
        </header>

        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="text-teal-700" size={20} />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Your API Key
            </h2>
          </div>

          {loading ? (
            <p className="text-sm font-semibold text-slate-500">Loading…</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <code className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 break-all min-h-[3rem]">
                {apiKey || "No key yet — generate one"}
              </code>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyKey}
                  disabled={!apiKey}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <Copy size={16} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={generateKey}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-sm font-extrabold disabled:opacity-60"
                >
                  <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
                  Generate New Key
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] p-5 sm:p-6 shadow-md space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              IP Whitelist
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Maximum 5 IP addresses allowed
            </p>
          </div>
          <div className="grid gap-3">
            {whitelist.map((ip, idx) => (
              <label key={idx} className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  IP Address {idx + 1}
                </span>
                <input
                  value={ip}
                  onChange={(e) => {
                    const next = [...whitelist];
                    next[idx] = e.target.value;
                    setWhitelist(next);
                  }}
                  placeholder="e.g. 49.37.12.10"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveWhitelist}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-extrabold disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Whitelist"}
            </button>
          </div>
        </article>
      </section>
    </AppShell>
  );
}

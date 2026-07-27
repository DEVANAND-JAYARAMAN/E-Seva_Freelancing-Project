"use client";

import { useMemo, useState } from "react";
import { BookOpen, KeyRound, Shield } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  API_BASE_URL,
  apiDocNav,
  apiDocs,
  type ApiDocSection,
} from "../../config/apiDocs";

export function ApiDocsPage() {
  const [active, setActive] = useState<ApiDocSection>("overview");
  const doc = apiDocs[active];

  const groups = useMemo(() => {
    const intro = apiDocNav.filter((n) => n.group === "INTRODUCTION");
    const endpoints = apiDocNav.filter((n) => n.group === "ENDPOINTS");
    return { intro, endpoints };
  }, []);

  return (
    <AppShell activePage="API Documentation">
      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 w-full min-h-[70vh]">
        <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-4 sm:p-5 shadow-lg">
          <div className="mb-5">
            <p className="text-lg font-black tracking-tight">Thuruvan API</p>
            <p className="text-xs font-semibold text-slate-300 mt-1">Docs v1.0</p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Introduction
              </p>
              <div className="space-y-1">
                {groups.intro.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                      active === item.id
                        ? "bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/40"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Endpoints
              </p>
              <div className="space-y-1">
                {groups.endpoints.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                      active === item.id
                        ? "bg-teal-500/25 text-teal-200 ring-1 ring-teal-400/40"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] p-5 sm:p-8 shadow-md space-y-6">
          <header className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-teal-800 dark:text-teal-300">
              <BookOpen size={14} />
              Developer Docs
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {doc.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
              {doc.summary}
            </p>
          </header>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 p-4 sm:p-5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Base URL
            </p>
            <code className="text-sm sm:text-base font-bold text-emerald-300 break-all">
              {API_BASE_URL}
            </code>
          </div>

          {doc.method && doc.path && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-sky-600 text-white text-xs font-black px-2.5 py-1">
                {doc.method}
              </span>
              <code className="text-sm font-bold text-slate-800 dark:text-slate-100 break-all">
                {API_BASE_URL}
                {doc.path}
              </code>
            </div>
          )}

          {doc.notes && doc.notes.length > 0 && (
            <ul className="grid sm:grid-cols-3 gap-3">
              {doc.notes.map((n) => (
                <li
                  key={n}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {n}
                </li>
              ))}
            </ul>
          )}

          {doc.requestExample && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={16} className="text-teal-700" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Request example
                </h2>
              </div>
              <pre className="rounded-2xl bg-slate-950 text-emerald-200 text-xs sm:text-sm p-4 overflow-x-auto font-mono leading-relaxed">
                {doc.requestExample}
              </pre>
            </div>
          )}

          {doc.responseExample && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-teal-700" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Response example
                </h2>
              </div>
              <pre className="rounded-2xl bg-slate-950 text-sky-200 text-xs sm:text-sm p-4 overflow-x-auto font-mono leading-relaxed">
                {doc.responseExample}
              </pre>
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}

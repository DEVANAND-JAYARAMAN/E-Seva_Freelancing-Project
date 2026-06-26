"use client";

import React, { useState, useEffect } from "react";


export function BackendHealthChecker({ children }: { children: React.ReactNode }) {
  const [isBackendUp, setIsBackendUp] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const lambdaUrl = (process.env.NEXT_PUBLIC_LAMBDA_URL || "").replace(/\/+$/, "");
        if (!lambdaUrl) return; // Fallback if no lambda url
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${lambdaUrl}/ip`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          // If public_ip is empty, the EC2 instance is off
          if (!data.public_ip) {
            setIsBackendUp(false);
          } else {
            setIsBackendUp(true);
          }
        }
      } catch {
        // Ignore client-side network errors to prevent false positives
      }
    };

    // Initial check
    checkHealth();
    interval = setInterval(checkHealth, 45000); // Check every 45s
    return () => clearInterval(interval);
  }, []);

  if (!isBackendUp) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-700 animate-in zoom-in duration-500">
          <div className="w-24 h-24 mx-auto mb-6 text-indigo-500 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.492-3.053c.217-.266.388-.58.487-.912.099-.332.128-.687.086-1.037L12.5 5.25a3.75 3.75 0 00-6.182-2.123L2.25 7.25a3.75 3.75 0 002.123 6.182l4.919.986c.35.042.705.013 1.037-.086.332-.099.646-.27.912-.487l3.053-2.492z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.008v.008H15V12z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Temporarily Under Maintenance</h2>
          <p className="text-slate-300 mb-6">
            We are temporarily unable to connect to the server. You cannot use the site at this moment. It will be active tomorrow morning.
          </p>
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
            <span className="text-indigo-400 text-sm font-medium">Waiting for server...</span>
          </div>

          <div className="pt-4 border-t border-slate-700">
             <a href="/admin" className="text-xs text-slate-400 hover:text-white transition underline">
               Go to Server Admin Panel
             </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

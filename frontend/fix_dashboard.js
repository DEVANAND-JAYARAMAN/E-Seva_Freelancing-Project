const fs = require('fs');
let code = fs.readFileSync('src/screens/dashboard/DashboardPage2.tsx', 'utf8');

// 1. Remove mock notifications and Wallet request modal state
code = code.replace(/const \[showRequestModal, setShowRequestModal\] = useState\(false\);\n  const \[requestAmount, setRequestAmount\] = useState\(\"\"\);\n  const \[requestUtr, setRequestUtr\] = useState\(\"\"\);\n\n  const \[notifications, setNotifications\] = useState<string\[\]>\(\[\n    \"Your wallet request for ₹2500 has been approved\.\",\n    \"System Alert: PAN Card verification server speed optimized\.\",\n  \]\);/g, '');

code = code.replace(/const handleWalletRequest =.*?setRequestUtr\(\"\"\);\n  };\n/s, '');

// 2. Change transactions to allRequests and calculate stats dynamically
code = code.replace(/const \[transactions, setTransactions\] = useState<any\[\]>\(\[\]\);/g, 'const [allRequests, setAllRequests] = useState<any[]>([]);');

code = code.replace(/const dataArray = Array\.isArray\(data\) \? data : \[\];\n        const sorted = dataArray\.sort\(\(a: any, b: any\) => \n          new Date\(b\.createdDate \|\| \"\"\)\.getTime\(\) - new Date\(a\.createdDate \|\| \"\"\)\.getTime\(\)\n        \)\.slice\(0, 5\); \/\/ top 5 recent\n        setTransactions\(sorted\);/g, 'const dataArray = Array.isArray(data) ? data : [];\n        setAllRequests(dataArray);');

code = code.replace(/return \(/g, `  const pendingCount = allRequests.filter(r => r.status === "Pending").length;
  const rejectedCount = allRequests.filter(r => r.status === "Rejected").length;
  const approvedCount = allRequests.filter(r => r.status === "Approved" || r.status === "Completed").length;
  const totalCount = allRequests.length;

  const recentTransactions = [...allRequests].sort((a: any, b: any) => 
    new Date(b.createdDate || "").getTime() - new Date(a.createdDate || "").getTime()
  ).slice(0, 5);

  return (`);

code = code.replace(/transactions\.length === 0/g, 'recentTransactions.length === 0');
code = code.replace(/transactions\.map\(\(txn\)/g, 'recentTransactions.map((txn)');

// 3. Delete INPROCESS, RESUBMIT, WALLET REQUEST cards and replace static values in others
const cardsSectionRegex = /\{\/\* Card 1: PENDING \*\/\}.*?\{\/\* Notifications Ribbon Alert \*\/\}/s;
const newCardsSection = `{/* Card 1: PENDING */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pending
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                {pendingCount}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Awaiting Verification
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </span>
          </article>

          {/* Card 4: REJECTED */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Rejected
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                {rejectedCount}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Declined Submissions
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
              <XCircle size={18} />
            </span>
          </article>

          {/* Card 5: APPROVED */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Approved
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                {approvedCount}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Completed Requests
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
              <CheckCircle size={18} />
            </span>
          </article>

          {/* Card 6: WALLET */}
          <article
            className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                ₹
                {user?.walletBalance !== undefined
                  ? Number(user.walletBalance).toFixed(2)
                  : "0.00"}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Available balance
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
              <Wallet size={18} />
            </span>
          </article>

          {/* Card 8: TOTAL APPLICATIONS */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Applications
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                {totalCount}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Total Submitted
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-655 dark:text-blue-400">
              <Users size={18} />
            </span>
          </article>

          {/* Card 9: RETAILERS (Only for Distributor) */}
          {user?.role === "distributor" && (
            <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Retailers
                </p>
                <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                  Active
                </strong>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                  Network Partners
                </span>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
                <Store size={18} />
              </span>
            </article>
          )}
        </section>

        {/* Notifications Ribbon Alert */}`;

code = code.replace(cardsSectionRegex, newCardsSection);

// 4. Remove Notifications Ribbon
code = code.replace(/\{\/\* Notifications Ribbon Alert \*\/\}[\s\S]*?\{\/\* Our Services Status Table section \*\/\}/s, '{/* Our Services Status Table section */}');

// 5. Remove Modal Dialog at the bottom
code = code.replace(/\{\/\* Modal Dialog: Load Funds \/ Wallet Request \*\/\}[\s\S]*?\<\/div\>\n    \<\/AppShell\>/s, '      </div>\n    </AppShell>');

fs.writeFileSync('src/screens/dashboard/DashboardPage2.tsx', code);
console.log('Fixed Dashboard UI');

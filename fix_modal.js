const fs = require('fs');
let code = fs.readFileSync('frontend/src/status/StatusDetailModal.tsx', 'utf8');

// 1. Make the container full screen and landscape
code = code.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-\[#04080f\] animate-fadeIn overflow-y-auto">/g, 
'<div className="fixed inset-0 z-50 flex bg-slate-50 dark:bg-[#04080f] animate-fadeIn">');

code = code.replace(/<div className="relative w-full min-h-screen max-w-5xl mx-auto bg-white dark:bg-\[#090d16\] sm:border-x border-slate-100 dark:border-slate-900\/60 shadow-2xl flex flex-col">/g, 
'<div className="relative w-full h-full bg-white dark:bg-[#090d16] shadow-2xl flex flex-col overflow-hidden">');

// 2. Make the header sticky
code = code.replace(/<div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-900\/40 shrink-0">/g, 
'<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-900/60 shrink-0 bg-white dark:bg-[#090d16] z-10">');

// 3. Make layout landscape friendly
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-8">/g, 
'<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">');

code = code.replace(/\{\/\* Left Column: Details \*\/\}\s*<div className="space-y-6">/g, 
'{/* Left Column: Details */}\n            <div className="space-y-6 lg:col-span-2">');

code = code.replace(/\{\/\* Right Column: Actions & Form Data \*\/\}\s*<div className="space-y-6">/g, 
'{/* Right Column: Actions & Form Data */}\n        <div className="space-y-6 lg:col-span-1">');

// 4. Fix image preview modal close button
code = code.replace(/className="absolute top-4 right-4 sm:-right-12 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white\/10 hover:bg-white\/20 text-white backdrop-blur-sm transition-colors"/g, 
'className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 hover:bg-red-500 text-white backdrop-blur-md transition-colors shadow-2xl z-[110]"');

// Wait! "images ah view panum pothu antha images ellam oru container la display agara mari vaii antha container ku oru close button vai because epo oru puthu tab la image open aguthu soo close pana total tab ye close panra mari irruku"
// The user says it opens in a NEW TAB currently.
// Let's check how the Eye button is implemented:
code = code.replace(/<a\s*href=\{fullUrl\}\s*target="_blank"\s*rel="noopener noreferrer"/g, '<button type="button" onClick={() => setPreviewImage(fullUrl)}');

// Also need to change the closing tag of that Eye button from </a> to </button>
code = code.replace(/<Eye size=\{14\} \/>\s*<\/a>/g, '<Eye size={14} />\n                          </button>');


fs.writeFileSync('frontend/src/status/StatusDetailModal.tsx', code);
console.log('Fixed StatusDetailModal');

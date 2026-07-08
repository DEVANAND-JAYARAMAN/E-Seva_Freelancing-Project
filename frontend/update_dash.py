import re

with open('src/screens/dashboard/DashboardPage2.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change card styles
content = content.replace(
    "bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60",
    "bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white"
)

# 2. Extract Wallet Card and move it to the top.
wallet_pattern = r"(          \{\/\* Card 6: WALLET \*\/\}\n          <article.*?</article>\n)"
wallet_match = re.search(wallet_pattern, content, flags=re.DOTALL)

if wallet_match:
    wallet_html = wallet_match.group(1)
    content = content.replace(wallet_html, "")
    insert_pattern = r'(aria-label="Partner stats"\s*>\s*)'
    content = re.sub(insert_pattern, r'\1\n' + wallet_html, content)

with open('src/screens/dashboard/DashboardPage2.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

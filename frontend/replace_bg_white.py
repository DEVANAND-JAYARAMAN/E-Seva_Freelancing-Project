import os
import re

base_dir = r'd:\TCG TECHNOLOGY CLIENTS\Eservice\frontend\src'

# Regex pattern: look for "bg-white", but NOT followed by a forward slash (to avoid bg-white/20, etc.)
# We also want to ensure it's matched as a word boundary so we don't accidentally match something like "hover:bg-white" and replace it to "hover:bg-slate-50"? Actually "hover:bg-slate-50" is valid.
# What about "dark:bg-white"? "dark:bg-slate-50" is valid too.
# So `(?<!-)bg-white(?!\/)` would match "bg-white", "hover:bg-white", "dark:bg-white".
# Let's just use `\bbg-white(?!\/)`

pattern = re.compile(r'\bbg-white(?!\/)')

count = 0
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub('bg-slate-50', content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {path}")

print(f"Total files updated: {count}")

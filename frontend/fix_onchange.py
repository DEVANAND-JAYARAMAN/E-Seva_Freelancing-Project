import os
import re

directory = r"d:\TCG TECHNOLOGY CLIENTS\Eservice\frontend\src\screens\services"

pattern = re.compile(r'onChange=\{\(val\) => handleFieldChange\("([^"]+)", val\)\}')
replacement = r'onChange={(val, file) => handleFieldChange("\1", val, file)}'

count = 0
for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith(".tsx"):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub(replacement, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
                count += 1

print(f"Total files updated: {count}")

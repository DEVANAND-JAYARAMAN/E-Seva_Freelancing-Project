import os
import re

directory = r"d:\TCG TECHNOLOGY CLIENTS\Eservice\frontend\src\screens\services"

pattern1 = re.compile(r'handleFieldChange = \(name: string, value: string\) => \{')
replacement1 = r'handleFieldChange = (name: string, value: string, file?: File) => {'

pattern2 = re.compile(r'handleFieldChange = \(field: string, val: string\) => \{')
replacement2 = r'handleFieldChange = (field: string, val: string, file?: File) => {'

pattern3 = re.compile(r'handleFieldChange = \(name: string, value: any\) => \{')
replacement3 = r'handleFieldChange = (name: string, value: any, file?: File) => {'

count = 0
for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith(".tsx"):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern1.sub(replacement1, content)
            new_content = pattern2.sub(replacement2, new_content)
            new_content = pattern3.sub(replacement3, new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
                count += 1

print(f"Total files updated: {count}")

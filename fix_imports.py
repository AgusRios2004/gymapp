import os
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp'

java_files = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.java'):
            java_files.append(os.path.join(root, f))

for f in java_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove old package imports that don't point to modules
    # com.aplicacionGym.gymapp.(something_not_modules)
    new_content = re.sub(r'^import\s+com\.aplicacionGym\.gymapp\.(?!modules)[a-zA-Z0-9_]+\.[a-zA-Z0-9_\.\*]+;\s*$', '', content, flags=re.MULTILINE)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)

print("Import fixing completed.")

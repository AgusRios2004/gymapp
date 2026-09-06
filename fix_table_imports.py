import os

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules'

files_to_fix = [
    'core/entity/Professor.java',
    'core/entity/Administrator.java',
    'payments/entity/MonthlyType.java'
]

for f in files_to_fix:
    path = os.path.join(src_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'jakarta.persistence.Table' not in content:
        content = content.replace('jakarta.persistence.Entity;', 'jakarta.persistence.Entity;\nimport jakarta.persistence.Table;')
    
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)

print("Imports fixed.")

import os
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules'

prefixes = {
    'payments': 'pay_',
    'routines': 'rout_',
    'attendance': 'att_',
    'clients': 'cli_',
    'core': 'core_'
}

# we need to find all entities and add/update @Table(name="<prefix><classname_snake_case>")

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.java'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Check if it has @Entity
            if '@Entity' in content:
                class_name_match = re.search(r'public\s+class\s+(\w+)', content)
                if not class_name_match:
                    continue
                class_name = class_name_match.group(1)
                
                # Determine module from path
                # gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/<mod>/...
                rel_path = os.path.relpath(file_path, src_dir)
                mod = rel_path.split(os.sep)[0]
                prefix = prefixes.get(mod, '')
                
                table_name = prefix + camel_to_snake(class_name)
                
                # Replace or add @Table
                if '@Table' in content:
                    content = re.sub(r'@Table\s*\([^)]*\)', f'@Table(name="{table_name}")', content)
                else:
                    content = re.sub(r'(@Entity)', rf'\1\n@Table(name="{table_name}")', content)
                
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(content)

print("Entities updated with @Table.")

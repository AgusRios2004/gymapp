import os
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules'

modules = ['payments', 'routines', 'attendance']

for mod in modules:
    mod_dir = os.path.join(src_dir, mod)
    if not os.path.exists(mod_dir):
        continue
        
    for root, dirs, files in os.walk(mod_dir):
        for f in files:
            if f.endswith('.java'):
                file_path = os.path.join(root, f)
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Check if it has @RestController or @Service
                if re.search(r'@(RestController|Service)\b', content):
                    if '@ConditionalOnProperty' not in content:
                        # add import
                        import_str = "import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;\n"
                        # insert import after package
                        content = re.sub(r'^(package\s+[\w\.]+;)', r'\1\n\n' + import_str, content, flags=re.MULTILINE)
                        
                        # add annotation before class definition
                        annotation_str = f'@ConditionalOnProperty(name = "gym.modules.{mod}.enabled", havingValue = "true")\n'
                        # Find the class definition and insert annotation above it
                        # Since it could have @RestController, @Service, @RequestMapping etc. we just insert it right before `public class`
                        content = re.sub(r'^(public\s+class\s+)', annotation_str + r'\1', content, flags=re.MULTILINE)
                        
                        with open(file_path, 'w', encoding='utf-8') as file:
                            file.write(content)

print("Conditionals added.")

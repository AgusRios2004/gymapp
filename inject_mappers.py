import re

files_to_update = {
    'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/attendance/service/AssistanceService.java': ('AssistanceMapper', 'assistanceMapper', False),
    'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/payments/service/PaymentService.java': ('PaymentMapper', 'paymentMapper', True),
    'gymapp-back/src/main/java/com/aplicacionGym/gymapp/modules/core/service/AdministratorService.java': ('AdministratorMapper', 'administratorMapper', False)
}

for path, (mapper_class, mapper_var, is_required_args) in files_to_update.items():
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if mapper is already injected
    if f'{mapper_class} {mapper_var}' not in content:
        # inject mapper
        if is_required_args:
            # find last `private final`
            matches = list(re.finditer(r'private\s+final\s+\w+\s+\w+;', content))
            if matches:
                last_match = matches[-1]
                insert_pos = last_match.end()
                content = content[:insert_pos] + f'\n    private final {mapper_class} {mapper_var};' + content[insert_pos:]
        else:
            # find last `@Autowired` block
            matches = list(re.finditer(r'@Autowired\s+private\s+\w+\s+\w+;', content))
            if matches:
                last_match = matches[-1]
                insert_pos = last_match.end()
                content = content[:insert_pos] + f'\n    @Autowired\n    private {mapper_class} {mapper_var};' + content[insert_pos:]
            
    # replace static calls
    content = content.replace(f'{mapper_class}.toDTO', f'{mapper_var}.toDTO')
    content = content.replace(f'{mapper_class}.toEntity', f'{mapper_var}.toEntity')
    content = content.replace(f'{mapper_class}::toDTO', f'{mapper_var}::toDTO')
    content = content.replace(f'{mapper_class}::toEntity', f'{mapper_var}::toEntity')
    
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)

print("Services updated.")

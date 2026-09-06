import os
import shutil
import re

src_dir = 'gymapp-back/src/main/java/com/aplicacionGym/gymapp'
base_pkg = 'com.aplicacionGym.gymapp'

modules = {
    'core': [
        'config', 'security', 'exception', 'GymappApplication',
        'AuthController', 'AuthService', 'LoginRequestDTO', 'LoginResponseDTO',
        'Administrator', 'AdministratorController', 'AdministratorService', 'AdministratorRepository', 'AdministratorMapper', 'AdministratorRequestDTO', 'AdministratorResponseDTO',
        'Person', 'PersonRepository',
        'BusinessRuleValidationService', 'ScheduledJobsService', 'TransactionRunner', 'MessagingService', 'VersioningService', 'ReportService', 'DashboardService', 'DashboardController', 'DashboardStatsDTO',
        'WebApiResponse', 'WebApiResponseBuilder',
        'Professor', 'ProfessorController', 'ProfessorService', 'ProfessorRepository',
        'GlobalExceptionHandler', 'CustomUserDetailsService', 'JwtAuthenticationFilter', 'JwtUtil', 'RateLimiterService', 'DataLoader', 'SecurityConfig'
    ],
    'clients': [
        'Client', 'ClientController', 'ClientService', 'ClientRepository', 'ClientMapper', 'ClientRequestDTO', 'ClientResponseDTO',
        'ClientSchedule', 'ClientScheduleRepository', 'ClientScheduleMapDTO',
        'PhysicalRecord', 'PhysicalRecordRepository', 'PhysicalRecordService'
    ],
    'routines': [
        'Routine', 'RoutineController', 'RoutineService', 'RoutineRepository', 'RoutineMapper', 'RoutineRequestDTO', 'RoutineResponseDTO', 'RoutineSummaryResponseDTO', 'AssignRoutineRequestDTO',
        'Exercise', 'ExerciseController', 'ExerciseService', 'ExerciseRepository',
        'RoutineExercise', 'RoutineExerciseRepository', 'RoutineExerciseRequestDTO', 'RoutineExerciseResponseDTO',
        'RoutineDay', 'RoutineDayRepository', 'RoutineDayRequestDTO', 'RoutineDayResponseDTO',
        'ClientRoutine', 'ClientRoutineRepository',
        'ExerciseLog', 'ExerciseLogRepository', 'ExerciseLogService'
    ],
    'payments': [
        'Payment', 'PaymentController', 'PaymentService', 'PaymentRepository', 'PaymentMapper', 'PaymentResponseDTO', 'PaymentType',
        'MonthlyType', 'MonthlyTypeController', 'MonthlyTypeService', 'MonthlyTypeRepository', 'MonthlyPaymentRequestDTO',
        'Product', 'ProductController', 'ProductService', 'ProductRepository', 'ProductDetailRequestDTO', 'ProductPaymentRequestDTO',
        'PaymentProduct', 'PaymentProductRepository', 'PaymentProductResponseDTO', 'ProductsPurchasedResponseDTO'
    ],
    'attendance': [
        'Assistance', 'AssistanceController', 'AssistanceService', 'AssistanceRepository', 'AssistanceMapper', 'AssistanceRequestDTO', 'AssistanceResponseDTO',
        'GroupClass', 'GroupClassRepository', 'GroupClassService', 'GroupClassController'
    ]
}

def get_module(file_path, file_name):
    if 'config/' in file_path or 'security/' in file_path or 'exception/' in file_path:
        return 'core'
    class_name = file_name.replace('.java', '')
    for mod, classes in modules.items():
        if class_name in classes:
            return mod
        for c in classes:
            if c == class_name:
                return mod
    
    # Defaults based on name
    if 'Client' in class_name or 'PhysicalRecord' in class_name: return 'clients'
    if 'Routine' in class_name or 'Exercise' in class_name: return 'routines'
    if 'Payment' in class_name or 'Product' in class_name or 'Monthly' in class_name: return 'payments'
    if 'Assist' in class_name or 'GroupClass' in class_name: return 'attendance'
    if 'Admin' in class_name or 'Person' in class_name or 'Professor' in class_name: return 'core'
    
    return 'core'

java_files = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.java'):
            java_files.append(os.path.join(root, f))

class_to_new_pkg = {}
file_to_new_path = {}

for f in java_files:
    file_name = os.path.basename(f)
    class_name = file_name.replace('.java', '')
    rel_path = os.path.relpath(f, src_dir)
    
    if class_name == 'GymappApplication':
        class_to_new_pkg[class_name] = f"{base_pkg}"
        file_to_new_path[f] = f
        continue
    
    mod = get_module(rel_path, file_name)
    old_subpkg = ''
    if '/' in rel_path:
        old_subpkg = os.path.dirname(rel_path).replace('/', '.')
        
    new_pkg = f"{base_pkg}.modules.{mod}"
    if old_subpkg:
        new_pkg = f"{new_pkg}.{old_subpkg}"
        
    class_to_new_pkg[class_name] = new_pkg
    new_dir = os.path.join(src_dir, 'modules', mod, os.path.dirname(rel_path))
    new_path = os.path.join(new_dir, file_name)
    file_to_new_path[f] = new_path

for old_path, new_path in file_to_new_path.items():
    if old_path == new_path: continue
    os.makedirs(os.path.dirname(new_path), exist_ok=True)
    with open(old_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    class_name = os.path.basename(old_path).replace('.java', '')
    new_pkg = class_to_new_pkg[class_name]
    
    content = re.sub(r'^package\s+[\w\.]+;', f"package {new_pkg};", content, flags=re.MULTILINE)
    
    # Remove old imports from the same base project that might be broken
    content = re.sub(r'^import\s+com\.aplicacionGym\.gymapp\.[a-zA-Z0-9_\.]+\.([a-zA-Z0-9_]+);\s*$', r'/* old import \1 */', content, flags=re.MULTILINE)
    
    # We will just add new imports for EVERY class found in the file, if it's in a different package
    # Simple word boundary regex to find words starting with capital letter
    words = set(re.findall(r'\b[A-Z][a-zA-Z0-9_]+\b', content))
    
    imports_to_add = set()
    for w in words:
        if w in class_to_new_pkg and w != class_name:
            target_pkg = class_to_new_pkg[w]
            if target_pkg != new_pkg:
                imports_to_add.add(f"import {target_pkg}.{w};")
    
    # Re-insert imports after the package declaration
    if imports_to_add:
        # find package
        pkg_match = re.search(r'^package\s+[\w\.]+;', content, flags=re.MULTILINE)
        if pkg_match:
            insert_pos = pkg_match.end()
            imports_str = "\n\n" + "\n".join(sorted(list(imports_to_add)))
            content = content[:insert_pos] + imports_str + content[insert_pos:]
    
    # Clean up the commented old imports to avoid clutter
    content = re.sub(r'/\* old import [a-zA-Z0-9_]+ \*/\n?', '', content)

    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)
    os.remove(old_path)

for root, dirs, files in os.walk(src_dir, topdown=False):
    for d in dirs:
        dir_path = os.path.join(root, d)
        if 'modules' in dir_path: continue
        try:
            os.rmdir(dir_path)
        except OSError:
            pass
            
print("Refactoring completed.")

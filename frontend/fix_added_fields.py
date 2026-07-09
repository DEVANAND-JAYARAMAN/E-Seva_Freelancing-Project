import os
import glob
import re

base_dir = r"d:\TCG TECHNOLOGY CLIENTS\Eservice\frontend\src\screens\services"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't have <form> or SubmitButton
    if "<form" not in content or "SubmitButton" not in content:
        return

    # Skip if already modified
    if "overrides.addedFields" in content:
        return
        
    print(f"Modifying {filepath}")
    
    # 1. Import useFormEdit
    if "useFormEdit" not in content:
        import_stmt = 'import { useFormEdit } from "../../../store/context/FormEditContext";\n'
        # Determine relative path back to root
        # d:\...\src\screens\services\group\Form.tsx -> 3 levels back
        # d:\...\src\screens\services\group\subgroup\Form.tsx -> 4 levels back
        
        # Count depth after 'services'
        rel_path = os.path.relpath(filepath, base_dir)
        depth = rel_path.count(os.sep)
        
        if depth == 0:
            # File directly inside 'services' -> 2 levels back to src/
            import_stmt = 'import { useFormEdit } from "../../store/context/FormEditContext";\n'
        elif depth == 1:
            # services/group/Form.tsx -> 3 levels back to src/
            import_stmt = 'import { useFormEdit } from "../../../store/context/FormEditContext";\n'
        elif depth == 2:
            import_stmt = 'import { useFormEdit } from "../../../../store/context/FormEditContext";\n'
            
        content = re.sub(r'(import React.*?\n)', r'\1' + import_stmt, content, count=1)

    # 2. Add const { overrides } = useFormEdit();
    # Find the component definition: export const ComponentName: React.FC... = ({...}) => {
    match = re.search(r'(export const \w+(?:\s*:\s*React\.FC[^=]+)?\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>\s*\{)', content)
    if match:
        insertion_point = match.end()
        # check if it's already there
        if "const { overrides } = useFormEdit();" not in content:
            content = content[:insertion_point] + "\n  const { overrides } = useFormEdit();" + content[insertion_point:]

    # 3. Add the addedFields render block before Button Footer or at the end of form
    added_fields_block = """
      {/* Added Extra Fields */}
      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {overrides.addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={(field.type as any) || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors && errors[field.name]}
              disabled={isSubmitting}
              onChange={(val, file) => {
                handleFieldChange(field.name, val, file);
              }}
            />
          ))}
        </div>
      )}
"""
    
    # Try to find {/* Button Footer */} or <div className="flex items-center justify-end
    button_footer_match = re.search(r'(\{\s*/\*\s*Button Footer\s*\*/\s*\})|(<div[^>]*flex items-center justify-end)', content)
    if button_footer_match:
        content = content[:button_footer_match.start()] + added_fields_block + content[button_footer_match.start():]
    else:
        # Just before </form>
        form_end_match = re.search(r'(</form>)', content)
        if form_end_match:
            content = content[:form_end_match.start()] + added_fields_block + content[form_end_match.start():]

    # Save changes
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print("Done processing files")

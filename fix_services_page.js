const fs = require('fs');

let code = fs.readFileSync('frontend/src/screens/services/ServicesPage.tsx', 'utf8');

// Update EditServiceModalProps
code = code.replace(
  'onSave: (name: string, customImage: string | null) => void;',
  'onSave: (name: string, customImage: string | null) => void;\n  onDelete?: () => void;'
);

// Add delete button inside EditServiceModal
const deleteButtonTarget = `          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>`;

const deleteButtonRepl = `          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2.5 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>`;

if (!code.includes('onClick={onDelete}')) {
    code = code.replace(deleteButtonTarget, deleteButtonRepl);
}

// Add onDelete handler to EditServiceModal usage in ServicesPage
const handleDeleteService = `  const handleDeleteService = async () => {
    if (!editingService) return;
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic/\${editingService.id}\`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServicesList((prev) => prev.filter(s => s.id !== editingService.id));
        setEditModalOpen(false);
        setEditingService(null);
        alert("Service deleted successfully.");
      } else {
        alert("Failed to delete service.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting service.");
    }
  };

  const handleSaveService = `;

code = code.replace('  const handleSaveService = ', handleDeleteService);

// Also need to add onDelete to the component render
const editModalUsage = `<EditServiceModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditingService(null);
            }}
            service={editingService}
            onSave={handleSaveService}
          />`;

const editModalUsageRepl = `<EditServiceModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditingService(null);
            }}
            service={editingService}
            onSave={handleSaveService}
            onDelete={handleDeleteService}
          />`;

code = code.replace(editModalUsage, editModalUsageRepl);

// Wait, the EditServiceModal component needs to accept onDelete prop
code = code.replace('  onSave,\n}: EditServiceModalProps) {', '  onSave,\n  onDelete,\n}: EditServiceModalProps) {');

fs.writeFileSync('frontend/src/screens/services/ServicesPage.tsx', code);
console.log("Updated ServicesPage.tsx");

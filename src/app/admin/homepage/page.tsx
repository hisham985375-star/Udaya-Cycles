export default function AdminHomepagePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Homepage CMS Settings</h1>
        <button className="bg-accent text-bg font-bold px-4 py-2 rounded-md hover:bg-accent-dim">
          Save Changes
        </button>
      </div>
      <div className="bg-surface-raised rounded-lg border border-border p-8 text-center text-text-muted">
        Homepage toggle switches and hero text editing forms will be implemented here.
      </div>
    </div>
  );
}

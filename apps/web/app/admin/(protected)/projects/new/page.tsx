import { ProjectEditor } from '@/components/admin/ProjectEditor';

export default function NewProjectPage() {
  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">PROJECT / NEW</p>
          <h1>New project</h1>
        </div>
      </header>
      <ProjectEditor />
    </div>
  );
}

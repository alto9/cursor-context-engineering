import React from 'react';
import { createRoot } from 'react-dom/client';

// Acquire VSCode API once at module level
const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : undefined;

interface ActiveSession {
  sessionId: string;
  problemStatement: string;
  startTime: string;
  changedFiles: string[];
}

interface Session {
  sessionId: string;
  filePath: string;
  frontmatter: any;
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

interface FileItem {
  name: string;
  path: string;
  modified: string;
  frontmatter: any;
}

interface FileContent {
  path: string;
  frontmatter: any;
  content: string;
}

function App() {
  const [state, setState] = React.useState<any>({ projectPath: '' });
  const [counts, setCounts] = React.useState<{ sessions: number; features: number; specs: number; models: number; contexts: number; stories: number; tasks: number } | null>(null);
  const [route, setRoute] = React.useState<{ page: 'dashboard' | 'features' | 'specs' | 'models' | 'contexts' | 'sessions'; params?: any }>({ page: 'dashboard' });
  const [activeSession, setActiveSession] = React.useState<ActiveSession | null>(null);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [showNewSessionForm, setShowNewSessionForm] = React.useState(false);

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      const msg = event.data;
      if (msg?.type === 'initialState') {
        setState(msg.data);
        vscode?.postMessage({ type: 'getCounts' });
        vscode?.postMessage({ type: 'getActiveSession' });
        vscode?.postMessage({ type: 'listSessions' });
      }
      if (msg?.type === 'counts') {
        setCounts(msg.data);
      }
      if (msg?.type === 'activeSession') {
        setActiveSession(msg.data);
      }
      if (msg?.type === 'sessions') {
        setSessions(msg.data || []);
      }
      if (msg?.type === 'sessionCreated') {
        setActiveSession(msg.data);
        setShowNewSessionForm(false);
        vscode?.postMessage({ type: 'getCounts' });
        vscode?.postMessage({ type: 'listSessions' });
      }
      if (msg?.type === 'sessionStopped') {
        setActiveSession(null);
        vscode?.postMessage({ type: 'getCounts' });
        vscode?.postMessage({ type: 'listSessions' });
      }
    }
    window.addEventListener('message', onMessage);
    vscode?.postMessage({ type: 'getInitialState' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="container">
      <div className="sidebar">
        <div style={{ padding: 12, fontWeight: 600, borderBottom: '1px solid var(--vscode-panel-border)' }}>
          Glam Studio
          {activeSession && (
            <div style={{ fontSize: 10, marginTop: 4, color: 'var(--vscode-charts-green)', fontWeight: 'normal' }}>
              ● Session Active
            </div>
          )}
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'dashboard' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'dashboard' })}>Dashboard</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'sessions' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'sessions' })}>Sessions</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'features' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'features' })}>Features</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'specs' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'specs' })}>Specifications</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'models' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'models' })}>Models</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer', background: route.page === 'contexts' ? 'var(--vscode-list-activeSelectionBackground)' : 'transparent' }} onClick={() => setRoute({ page: 'contexts' })}>Contexts</li>
        </ul>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="main-content">
        <div style={{ padding: 16, marginBottom: 8, opacity: 0.8, fontSize: 12, borderBottom: '1px solid var(--vscode-panel-border)' }}>Project: {state.projectPath}</div>
        
        {route.page === 'dashboard' && (
          <div style={{ padding: 16 }}>
            <DashboardPage counts={counts} activeSession={activeSession} />
          </div>
        )}

        {route.page === 'sessions' && (
          <div style={{ padding: 16 }}>
            <SessionsPage 
              sessions={sessions}
              activeSession={activeSession}
              showNewSessionForm={showNewSessionForm}
              onShowNewSessionForm={() => setShowNewSessionForm(true)}
              onHideNewSessionForm={() => setShowNewSessionForm(false)}
              onDistillSession={(sessionId) => {
                vscode?.postMessage({ type: 'distillSession', sessionId });
              }}
            />
          </div>
        )}

        {route.page === 'features' && (
          <BrowserPage category="features" title="Features" activeSession={activeSession} />
        )}

        {route.page === 'specs' && (
          <BrowserPage category="specs" title="Specifications" activeSession={activeSession} />
        )}

        {route.page === 'models' && (
          <BrowserPage category="models" title="Models" activeSession={activeSession} />
        )}

        {route.page === 'contexts' && (
          <BrowserPage category="contexts" title="Contexts" activeSession={activeSession} />
        )}
      </div>
    </div>
  );
}

function BrowserPage({ category, title, activeSession }: { category: string; title: string; activeSession: ActiveSession | null }) {
  const [folderTree, setFolderTree] = React.useState<FolderNode[]>([]);
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [folderContents, setFolderContents] = React.useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [fileContent, setFileContent] = React.useState<FileContent | null>(null);

  React.useEffect(() => {
    vscode?.postMessage({ type: 'getFolderTree', category });

    function onMessage(event: MessageEvent) {
      const msg = event.data;
      if (msg?.type === 'folderTree' && msg?.category === category) {
        setFolderTree(msg.data || []);
      }
      if (msg?.type === 'folderContents') {
        setFolderContents(msg.data || []);
      }
      if (msg?.type === 'fileContent') {
        setFileContent(msg.data);
      }
      if (msg?.type === 'fileSaved') {
        if (msg.data?.success) {
          // Refresh file content
          if (selectedFile) {
            vscode?.postMessage({ type: 'getFileContent', filePath: selectedFile });
          }
        }
      }
      if (msg?.type === 'folderCreated') {
        if (msg.data?.success) {
          // Refresh folder tree
          vscode?.postMessage({ type: 'getFolderTree', category });
        }
      }
      if (msg?.type === 'structureChanged') {
        // Refresh folder tree when structure changes
        vscode?.postMessage({ type: 'getFolderTree', category });
        // Refresh folder contents if a folder is selected
        if (selectedFolder) {
          vscode?.postMessage({ type: 'getFolderContents', folderPath: selectedFolder, category });
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [category, selectedFolder, selectedFile]);

  const handleFolderClick = (folderPath: string) => {
    setSelectedFolder(folderPath);
    setSelectedFile(null);
    setFileContent(null);
    vscode?.postMessage({ type: 'getFolderContents', folderPath, category });
  };

  const handleFileClick = (filePath: string) => {
    setSelectedFile(filePath);
    vscode?.postMessage({ type: 'getFileContent', filePath });
  };

  const handleBackToFolder = () => {
    setSelectedFile(null);
    setFileContent(null);
  };

  return (
    <div className="split-view">
      <div className="split-sidebar">
        <FolderTreeView 
          folders={folderTree} 
          selectedFolder={selectedFolder}
          onFolderClick={handleFolderClick}
          category={category}
          activeSession={activeSession}
        />
      </div>
      <div className="split-content">
        {!selectedFolder && !selectedFile && (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div>Select a folder to view its contents</div>
          </div>
        )}
        {selectedFolder && !selectedFile && (
          <FolderProfile 
            files={folderContents}
            onFileClick={handleFileClick}
            folderPath={selectedFolder}
          />
        )}
        {selectedFile && fileContent && (
          <ItemProfile 
            category={category}
            fileContent={fileContent}
            activeSession={activeSession}
            onBack={handleBackToFolder}
          />
        )}
      </div>
    </div>
  );
}

function FolderTreeView({ folders, selectedFolder, onFolderClick, category, activeSession }: { 
  folders: FolderNode[]; 
  selectedFolder: string | null; 
  onFolderClick: (path: string) => void;
  category: string;
  activeSession: ActiveSession | null;
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expanded.has(folder.path);
    const isSelected = selectedFolder === folder.path;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.path}>
        <div 
          className={`tree-folder ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: level * 16 + 8 }}
          onClick={() => onFolderClick(folder.path)}
        >
          {hasChildren && (
            <span 
              className={`tree-chevron ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => toggleExpand(folder.path, e)}
            >
              ▸
            </span>
          )}
          {!hasChildren && <span className="tree-chevron"></span>}
          <span className="tree-label">📁 {folder.name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div className="tree-children">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-view">
      <div className="toolbar">
        <span className="font-medium">{category}</span>
        {activeSession && (
          <button 
            className="btn btn-primary"
            style={{ fontSize: 11, padding: '4px 8px' }}
            onClick={() => {
              const folderName = prompt('Enter folder name:');
              if (folderName) {
                const basePath = selectedFolder || `/home/danderson/code/alto9/opensource/cursor-context-engineering/ai/${category}`;
                vscode?.postMessage({ 
                  type: 'createFolder', 
                  folderPath: `${basePath}/${folderName}` 
                });
              }
            }}
          >
            + New
          </button>
        )}
      </div>
      {folders.length === 0 && (
        <div style={{ padding: 16, textAlign: 'center', opacity: 0.7, fontSize: 12 }}>
          No folders yet
        </div>
      )}
      {folders.map(folder => renderFolder(folder))}
    </div>
  );
}

function FolderProfile({ files, onFileClick, folderPath }: { 
  files: FileItem[]; 
  onFileClick: (path: string) => void;
  folderPath: string;
}) {
  return (
    <div className="p-16">
      <h3 className="section-title">Folder Contents</h3>
      <div className="text-xs opacity-70 mb-16">{folderPath}</div>
      {files.length === 0 && (
        <div className="empty-state">
          <div>No files in this folder</div>
        </div>
      )}
      {files.map(file => (
        <div 
          key={file.path} 
          className="file-list-item"
          onClick={() => onFileClick(file.path)}
        >
          <div className="file-name">{file.name}</div>
          <div className="file-meta">
            Modified: {new Date(file.modified).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemProfile({ category, fileContent, activeSession, onBack }: {
  category: string;
  fileContent: FileContent;
  activeSession: ActiveSession | null;
  onBack: () => void;
}) {
  const [frontmatter, setFrontmatter] = React.useState(fileContent.frontmatter || {});
  const [content, setContent] = React.useState(fileContent.content || '');
  const [isDirty, setIsDirty] = React.useState(false);
  const isReadOnly = !activeSession;

  React.useEffect(() => {
    setFrontmatter(fileContent.frontmatter || {});
    setContent(fileContent.content || '');
    setIsDirty(false);
  }, [fileContent]);

  const handleSave = () => {
    vscode?.postMessage({
      type: 'saveFileContent',
      filePath: fileContent.path,
      frontmatter,
      content
    });
    setIsDirty(false);
  };

  const handleCancel = () => {
    setFrontmatter(fileContent.frontmatter || {});
    setContent(fileContent.content || '');
    setIsDirty(false);
  };

  const updateFrontmatter = (key: string, value: any) => {
    setFrontmatter({ ...frontmatter, [key]: value });
    setIsDirty(true);
  };

  const updateContent = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  return (
    <div className="p-16">
      <div className="toolbar">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <span className="font-medium">{fileContent.path.split('/').pop()}</span>
      </div>

      {isReadOnly && (
        <div className="alert alert-info mt-16">
          Read-only mode. Start a design session to edit files.
        </div>
      )}

      <div className="content-section">
        <h3 className="section-title">Metadata</h3>
        {category === 'features' && (
          <FeatureFrontmatter 
            frontmatter={frontmatter} 
            onChange={updateFrontmatter}
            readOnly={isReadOnly}
          />
        )}
        {category === 'specs' && (
          <SpecFrontmatter 
            frontmatter={frontmatter} 
            onChange={updateFrontmatter}
            readOnly={isReadOnly}
          />
        )}
        {category === 'models' && (
          <ModelFrontmatter 
            frontmatter={frontmatter} 
            onChange={updateFrontmatter}
            readOnly={isReadOnly}
          />
        )}
        {category === 'contexts' && (
          <ContextFrontmatter 
            frontmatter={frontmatter} 
            onChange={updateFrontmatter}
            readOnly={isReadOnly}
          />
        )}
      </div>

      <div className="content-section">
        <h3 className="section-title">Content</h3>
        <textarea
          className="form-textarea"
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          readOnly={isReadOnly}
          style={{ minHeight: 400 }}
        />
      </div>

      {!isReadOnly && (
        <div className="btn-group">
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save Changes
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={!isDirty}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function FeatureFrontmatter({ frontmatter, onChange, readOnly }: { 
  frontmatter: any; 
  onChange: (key: string, value: any) => void;
  readOnly: boolean;
}) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Feature ID</label>
        <input 
          className="form-input"
          value={frontmatter.feature_id || ''}
          onChange={(e) => onChange('feature_id', e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Spec IDs (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.spec_id) ? frontmatter.spec_id.join(', ') : frontmatter.spec_id || ''}
          onChange={(e) => onChange('spec_id', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Model IDs (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.model_id) ? frontmatter.model_id.join(', ') : frontmatter.model_id || ''}
          onChange={(e) => onChange('model_id', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}

function SpecFrontmatter({ frontmatter, onChange, readOnly }: { 
  frontmatter: any; 
  onChange: (key: string, value: any) => void;
  readOnly: boolean;
}) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Spec ID</label>
        <input 
          className="form-input"
          value={frontmatter.spec_id || ''}
          onChange={(e) => onChange('spec_id', e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Feature IDs (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.feature_id) ? frontmatter.feature_id.join(', ') : frontmatter.feature_id || ''}
          onChange={(e) => onChange('feature_id', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Model IDs (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.model_id) ? frontmatter.model_id.join(', ') : frontmatter.model_id || ''}
          onChange={(e) => onChange('model_id', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Context IDs (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.context_id) ? frontmatter.context_id.join(', ') : frontmatter.context_id || ''}
          onChange={(e) => onChange('context_id', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}

function ModelFrontmatter({ frontmatter, onChange, readOnly }: { 
  frontmatter: any; 
  onChange: (key: string, value: any) => void;
  readOnly: boolean;
}) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Model ID</label>
        <input 
          className="form-input"
          value={frontmatter.model_id || ''}
          onChange={(e) => onChange('model_id', e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <input 
          className="form-input"
          value={frontmatter.type || ''}
          onChange={(e) => onChange('type', e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Related Models (comma-separated)</label>
        <input 
          className="form-input"
          value={Array.isArray(frontmatter.related_models) ? frontmatter.related_models.join(', ') : frontmatter.related_models || ''}
          onChange={(e) => onChange('related_models', e.target.value.split(',').map((s: string) => s.trim()))}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}

function ContextFrontmatter({ frontmatter, onChange, readOnly }: { 
  frontmatter: any; 
  onChange: (key: string, value: any) => void;
  readOnly: boolean;
}) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Context ID</label>
        <input 
          className="form-input"
          value={frontmatter.context_id || ''}
          onChange={(e) => onChange('context_id', e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <input 
          className="form-input"
          value={frontmatter.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}

function DashboardPage({ counts, activeSession }: { counts: any; activeSession: ActiveSession | null }) {
  return (
    <>
      <h2>Dashboard</h2>
      {activeSession && (
        <div className="card alert-info">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Active Session: {activeSession.sessionId}</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>{activeSession.problemStatement}</div>
          <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>
            Started: {new Date(activeSession.startTime).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            Changed Files: {activeSession.changedFiles.length}
          </div>
          <button 
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => {
              vscode?.postMessage({ type: 'stopSession' });
            }}
          >
            Stop Session
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Card title="Sessions" value={counts?.sessions ?? 0} />
        <Card title="Features" value={counts?.features ?? 0} />
        <Card title="Specs" value={counts?.specs ?? 0} />
        <Card title="Models" value={counts?.models ?? 0} />
        <Card title="Contexts" value={counts?.contexts ?? 0} />
        <Card title="Stories" value={counts?.stories ?? 0} />
        <Card title="Tasks" value={counts?.tasks ?? 0} />
      </div>
      <div className="card">
        <h3>Quick Start</h3>
        <p>Welcome to Glam Studio - your session-driven design workspace.</p>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Start a design session from the Sessions page</li>
          <li>Design your features, specs, and models during the session</li>
          <li>Glam tracks all changes automatically</li>
          <li>Stop the session and distill it into actionable stories and tasks</li>
          <li>Build each story to implement your changes</li>
        </ol>
      </div>
    </>
  );
}

function SessionsPage({ sessions, activeSession, showNewSessionForm, onShowNewSessionForm, onHideNewSessionForm, onDistillSession }: any) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Sessions</h2>
        {!activeSession && !showNewSessionForm && (
          <button 
            className="btn btn-primary"
            onClick={onShowNewSessionForm}
          >
            + New Session
          </button>
        )}
      </div>

      {activeSession && (
        <div className="card alert-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>● Active Session: {activeSession.sessionId}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>{activeSession.problemStatement}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                Started: {new Date(activeSession.startTime).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                Changed Files: {activeSession.changedFiles.length}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  vscode?.postMessage({ type: 'stopSession' });
                }}
              >
                Stop Session
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewSessionForm && (
        <NewSessionForm onCancel={onHideNewSessionForm} />
      )}

      {!showNewSessionForm && (
        <div style={{ marginTop: 24 }}>
          <h3>Recent Sessions</h3>
          {sessions.length === 0 && (
            <div className="empty-state">
              No sessions yet. Create your first design session above.
            </div>
          )}
          {sessions.map((session: Session) => (
            <div key={session.sessionId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{session.sessionId}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{session.frontmatter?.problem_statement}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>
                    Status: {session.frontmatter?.status} | Files: {session.frontmatter?.changed_files?.length || 0}
                  </div>
                </div>
                {session.frontmatter?.status === 'completed' && (
                  <button 
                    className="btn btn-primary"
                    style={{ fontSize: 12 }}
                    onClick={() => onDistillSession(session.sessionId)}
                  >
                    Distill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NewSessionForm({ onCancel }: { onCancel: () => void }) {
  const [problemStatement, setProblemStatement] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problemStatement.trim()) {
      vscode?.postMessage({ 
        type: 'createSession', 
        problemStatement: problemStatement.trim() 
      });
    }
  };

  return (
    <div className="card">
      <h3>Start New Design Session</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            What problem are you trying to solve?
          </label>
          <textarea
            className="form-textarea"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="e.g., Implement user authentication with email verification"
            style={{ minHeight: 100 }}
            autoFocus
          />
        </div>
        <div className="btn-group">
          <button 
            type="submit"
            disabled={!problemStatement.trim()}
            className="btn btn-primary"
          >
            Start Session
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="card" style={{ minWidth: 140 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

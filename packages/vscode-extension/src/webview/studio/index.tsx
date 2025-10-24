import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [state, setState] = React.useState<any>({ projectPath: '' });
  const [counts, setCounts] = React.useState<{ decisions: number; features: number; featureSets: number; specs: number } | null>(null);
  const [featureSets, setFeatureSets] = React.useState<Array<{ id: string; path: string }>>([]);
  const [route, setRoute] = React.useState<{ page: 'dashboard' | 'featuresets' | 'specs'; params?: any }>({ page: 'dashboard' });
  const [currentFeatureSet, setCurrentFeatureSet] = React.useState<any>(null);
  const [specs, setSpecs] = React.useState<Array<{ id: string; path: string }>>([]);
  const [currentSpec, setCurrentSpec] = React.useState<any>(null);

  React.useEffect(() => {
    const vscode = (window as any).acquireVsCodeApi?.();
    function onMessage(event: MessageEvent) {
      const msg = event.data;
      if (msg?.type === 'initialState') {
        setState(msg.data);
        vscode?.postMessage({ type: 'getCounts' });
        vscode?.postMessage({ type: 'listFeatureSets' });
      }
      if (msg?.type === 'counts') {
        setCounts(msg.data);
      }
      if (msg?.type === 'featureSets') {
        setFeatureSets(msg.data);
      }
      if (msg?.type === 'featureSet') {
        setCurrentFeatureSet(msg.data);
      }
      if (msg?.type === 'specs') {
        setSpecs(msg.data);
      }
      if (msg?.type === 'spec') {
        setCurrentSpec(msg.data);
      }
    }
    window.addEventListener('message', onMessage);
    vscode?.postMessage({ type: 'getInitialState' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="container">
      <div className="sidebar">
        <div style={{ padding: 12, fontWeight: 600 }}>Glam Studio</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <li style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => setRoute({ page: 'dashboard' })}>Dashboard</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => setRoute({ page: 'featuresets' })}>FeatureSets</li>
          <li style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => { setRoute({ page: 'specs' }); vscode?.postMessage({ type: 'listSpecs' }); }}>Specs</li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ marginBottom: 8, opacity: 0.8 }}>Project: {state.projectPath}</div>
        {route.page === 'dashboard' && (
          <>
            <h2>Dashboard</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <Card title="Decisions" value={counts?.decisions ?? 0} />
              <Card title="Feature Sets" value={counts?.featureSets ?? 0} />
              <Card title="Features" value={counts?.features ?? 0} />
              <Card title="Specs" value={counts?.specs ?? 0} />
            </div>
          </>
        )}

        {route.page === 'featuresets' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>Feature Sets</h2>
              <button onClick={() => {
                const name = prompt('Feature Set name?') || '';
                const description = prompt('Description?') || '';
                const background = prompt('Background?') || '';
                (window as any).acquireVsCodeApi?.().postMessage({ type: 'createFeatureSet', data: { name, description, background } });
              }}>New Feature Set</button>
            </div>
            <ul>
              {featureSets.map(fs => (
                <li key={fs.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setRoute({ page: 'featuresets', params: { id: fs.id } }); (window as any).acquireVsCodeApi?.().postMessage({ type: 'getFeatureSet', data: { id: fs.id } }); }}>{fs.id}</a>
                </li>
              ))}
              {featureSets.length === 0 && <li style={{ opacity: 0.7 }}>No feature sets found</li>}
            </ul>

            {route.params?.id && currentFeatureSet && currentFeatureSet.id === route.params.id && (
              <div style={{ marginTop: 16 }}>
                <Breadcrumbs items={[{ label: 'Feature Sets', onClick: () => setRoute({ page: 'featuresets' }) }, { label: currentFeatureSet.id }]} />
                <h3>Feature Set Profile: {currentFeatureSet.index?.name || currentFeatureSet.id}</h3>
                <div style={{ marginBottom: 12 }}>{currentFeatureSet.index?.description}</div>
                <div style={{ marginBottom: 12, whiteSpace: 'pre-wrap' }}>{currentFeatureSet.index?.background}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4>Features</h4>
                  <button onClick={() => {
                    const name = prompt('New Feature name?') || '';
                    const background = prompt('Background?') || '';
                    (window as any).acquireVsCodeApi?.().postMessage({ type: 'createFeature', data: { featuresetId: currentFeatureSet.id, name, frontmatter: { background } } });
                  }}>New Feature</button>
                </div>
                <ul>
                  {currentFeatureSet.features.map((f: any) => (
                    <li key={f.path}><a href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); setRoute({ page: 'featuresets', params: { id: route.params.id, featurePath: f.path } }); (window as any).acquireVsCodeApi?.().postMessage({ type: 'getFeature', data: { path: f.path } }); }}>{f.id}</a></li>
                  ))}
                  {currentFeatureSet.features.length === 0 && <li style={{ opacity: 0.7 }}>No features yet</li>}
                </ul>
                {route.params?.featurePath && currentFeatureSet && (
                  <FeatureEditor featurePath={route.params.featurePath} />
                )}
              </div>
            )}
          </>
        )}

        {route.page === 'specs' && (
          <>
            <h2>Specs</h2>
            <button onClick={() => (window as any).acquireVsCodeApi?.().postMessage({ type: 'listSpecs' })}>Refresh</button>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ width: 300 }}>
                <ul>
                  {specs.map(s => (
                    <li key={s.path}><a href="#" onClick={(e) => { e.preventDefault(); (window as any).acquireVsCodeApi?.().postMessage({ type: 'getSpec', data: { path: s.path } }); }}>{s.id}</a></li>
                  ))}
                  {specs.length === 0 && <li style={{ opacity: 0.7 }}>No specs found</li>}
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                {currentSpec && (
                  <SpecEditor spec={currentSpec} onSave={(updated) => (window as any).acquireVsCodeApi?.().postMessage({ type: 'updateSpec', data: updated })} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ border: '1px solid var(--vscode-panel-border)', borderRadius: 6, padding: 12, minWidth: 140 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void }> }) {
  return (
    <div style={{ marginBottom: 8, opacity: 0.8 }}>
      {items.map((it, idx) => (
        <span key={idx}>
          {it.onClick ? <a href="#" onClick={(e) => { e.preventDefault(); it.onClick?.(); }}>{it.label}</a> : it.label}
          {idx < items.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </div>
  );
}

function FeatureEditor({ featurePath }: { featurePath: string }) {
  const [feature, setFeature] = React.useState<any>(null);
  const vscode = (window as any).acquireVsCodeApi?.();
  React.useEffect(() => {
    vscode?.postMessage({ type: 'getFeature', data: { path: featurePath } });
    function onMessage(event: MessageEvent) {
      const msg = (event as any).data;
      if (msg?.type === 'feature' && msg.data?.path === featurePath) {
        setFeature(msg.data);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [featurePath]);

  if (!feature) return null;

  const [frontmatter, setFrontmatter] = React.useState<any>(feature.frontmatter || {});
  const [scenarios, setScenarios] = React.useState<any[]>(feature.scenarios || []);
  React.useEffect(() => { setFrontmatter(feature.frontmatter || {}); setScenarios(feature.scenarios || []); }, [feature?.path]);

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Feature Profile</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8 }}>
        {Object.keys(frontmatter).map(k => (
          <React.Fragment key={k}>
            <label>{k}</label>
            <input value={String(frontmatter[k] ?? '')} onChange={(e) => setFrontmatter({ ...frontmatter, [k]: e.target.value })} />
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <h5>Gherkin Scenarios</h5>
        {(scenarios as any[]).map((sc, i) => (
          <div key={i} style={{ border: '1px solid var(--vscode-panel-border)', borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <input placeholder="Scenario title" value={sc.title ?? ''} onChange={(e) => setScenarios(scenarios.map((s: any, idx: number) => idx === i ? { ...s, title: e.target.value } : s))} />
            <ul>
              {(sc.steps || []).map((st: any, j: number) => (
                <li key={j}>
                  <select value={st.keyword} onChange={(e) => setScenarios(scenarios.map((s: any, idx: number) => idx === i ? { ...s, steps: s.steps.map((x: any, jj: number) => jj === j ? { ...x, keyword: e.target.value } : x) } : s))}>
                    {['GIVEN', 'WHEN', 'THEN', 'AND', 'BUT'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input value={st.text} onChange={(e) => setScenarios(scenarios.map((s: any, idx: number) => idx === i ? { ...s, steps: s.steps.map((x: any, jj: number) => jj === j ? { ...x, text: e.target.value } : x) } : s))} />
                </li>
              ))}
            </ul>
            <button onClick={() => setScenarios(scenarios.map((s: any, idx: number) => idx === i ? { ...s, steps: [...(s.steps || []), { keyword: 'GIVEN', text: '' }] } : s))}>Add Step</button>
          </div>
        ))}
        <button onClick={() => setScenarios([...(scenarios || []), { title: '', steps: [] }])}>Add Scenario</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => vscode?.postMessage({ type: 'updateFeature', data: { path: feature.path, frontmatter, scenarios } })}>Save Feature</button>
      </div>
    </div>
  );
}

function SpecEditor({ spec, onSave }: { spec: any; onSave: (s: any) => void }) {
  const [frontmatter, setFrontmatter] = React.useState<any>(spec.frontmatter || {});
  const [body, setBody] = React.useState<string>(spec.body || '');
  React.useEffect(() => { setFrontmatter(spec.frontmatter || {}); setBody(spec.body || ''); }, [spec?.path]);
  return (
    <div>
      <h3>Spec Profile</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8 }}>
        {Object.keys(frontmatter).map(k => (
          <React.Fragment key={k}>
            <label>{k}</label>
            <input value={String(frontmatter[k] ?? '')} onChange={(e) => setFrontmatter({ ...frontmatter, [k]: e.target.value })} />
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Body</label>
        <textarea style={{ width: '100%', height: 240 }} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => onSave({ path: spec.path, frontmatter, body })}>Save</button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);



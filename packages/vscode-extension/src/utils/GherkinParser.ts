export interface GherkinStep {
    keyword: 'GIVEN' | 'WHEN' | 'THEN' | 'AND' | 'BUT';
    text: string;
}

export interface GherkinScenario {
    title?: string;
    steps: GherkinStep[];
}

export class GherkinParser {
    static parse(content: string): GherkinScenario[] {
        const lines = content.split(/\r?\n/);
        const scenarios: GherkinScenario[] = [];
        let current: GherkinScenario | undefined;

        for (const raw of lines) {
            const line = raw.trim();
            if (!line) continue;
            if (line.startsWith('Scenario:')) {
                if (current) scenarios.push(current);
                current = { title: line.substring('Scenario:'.length).trim(), steps: [] };
                continue;
            }
            const m = /^(GIVEN|WHEN|THEN|AND|BUT)\s+(.*)$/i.exec(line);
            if (m) {
                if (!current) current = { steps: [] };
                current.steps.push({ keyword: m[1].toUpperCase() as any, text: m[2] });
            }
        }
        if (current) scenarios.push(current);
        return scenarios;
    }

    static serialize(scenarios: GherkinScenario[]): string {
        const parts: string[] = [];
        for (const sc of scenarios) {
            if (sc.title) parts.push(`Scenario: ${sc.title}`);
            for (const st of sc.steps) {
                parts.push(`${st.keyword} ${st.text}`);
            }
            parts.push('');
        }
        return parts.join('\n').trim() + '\n';
    }
}




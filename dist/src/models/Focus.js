/** Same list as frontend src/constants/focusData.ts (for onboarding & change focus screen). */
export const FOCUS_OPTIONS = [
    { id: 'Frontend', label: 'Frontend Dev', desc: 'React, Vue, UI/UX', iconId: 'Code2' },
    { id: 'Backend', label: 'Backend Dev', desc: 'Node, Python, DBs', iconId: 'Server' },
    { id: 'Mobile', label: 'Mobile Dev', desc: 'React Native, iOS', iconId: 'Smartphone' },
    { id: 'FullStack', label: 'Full Stack', desc: 'End-to-End Arch', iconId: 'Layers' },
    { id: 'DevOps', label: 'DevOps', desc: 'AWS, Docker, CI/CD', iconId: 'Cloud' },
    { id: 'DataScience', label: 'Data Science', desc: 'Stats, ML, Analytics', iconId: 'BarChart2' },
    { id: 'Product', label: 'Product Mgmt', desc: 'Strategy, Agile, KPIs', iconId: 'Box' },
    { id: 'Sales', label: 'Sales / AE', desc: 'Revenue, B2B, CRM', iconId: 'TrendingUp' },
    { id: 'Marketing', label: 'Marketing', desc: 'Growth, Brand, SEO', iconId: 'Megaphone' },
    { id: 'Operations', label: 'Operations', desc: 'Process, Logistics', iconId: 'Briefcase' },
    { id: 'HR', label: 'HR / People', desc: 'Recruiting, Culture', iconId: 'Users' },
];
export function getFocusOptions() {
    return FOCUS_OPTIONS;
}
/** Maps each focus ID to domain names (track.domain). Same as frontend HomeScreen FOCUS_TO_DOMAINS. */
export const FOCUS_TO_DOMAINS = {
    Frontend: ['Frontend'],
    Backend: ['Backend'],
    Mobile: ['Android', 'iOS'],
    FullStack: ['Frontend', 'Backend'],
    DevOps: ['DevOps'],
    Product: ['Product'],
    Sales: ['Sales', 'Behavioral'],
    Marketing: ['Product', 'Behavioral'],
    Operations: ['Operations', 'Product'],
    HR: ['Behavioral', 'Product'],
    DataScience: ['Data', 'AI/ML'],
};
//# sourceMappingURL=Focus.js.map
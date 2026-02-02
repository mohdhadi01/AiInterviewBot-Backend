import mongoose, { Schema } from 'mongoose';
const trackSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true, default: '' },
    image: { type: String, required: true },
    domain: { type: String, required: true },
    focusAreas: { type: [String], default: undefined },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });
trackSchema.index({ order: 1, active: 1 });
export const Track = mongoose.models.Track ?? mongoose.model('Track', trackSchema);
/** Derive focus areas from subtitle (comma-separated) when not provided. */
function subtitleToFocusAreas(subtitle) {
    return subtitle ? subtitle.split(',').map((s) => s.trim()).filter(Boolean) : [];
}
/** Fallback when DB has no tracks. focusAreas expanded so app has many sub-topics per domain. */
const DEFAULT_TRACKS = [
    { id: 'react', title: 'React', subtitle: 'Hooks, components, performance', image: 'https://cdn3d.iconscout.com/3d/free/thumb/free-react-3d-icon-download-in-png-blend-fbx-gltf-file-formats--facebook-logo-native-javascript-library-user-interfaces-coding-lang-pack-logos-icons-7578010.png', domain: 'Frontend', focusAreas: ['Hooks', 'Components', 'Virtual DOM', 'State & Props', 'JSX', 'Lifecycle', 'Events', 'Forms', 'Context API', 'useMemo & useCallback', 'Performance', 'Testing', 'Redux', 'SSR', 'Suspense', 'Error Boundaries', 'Portals', 'Code Splitting', 'Reconciliation'] },
    { id: 'javascript', title: 'JavaScript', subtitle: 'ES6+, async, closures, DOM', image: 'https://cdn3d.iconscout.com/3d/free/thumb/free-javascript-3d-icon-download-in-png-blend-fbx-gltf-file-formats--html-logo-vue-angular-coding-lang-pack-logos-icons-7577991.png', domain: 'Frontend', focusAreas: ['ES6+', 'Async & Promises', 'Closures', 'DOM', 'Event loop', 'Prototypes', 'Call/Apply/Bind', 'Hoisting', 'Scope', 'this keyword', 'Modules', 'Generators', 'Proxy & Reflect', 'Web Workers', 'Memory & GC'] },
    { id: 'python', title: 'Python', subtitle: 'OOP, decorators, data structures', image: 'https://img.icons8.com/3d-fluency/144/python.png', domain: 'Backend', focusAreas: ['OOP', 'Decorators', 'Data structures', 'APIs', 'List comprehensions', 'Generators', 'Context managers', 'GIL', 'Exception handling', 'Testing', 'Type hints', 'Async/await', 'Packaging', 'DB & ORM'] },
    { id: 'java', title: 'Java', subtitle: 'Collections, multithreading, JVM', image: 'https://img.icons8.com/3d-fluency/144/java.png', domain: 'Backend', focusAreas: ['Collections', 'Multithreading', 'JVM', 'Spring', 'Streams', 'Lambda', 'Concurrency', 'Memory model', 'Garbage collection', 'Design patterns', 'Maven/Gradle', 'JUnit', 'REST', 'Security'] },
    { id: 'dsa', title: 'DSA', subtitle: 'Arrays, trees, graphs, DP', image: 'https://img.icons8.com/3d-fluency/144/flow-chart.png', domain: 'Algorithms', focusAreas: ['Arrays', 'Trees', 'Graphs', 'DP', 'Hash tables', 'Heaps', 'Sorting', 'Searching', 'Recursion', 'Backtracking', 'Greedy', 'Bit manipulation', 'Sliding window', 'Two pointers', 'Tries'] },
    { id: 'system-design', title: 'System Design', subtitle: 'Scalability, APIs, architecture', image: 'https://img.icons8.com/3d-fluency/144/project.png', domain: 'System Design', focusAreas: ['Scalability', 'APIs', 'Architecture', 'Caching', 'Load balancing', 'Databases', 'Message queues', 'Microservices', 'CDN', 'CAP theorem', 'Consistency', 'Sharding', 'Rate limiting', 'Monitoring'] },
    { id: 'sql', title: 'SQL & DB', subtitle: 'Queries, indexes, normalization', image: 'https://img.icons8.com/3d-fluency/144/database.png', domain: 'Database', focusAreas: ['Queries', 'Indexes', 'Normalization', 'Transactions', 'Joins', 'ACID', 'Replication', 'Partitioning', 'Query optimization', 'NoSQL', 'Schema design', 'Backup & recovery'] },
    { id: 'node', title: 'Node.js', subtitle: 'Event loop, streams, REST APIs', image: 'https://img.icons8.com/?size=144&id=54087&format=png', domain: 'Backend', focusAreas: ['Event loop', 'Streams', 'REST APIs', 'Async', 'Express', 'Middleware', 'Error handling', 'Testing', 'Security', 'Performance', 'WebSockets', 'File system', 'Modules', 'NPM'] },
    { id: 'kotlin', title: 'Kotlin', subtitle: 'Coroutines, null safety, Android', image: 'https://img.icons8.com/3d-fluency/144/android-os.png', domain: 'Android', focusAreas: ['Coroutines', 'Null safety', 'Android', 'Jetpack', 'Compose', 'Lifecycle', 'Navigation', 'Room', 'WorkManager', 'Testing', 'DI', 'MVVM', 'Networking', 'Security'] },
    { id: 'ios', title: 'iOS / Swift', subtitle: 'UIKit, SwiftUI, concurrency', image: 'https://img.icons8.com/3d-fluency/144/apple.png', domain: 'iOS', focusAreas: ['UIKit', 'SwiftUI', 'Concurrency', 'Combine', 'Networking', 'Core Data', 'Testing', 'Memory management', 'App lifecycle', 'Navigation', 'Delegation', 'Closures', 'Optionals'] },
    { id: 'ml', title: 'Machine Learning', subtitle: 'Models, training, deployment', image: 'https://img.icons8.com/3d-fluency/144/brain.png', domain: 'AI/ML', focusAreas: ['Models', 'Training', 'Deployment', 'NLP', 'Computer vision', 'Feature engineering', 'Hyperparameter tuning', 'MLOps', 'TensorFlow', 'PyTorch', 'Evaluation metrics', 'Bias & fairness'] },
    { id: 'cloud', title: 'Cloud & DevOps', subtitle: 'AWS, GCP, CI/CD, containers', image: 'https://img.icons8.com/3d-fluency/144/cloud.png', domain: 'DevOps', focusAreas: ['AWS', 'GCP', 'CI/CD', 'Containers', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring', 'Logging', 'IaC', 'Networking', 'Security', 'Cost optimization', 'Auto-scaling'] },
    { id: 'cybersecurity', title: 'Cybersecurity', subtitle: 'Networking, auth, secure coding', image: 'https://img.icons8.com/3d-fluency/144/shield.png', domain: 'Security', focusAreas: ['Networking', 'Auth', 'Secure coding', 'OWASP', 'Encryption', 'Penetration testing', 'Incident response', 'Compliance', 'XSS/CSRF', 'Secrets management', 'Zero trust'] },
    { id: 'data-science', title: 'Data Science', subtitle: 'Stats, visualization, pipelines', image: 'https://img.icons8.com/3d-fluency/144/chart.png', domain: 'Data', focusAreas: ['Stats', 'Visualization', 'Pipelines', 'ETL', 'SQL', 'Python', 'A/B testing', 'Feature store', 'Data quality', 'Warehousing', 'Reporting', 'Experiment design'] },
    { id: 'product', title: 'Product Management', subtitle: 'Roadmap, metrics, prioritization', image: 'https://img.icons8.com/3d-fluency/144/briefcase.png', domain: 'Product', focusAreas: ['Roadmap', 'Metrics', 'Prioritization', 'User research', 'Stakeholder management', 'Backlog', 'Agile', 'OKRs', 'Go-to-market', 'Pricing', 'Competitive analysis', 'Discovery', 'Launch'] },
    { id: 'behavioral', title: 'Behavioral', subtitle: 'STAR, teamwork, leadership', image: 'https://img.icons8.com/3d-fluency/144/guest-male.png', domain: 'Behavioral', focusAreas: ['STAR', 'Teamwork', 'Leadership', 'Conflict resolution', 'Decision making', 'Failure & learning', 'Influence', 'Time management', 'Feedback', 'Cross-functional', 'Motivation', 'Prioritization'] },
    { id: 'sales', title: 'Sales', subtitle: 'Pipeline, closing, negotiation, CRM', image: 'https://img.icons8.com/3d-fluency/144/handshake.png', domain: 'Sales', focusAreas: ['Pipeline', 'Closing', 'Negotiation', 'CRM', 'Prospecting', 'Discovery', 'Objection handling', 'Demo', 'Follow-up', 'Territory management', 'Forecasting', 'Account planning', 'Churn prevention', 'Upsell'] },
    { id: 'operations', title: 'Operations', subtitle: 'Supply chain, process, KPIs, logistics', image: 'https://img.icons8.com/3d-fluency/144/package.png', domain: 'Operations', focusAreas: ['Supply chain', 'Process', 'KPIs', 'Logistics', 'Inventory', 'Vendor management', 'Forecasting', 'SOPs', 'Automation', 'Cost control', 'Quality', 'Scheduling', 'Risk management', 'Compliance'] },
];
/** Use rich focusAreas from DEFAULT_TRACKS when DB has none or fewer, so frontend gets same as fallback list. */
function getFocusAreas(doc) {
    if (doc.focusAreas?.length)
        return doc.focusAreas;
    const defaultTrack = DEFAULT_TRACKS.find((t) => t.id === doc.id);
    if (defaultTrack?.focusAreas?.length)
        return defaultTrack.focusAreas;
    return subtitleToFocusAreas(doc.subtitle);
}
export async function getTracks() {
    const items = await Track.find({ active: true }).sort({ order: 1 }).lean();
    if (items.length === 0)
        return DEFAULT_TRACKS;
    return items.map((doc) => ({
        id: doc.id,
        title: doc.title,
        subtitle: doc.subtitle,
        image: doc.image,
        domain: doc.domain,
        focusAreas: getFocusAreas(doc),
    }));
}
import { FOCUS_TO_DOMAINS } from './Focus.js';
const TECH_FOCUS_IDS = new Set(['Frontend', 'Backend', 'Mobile', 'FullStack', 'DevOps', 'DataScience']);
const TECH_FILL_DOMAINS = ['Frontend', 'Backend', 'Android', 'iOS', 'Algorithms', 'Database', 'DevOps', 'Security', 'Data', 'AI/ML'];
const NON_TECH_FILL_DOMAINS = ['Product', 'Behavioral', 'Sales', 'Operations', 'Data'];
function pickFirstByDomains(tracks, domains, max, excludeIds) {
    const out = [];
    const seen = new Set(excludeIds);
    for (const d of domains) {
        for (const t of tracks) {
            if (t.domain === d && !seen.has(t.id)) {
                out.push(t);
                seen.add(t.id);
                if (out.length >= max)
                    return out;
            }
        }
    }
    return out;
}
/** Returns 4 tracks for home based on user's primaryFocus (same logic as frontend HomeScreen). */
export function getPreferredTracks(tracks, primaryFocus) {
    const max = 4;
    if (!primaryFocus)
        return tracks.slice(0, max);
    const preferredDomains = FOCUS_TO_DOMAINS[primaryFocus] ?? [];
    if (preferredDomains.length === 0)
        return tracks.slice(0, max);
    const isTechFocus = TECH_FOCUS_IDS.has(primaryFocus);
    const fillDomains = isTechFocus ? TECH_FILL_DOMAINS : NON_TECH_FILL_DOMAINS;
    if (isTechFocus) {
        const first3 = pickFirstByDomains(tracks, [...preferredDomains, ...fillDomains], 3);
        const systemDesign = tracks.find((t) => t.domain === 'System Design');
        if (systemDesign)
            return [...first3, systemDesign].slice(0, max);
        return first3.slice(0, max);
    }
    const sorted = [...tracks].sort((a, b) => {
        const aInPreferred = preferredDomains.indexOf(a.domain);
        const bInPreferred = preferredDomains.indexOf(b.domain);
        const aInFill = fillDomains.indexOf(a.domain);
        const bInFill = fillDomains.indexOf(b.domain);
        const aPri = aInPreferred >= 0 ? aInPreferred : aInFill >= 0 ? preferredDomains.length + aInFill : 999;
        const bPri = bInPreferred >= 0 ? bInPreferred : bInFill >= 0 ? preferredDomains.length + bInFill : 999;
        if (aPri !== bPri)
            return aPri - bPri;
        return a.title.localeCompare(b.title);
    });
    return sorted.slice(0, max);
}
//# sourceMappingURL=Track.js.map
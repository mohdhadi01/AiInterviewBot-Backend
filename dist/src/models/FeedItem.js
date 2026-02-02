import mongoose, { Schema } from 'mongoose';
const feedItemSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true, default: '' },
    image: { type: String, required: true },
    domain: { type: String, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });
feedItemSchema.index({ order: 1, active: 1 });
export const FeedItem = mongoose.models.FeedItem ?? mongoose.model('FeedItem', feedItemSchema);
const DEFAULT_FEED = [
    { id: 'react', title: 'React', subtitle: 'Hooks, components, performance', image: 'https://cdn3d.iconscout.com/3d/free/thumb/free-react-3d-icon-download-in-png-blend-fbx-gltf-file-formats--facebook-logo-native-javascript-library-user-interfaces-coding-lang-pack-logos-icons-7578010.png', domain: 'Frontend' },
    { id: 'javascript', title: 'JavaScript', subtitle: 'ES6+, async, closures, DOM', image: 'https://cdn3d.iconscout.com/3d/free/thumb/free-javascript-3d-icon-download-in-png-blend-fbx-gltf-file-formats--html-logo-vue-angular-coding-lang-pack-logos-icons-7577991.png', domain: 'Frontend' },
    { id: 'python', title: 'Python', subtitle: 'OOP, decorators, data structures', image: 'https://img.icons8.com/3d-fluency/144/python.png', domain: 'Backend' },
    { id: 'node', title: 'Node.js', subtitle: 'Event loop, streams, REST APIs', image: 'https://img.icons8.com/?size=144&id=54087&format=png', domain: 'Backend' },
    { id: 'dsa', title: 'DSA', subtitle: 'Arrays, trees, graphs, DP', image: 'https://img.icons8.com/3d-fluency/144/flow-chart.png', domain: 'Algorithms' },
    { id: 'system-design', title: 'System Design', subtitle: 'Scalability, APIs, architecture', image: 'https://img.icons8.com/3d-fluency/144/project.png', domain: 'System Design' },
    { id: 'behavioral', title: 'Behavioral', subtitle: 'STAR, teamwork, leadership', image: 'https://img.icons8.com/3d-fluency/144/guest-male.png', domain: 'Behavioral' },
];
export async function getFeedItems() {
    const items = await FeedItem.find({ active: true }).sort({ order: 1 }).lean();
    if (items.length === 0)
        return DEFAULT_FEED;
    return items.map((doc) => ({
        id: doc.id,
        title: doc.title,
        subtitle: doc.subtitle,
        image: doc.image,
        domain: doc.domain,
    }));
}
//# sourceMappingURL=FeedItem.js.map
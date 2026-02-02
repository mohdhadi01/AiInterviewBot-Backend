import { type Document, type Model } from 'mongoose';
export interface TrackItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    domain: string;
    /** Focus areas / sub-topics for this track (e.g. React: Hooks, State, Performance). */
    focusAreas?: string[];
}
export interface ITrackDoc extends Document {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    domain: string;
    focusAreas?: string[];
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Track: Model<ITrackDoc>;
export declare function getTracks(): Promise<TrackItem[]>;
/** Returns 4 tracks for home based on user's primaryFocus (same logic as frontend HomeScreen). */
export declare function getPreferredTracks(tracks: TrackItem[], primaryFocus: string | null): TrackItem[];
//# sourceMappingURL=Track.d.ts.map
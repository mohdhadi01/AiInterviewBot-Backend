import { type Document, type Model } from 'mongoose';
export interface TrackItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    domain: string;
}
export interface IFeedItemDoc extends Document {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    domain: string;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FeedItem: Model<IFeedItemDoc>;
export declare function getFeedItems(): Promise<TrackItem[]>;
//# sourceMappingURL=FeedItem.d.ts.map
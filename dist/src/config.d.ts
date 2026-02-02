import 'dotenv/config';
export declare const env: {
    readonly nodeEnv: string;
    readonly port: number;
    readonly mongodbUri: string;
};
export declare function connectDb(): Promise<void>;
//# sourceMappingURL=config.d.ts.map
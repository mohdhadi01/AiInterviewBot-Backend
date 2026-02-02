/** Focus option for onboarding / change focus screen. iconId maps to Lucide icon in app (FOCUS_ICON_MAP). */
export interface FocusItemDTO {
    id: string;
    label: string;
    desc: string;
    iconId?: string;
}
/** Same list as frontend src/constants/focusData.ts (for onboarding & change focus screen). */
export declare const FOCUS_OPTIONS: FocusItemDTO[];
export declare function getFocusOptions(): FocusItemDTO[];
/** Maps each focus ID to domain names (track.domain). Same as frontend HomeScreen FOCUS_TO_DOMAINS. */
export declare const FOCUS_TO_DOMAINS: Record<string, string[]>;
//# sourceMappingURL=Focus.d.ts.map
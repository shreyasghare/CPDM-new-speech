export interface Data {
    adrStatuses: string[];
    defaultAdrStatus: string;
}

export default interface AdrStatus {
    success: boolean;
    data: Data;
}

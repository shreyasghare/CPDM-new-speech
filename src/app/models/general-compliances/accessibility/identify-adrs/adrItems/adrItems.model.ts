export interface Comment {
    comment: string;
    timestamp: any;
    userId: string;
}

export interface AdrItem {
    _id: string;
    adrType: string;
    adrId: string;
    position: number;
    criteria: string;
    section: string;
    description: string;
    priority: number;
    active: string;
    docDesc: string[];
    refId: string;
    applicable: boolean;
    newComment: boolean;
    status: string;
    comments: Comment[];
    default?: boolean;
}

interface Data {
    _id: string;
    adrItems: AdrItem[];
    notSelectedAdrItems?: AdrItem[];
    selectedAdrItems?: AdrItem[];
}

export interface AdrItems {
    success: boolean;
    data: Data;
}






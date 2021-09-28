export interface Comment {
    comment: string;
    timestamp: Date;
    userId: string;
}

export interface Adr {
    _id: string;
    refId: string;
    name: string;
    description: string;
    criteria: string;
    docDesc: string[];
    priority: number;
    newComment?: boolean;
    applicable?: boolean;
    comments?: Comment[];
    active?: boolean;
    adrType?: string;
}
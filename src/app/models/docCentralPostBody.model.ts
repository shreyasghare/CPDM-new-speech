export interface DocCentralPostBody {
    title: string;
    description: string;
    folderPath: string;
    workflow?: string;
    status?: string;
    securityLevel?: string;
    docType?: string;
    permissions?: string;
    projectId?: string;
}

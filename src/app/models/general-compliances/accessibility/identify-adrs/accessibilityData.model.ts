import { DocCentral } from '@cpdm-model/DocCentral';
import { AdrItem } from './adrItems/adrItems.model';

interface AdrDetails {
    web: AdrItem[];
    software: AdrItem[];
    documentation: AdrItem[];
    hardware: AdrItem[];
}

interface PolicyTesting {
    isAdrDataModified: boolean;
    isSyncedToAdrChecklist: boolean;
}

interface PrepareVpat {
    word: DocCentral;
}

interface DocCentralLinks {
    prepareVpat: PrepareVpat;
    adrListApproval: DocCentral;
    policyTesting: DocCentral;
}

export interface AdrTabState {
    web: boolean;
    software: boolean;
    documentation: boolean;
    hardware: boolean;
}

export interface AdrComment {
    comment: string;
    timestamp: Date;
    userId: string;
    isApproved: boolean;
}

interface WorkflowTimestamp {
    identifiAdr: Date;
    approveAdr: Date;
    implementation: Date;
    policyTesting: Date;
    prepareVpat: Date;
    releaseVpat: Date;
}

interface SendDetails {
    featuresImpl: string;
    defectFixed: string;
    timestamp: Date;
}

interface Implementation {
    isManualImplementation: boolean;
    sendDetails: SendDetails;
}

export interface AccessibilityResData {
    adrDetails: AdrDetails;
    policyTesting: PolicyTesting;
    docCentralLinks: DocCentralLinks;
    adrTabState: AdrTabState;
    adrStatus: string;
    adrComment: AdrComment[];
    skipOverviewPM: boolean;
    skipOverviewPO: boolean;
    betaFlag: boolean;
    _id: string;
    projectId: string;
    __v: number;
    lastUser: string;
    workflowTimestamp: WorkflowTimestamp;
    implementation: Implementation;
    applicable: boolean;
}

export default interface AccessibilityData {
    success: boolean;
    data: AccessibilityResData;
}



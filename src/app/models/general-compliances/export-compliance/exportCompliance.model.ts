export interface StartExportComplianceWorkflowModel {
    success: boolean;
    data: {
        exportComplianceId: string;
    };
}
export interface ExportComplianceModel {
    _id: string;
    workflow: {
        active: 'link_generate' | 'submit_assign_classify' | 'complete';
        next: string;
        timestamp: {
            link_generate: Date;
            submit_assign_classify: Date;
            complete: Date;
        };
    };
    betaFlag: boolean;
    projectId: string;
    projectDetails: {
        name: string
    };
    isEPRProjectLinked: boolean;
    eprProjectId: string;
    isNewEPRProject: boolean;
    isEprIdUpdated: boolean;
    isWorkflowInProgress?: boolean;
    __v: number;
}

export interface ExportComplianceAssignModel extends ExportComplianceModel {
    assignedTo: string;
    caseStatus: string;
    product_name: string;
    product_mgr_name: string;
    fcs_date: Date;
}

export interface CmtToolUrlModel {
    createProjectUrl: string;
    openProjectUrl: string;
    eprProjectId?: string;
}
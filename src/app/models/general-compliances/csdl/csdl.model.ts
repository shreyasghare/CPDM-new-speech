export interface CsdlModel {
    _id: string;
    projectId: string;
    projectDetails: {
        name: string;
        owners: { cecId: string }[];
    };
    workflow: {
        active: 'create' | 'plan_execute' | 'complete';
        next: string;
        timestamp: {
            create: Date;
            plan_execute: Date;
            complete: Date;
        };
    };
    csdlProjectId: number;
    isNewCsdlProject: boolean;
    isCSDLIdUpdated: boolean;
    isCSDLIdLinked: boolean;
    isWorkflowInProgress: boolean;
    __v: number;
    betaFlag: boolean;
    projectName?: string;
}

export interface CsdlProjectModel {
    project_id: number;
    project_name: string;
    description: string;
    project_version: string;
}
export interface CsdlPlanExecuteModel {
    project_id: string;
    project_name: string;
    project_dates: {
        fcs_target_date: string;
    };
    srp_status: string;
    src: {
        src: {
            stop_ship: boolean;
            srp_link: string;
        }
    };
    psb_compliance_fcs_score: string;
    non_compliant_critical_psb: string;
    accountable_executive: {
        email: string;
    };
    csdlWorkflowId?: string;
    isSetFromPlanStep?: boolean;
    workflow?: {
        active: 'create' | 'plan_execute' | 'complete';
        next: string;
    };
}

export interface CsdlCreateNewProjectModel {
    _id: string;
    project_name: string;
    be_sbe_pf: string;
    accountable_executive: string;
    technical_leads: string;
    product_managers: string;
    program_managers: string;
    hw_sw_type: string;
    sw_version: string;
    project_type: string;
    project_status: string;
}
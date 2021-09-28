export interface TpsdModel {
    _id: string;
    workflow: {
        active: 'create_link' | 'discover_register_execute' | 'complete';
        next: string;
        timestamp: {
            create_link: Date;
            discover_register_execute: Date;
            complete: Date;
        };
    };
    betaFlag: boolean;
    projectId: string;
    projectDetails: {
        name: string
    };
    productId: string;
    releaseId: string;
    isProjectLinked: boolean;
    productState: string;
    approvedDetails:{
      state: boolean,
      comments: string,
      userId: string,
      updatedAt?: Date
    };
    productReleaseDetails: {
        isProductOnTps: boolean,
        isExistingRelease: boolean
    };
    coronaUrl?: string;
    tpsUrl?: string;
    isReinitiated: boolean;
    __v: number;
}

export interface TpsdProductModel {
    productId: number;
    releaseId: number;
    name: string;
    version: string;
    releaseType: string;
    csdlId: string;
    releaseStatus: string;
    hasDeviations: boolean;
    owner: string;
    productAdmins: string[];
    complianceURL: string;
}

export interface TpsdNewProduct {
    newProduct: newProductModel;
    productReleaseDetails: productReleaseDetailsModel;
}

export interface newProductModel {
    name: string;
    version: string;
    csdlId: string;
    securityContact: string;
    engineeringContact: string;
    productAdmins: string[];
}

export interface productReleaseDetailsModel {
    isProductOnTps: boolean;
    isExistingRelease: boolean;
}

export interface TpsdProductRelease {
    content: TpsdProductReleaseContent[];
}

export interface TpsdProductReleaseContent {
    productId: number;
    releaseId: number;
    name: string;
    version: string;
    releaseType: string;
    csdlId: number;
    releaseStatus: string;
}
export interface TpsdRegisterExecuteModel {
    content: TpsdRegisterExecuteContent[];
    metadata: TpsdModel;
}
export interface TpsdRegisterExecuteContent {
    product: {
        id: number,
        createdAt: string;
        deleted: boolean,
        name: string,
        updatedAt: string,
        coronaProductId: string
    };
    version: string;
    fcsDate: string;
    state: string;
    hasDeviations: boolean;
    csdlId: string;
}
export interface CoronaAndTpsUrlModel {
    coronaUrl: string;
    tpsUrl: string;
}

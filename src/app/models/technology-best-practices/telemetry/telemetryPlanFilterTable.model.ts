export interface TelemetryPlanFilterTableModel {
    header: HeaderModel;
    rows: RowsModel;
}

export interface HeaderModel {
    uniqueIdentifiers: {
        key: string;
        name: string;
        selected: boolean;
    };
    priority: {
        key: string;
        name: string;
        selected: boolean;
    };
    embeddedApps: {
        key: string;
        name: string;
        selected: boolean;
    };
    onOffPrem: {
        key: string;
        name: string;
        selected: boolean;
    };
    businessOperational: {
        key: string;
        name: string;
        selected: boolean;
    };
    status: {
        key: string;
        name: string;
        selected: boolean;
    };
}

export interface RowsModel {
    uniqueIdentifiers: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    priority: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    embeddedApps: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    onOffPrem: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    businessOperational: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    status: [{
        key: string;
        value: string;
        selected: boolean;
    }];
}



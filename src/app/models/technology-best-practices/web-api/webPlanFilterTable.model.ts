export interface WebPlanFilterTableModel {
        header: HeaderModel;
        rows: RowsModel;
}

export interface HeaderModel {
    priority: {
        key: string;
        name: string;
        selected: boolean;
    };
    uniqueIdentifiers: {
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
    priority: [{
        key: string;
        value: string;
        selected: boolean;
    }];
    uniqueIdentifiers: [{
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



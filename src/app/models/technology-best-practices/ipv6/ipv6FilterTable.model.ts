export interface IPv6FilterTableModel {
    header: ['Product Type', 'Priority', 'Status'];
    rows: RowsModel[];
}

export interface RowsModel {
    productType: { name: string; selected: boolean; };
    status: { name: string; selected: boolean; };
    priority: { name: string; selected: boolean; };
}

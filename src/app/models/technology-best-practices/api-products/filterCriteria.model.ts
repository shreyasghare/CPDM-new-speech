export interface FilterCriteriaModel {
    filters: FiltersModel;
}

export interface FiltersModel {
    tag: { 'recommendations.tag': string }[];
    priority: { 'recommendations.priority': string }[];
    status: { 'recommendations.status': string }[];
}

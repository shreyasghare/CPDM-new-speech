export interface TelemetryFilterCriteriaModel {
    filters: FiltersModel;
}

export interface FiltersModel {
    tag: { 'recommendations.tag': string }[];
    priority: { 'recommendations.priority': string }[];
    embeddedApps: { 'recommendations.embeddedApps': string }[];
    onOffPrem: { 'recommendations.onOffPrem': string }[];
    businessOperational: { 'recommendations.businessOperational': string }[];
    status: { 'recommendations.status': string }[];
}

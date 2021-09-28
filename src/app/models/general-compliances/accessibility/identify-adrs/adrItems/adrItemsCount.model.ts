interface SelectedAdrItems {
    web: number;
    documentation: number;
    hardware: number;
    software: number;
}

interface AllAdrItems {
    web: number;
    software: number;
    documentation: number;
    hardware: number;
    funcPerformance: number;
}

interface Data {
    selectedAdrItems: SelectedAdrItems;
    allAdrItems: AllAdrItems;
}

export default interface AdrItemsCount {
    success: boolean;
    data: Data;
}


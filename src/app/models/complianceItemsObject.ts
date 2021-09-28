export class ComplianceItemsObject {
    refId: string;
    name: string;
    owners: [] = [];
    acceptors: [] = [];
    applicability = false;
    selected = false;
    progressStatus = 'Not Started';
    progressScore = 0;
    comments = 'NA';
    complianceType = '';
  }

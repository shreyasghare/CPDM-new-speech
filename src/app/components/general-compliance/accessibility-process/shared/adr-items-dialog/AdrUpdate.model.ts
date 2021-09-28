import { AdrComment, AdrTabState } from '@cpdm-model/general-compliances/accessibility/identify-adrs/accessibilityData.model';

export default interface AdrUpdate {
    updateQuery: {
        $set: {
            adrStatus?: string;
            lastUser: 'pm' | 'po';
            adrTabState?: AdrTabState;
        },
        $push: {
            adrComment?: AdrComment;
        }
    };
}

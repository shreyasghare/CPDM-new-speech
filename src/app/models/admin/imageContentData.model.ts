export class ImageContentDataModel {
            _id: string;
            name: string;
            title: string;
            uiTitle?: string;
            thumbnailImage: string;
            originalImage: string;
            updatedOn: string;
            desc: string;
            workflow: string;
            modalSize: string;
            workflowTitle: string;
            recommendations?: [string];
            hasDraft?: boolean;
            version?: {
                latest: boolean;
                name: string;
                value: number;
            };
}

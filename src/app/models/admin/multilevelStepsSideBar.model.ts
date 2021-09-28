export class MultilevelStepsSideBarModel {
    success: boolean;
    data: [
        {
            heading: string,
            menuStack: [{
                menu: {};
                subMenu: {};
            }]
        }
    ];
}

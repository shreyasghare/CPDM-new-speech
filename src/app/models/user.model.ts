export class User {
    
    constructor(
    public name: string,
    public cecId: string,
    public cecNo: string,
    public role: string,
    public isAdmin: boolean,
    public hasAccessTo?:[{
        value:string,
        name:string,
        isDefault:boolean
    }]
    ){}


   


}

type typeOfPermissions = 'owner' | 'reader' | 'viewer';

export interface DocCentralPermission {
    authority: string;
    permission: typeOfPermissions;
}

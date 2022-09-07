export interface BLENuvIoTDevice {
    name: string;
    peripheralId: string;
    provisioned: boolean;
    
    orgId?: string;
    repoId?: string;
    id?: string;
}
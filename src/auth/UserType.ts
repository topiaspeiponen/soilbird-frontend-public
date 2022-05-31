export interface UserType {
    id: number,
    name: string,
    credential_level: CredentialLevel
}

export type CredentialLevelString = keyof typeof CredentialLevel

export enum CredentialLevel {
    worker,
    manager,
    admin,
    root
}
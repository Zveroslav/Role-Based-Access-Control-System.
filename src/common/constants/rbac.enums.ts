export enum RoleName {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  VIEWER = 'Viewer',
}

export enum ResourceType {
  PATIENT_RECORD = 'PatientRecord',
}

export enum Action {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
}

export enum Scope {
  OWN = 'OWN',
  ORG = 'ORG',
  GLOBAL = 'GLOBAL',
}

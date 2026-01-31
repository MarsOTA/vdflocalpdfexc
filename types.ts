
export type ScreenType = 'DASHBOARD' | 'STAFF' | 'CREAZIONE' | 'GENERATORE';

export type UserRole = 
  | 'REDATTORE' 
  | 'APPROVATORE' 
  | 'COMPILATORE_A' 
  | 'COMPILATORE_B' 
  | 'COMPILATORE_C' 
  | 'COMPILATORE_D';

export enum EventStatus {
  IN_COMPILAZIONE = 'IN COMPILAZIONE',
  ATTESA_APPROVAZIONE = 'ATTESA APPROVAZIONE',
  APPROVATO = 'APPROVATO',
  CRITICO = 'CRITICO',
  COMPLETATO = 'COMPLETATO'
}

export interface VehicleRequirements {
  APS: number;
  AS: number;
  ABP: number;
}

export interface PersonnelRequirement {
  role: 'DIR' | 'CP' | 'VIG' | 'AUT' | 'ALTRO';
  qty: number;
  assignedIds: (string | null)[]; // Array di dimensione 'qty', mantiene la posizione dello slot
  entrustedGroups?: (string | null)[]; // Array di dimensione 'qty'
  specializations?: string[];
}

export interface OperationalEvent {
  id: string;
  code: string;
  location: string;
  date: string;
  timeWindow: string;
  status: EventStatus;
  vehicles: VehicleRequirements;
  requirements: PersonnelRequirement[];
  approvedByAdmin?: boolean;
  isOlympic?: boolean;
  requiredSpecializations?: string[];
  createdBy?: string;
}

export interface Operator {
  id: string;
  name: string;
  rank: string;
  group: string; // A, B, C, D
  subgroup: string; // A1, A2...
  qualification: 'DIR' | 'CP' | 'VIG' | 'AUT' | 'ALTRO';
  available: boolean;
  statusMessage?: string;
  assignedHours: number;
  specializations?: string[];
  sede?: string; // Sede di appartenenza
  tipoPatente?: string; // Nuova proprietà
}
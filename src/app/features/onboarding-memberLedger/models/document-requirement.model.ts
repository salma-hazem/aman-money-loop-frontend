export interface DocumentRequirement {
  documentRequirementId: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
}
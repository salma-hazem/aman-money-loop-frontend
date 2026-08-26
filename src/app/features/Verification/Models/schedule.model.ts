export enum ScheduleStatus {
  Pending = 0,
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3
}
export interface CreateVerificationSchedule {
  applicationId: string;
  verificationRoundId: string;
  scheduledByUserId: string;
  scheduledDateTime: string | Date;
  locationOrLink?: string;
  sendCalendarInvite: boolean;
}

export interface VerificationScheduleResponse {
  verificationScheduleId: string;
  applicationId: string;
  verificationRoundId: string;
  scheduledByUserId: string;
  scheduledDateTime: string | Date;
  locationOrLink?: string;
  status: ScheduleStatus;
}
export interface UpdateVerificationSchedule {
  status: ScheduleStatus;
}

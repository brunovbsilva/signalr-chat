export interface IMessage {
  from?: string;
  to?: string;
  content: string;
  timespan: Date;
  mine: boolean;
  system: boolean;
}
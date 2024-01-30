import { IMessage } from "../interfaces/message.interface";
import { MessageType } from "./message-type.enum";

export class Message implements IMessage {
  timespan: Date;
  from?: string;
  to?: string;
  content: string;
  mine: boolean;
  system: boolean;

  constructor(message: IMessage, type: MessageType = MessageType.OTHER) {
    this.timespan = message.timespan ?? new Date();
    this.from = message.from;
    this.to = message.to;
    this.content = message.content;
    this.mine = type === MessageType.MINE;
    this.system = type === MessageType.SYSTEM;
  }
}
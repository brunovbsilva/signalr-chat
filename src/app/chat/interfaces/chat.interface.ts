import { IMessage } from "./message.interface";

export interface IChat {
  name: string;
  messages: IMessage[];

  addMessage(message: IMessage): void;
}
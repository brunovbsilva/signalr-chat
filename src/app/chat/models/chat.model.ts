import { IChat } from "../interfaces/chat.interface";
import { IMessage } from "../interfaces/message.interface";

export class Chat implements IChat {
  name: string;
  messages: IMessage[] = [];

  constructor(chatName: string) {
    this.name = chatName;
  }
  
  addMessage(message: IMessage): void {
    this.messages.push(message);
  }
}
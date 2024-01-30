import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../models/user.interface';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../chat/models/message.model';
import { Chat } from '../chat/models/chat.model';
import { IMessage } from '../chat/interfaces/message.interface';
import { MessageType } from '../chat/models/message-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private myName!: string;
  private chatConnection?: HubConnection;
  public get connectionExists() {
    return !!this.chatConnection;
  }
  private chats = signal<Chat[]>([new Chat('General')]);
  chats$ = this.chats.asReadonly();
  chatUsers = signal<string[]>([]);
  chatUsers$ = this.chatUsers.asReadonly();
  chatNames$ = computed<string[]>(() => {
    return this.chats().map(chat => chat.name);
  });

  constructor(private httpClient: HttpClient) { }

  registerUser(user: User) {
    return this.httpClient.post(`${environment.apiUrl}api/chat/register-user`, user, { responseType: 'text' });
  }

  createChatConnection(name: string) {
    this.myName = name;

    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}hubs/chat`)
      .withAutomaticReconnect()
      .build();

    this.chatConnection.start().catch(err => console.error(err));

    this.chatConnection.on('UserConnected', () => {
      this.addUserConnectionId(name);
    });

    this.chatConnection.on('OnlineUsers', (onlineUsers: string[]) => {
      this.chatUsers.update(() => onlineUsers);
    });

    this.chatConnection.on('chatMessages', (message: IMessage) => {
      this.updateGeneralChat(new Message(message, this.getMessageType(message.from)));
    });

    this.chatConnection.on('NewPrivateMessage', (message: IMessage) => {
      this.newPrivateMessage(new Message(message, this.getMessageType(message.from)));
    });
  }

  //#region Connections
  async addUserConnectionId(name: string) {
    return this.chatConnection?.invoke('addUserConnectionId', name)
      .catch(err => console.error(err));
  }

  stopConnection() {
    return this.chatConnection?.stop()
      .catch(err => console.error(err));
  }
  //#endregion

  //#region Messages
  async sendMessage(message: string) {
    return this.chatConnection?.invoke('sendMessage', message)
      .catch(err => console.error(err));
  }

  async sendPrivateMessage(message: string, user: string) {
    return this.chatConnection?.invoke('sendPrivateMessage', message, user)
      .catch(err => console.error(err));
  }

  private newPrivateMessage(message: IMessage) {
    const chat = this.chats().find(chat => [message.from, message.to].includes(chat.name));
    if(!chat) {
      let newChat = new Chat(message.from!);
      newChat.addMessage(message);
      this.chats.update(chats => [...chats, newChat]);
    }
    else {
      this.chats.update(chats => {
        chats.find(chatz => chatz == chat)?.addMessage(message);
        return chats;
      });
    }
  }

  private getMessageType(author?: string): MessageType {
    if(author === undefined) return MessageType.SYSTEM;
    if(author === this.myName) return MessageType.MINE;
    return MessageType.OTHER;
  }
  //#endregion

  //#region Chats controller
  async createPrivateChat(users: string) {
    return this.chatConnection?.invoke('createPrivateChat', users)
      .catch(err => console.error(err));
  }

  private updateGeneralChat(message: IMessage) {
    this.chats.update(chats => {
      chats.find(chat => chat.name === 'General')!.addMessage(message);
      return chats;
    });
  }

  closePrivateChat(user: string) {
    this.chats.update(chats => chats.filter(chat => chat.name !== user));
  }

  openPrivateChat(user: string) {
    const chat = this.chats().find(chat => chat.name === user);
    if(!chat) {
      this.chats.update(chats => [...chats, new Chat(user)]);
    }
  }
  //#endregion
}

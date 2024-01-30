import { Component, OnDestroy, OnInit, computed, effect, signal } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Message } from './models/message.model';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    RouterModule,
    MessageComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export default class ChatComponent implements OnInit, OnDestroy {

  myName!: string;

  protected chats = this.chatService.chats$;
  protected currentChat = signal<string>('General');

  protected chatNames = this.chatService.chatNames$;
  protected chatUsers = this.chatService.chatUsers$;
  protected chatMessages = computed<Message[]>(() => {
    return this.chats().find(chat => chat.name === this.currentChat())?.messages || [];
  });

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: params => {
        this.myName = params['name'];
        this.createChatConnection(this.myName);
      },
      error: err => console.error(err)
    });
  }

  goToHome() {
    this.router.navigate(['']);
  }

  setChat(name: string) {
    this.chatService.createPrivateChat(name);
    this.currentChat.set(name);
  }

  getMessageType(author?: string) {
    if(author === undefined) return 'system';
    if(author === this.myName) return 'me';
    return 'other';
  }

  sendMessage(message: string) {
    if(!message) return;
    if(this.currentChat() === 'General')
      this.chatService.sendMessage(message);
    else
      this.chatService.sendPrivateMessage(message, this.currentChat());
  }

  openPrivateChat(user: string) {
    this.chatService.openPrivateChat(user);
    this.setChat(user);
  }

  closePrivateChat(user: string) {
    this.chatService.closePrivateChat(user);
    if(this.currentChat() === user) {
      this.currentChat.set('General');
    }
  }

  private createChatConnection(name: string) {
    if(!!name) {
      this.chatService.createChatConnection(name)
    }
    else {
      console.error('No name provided');
    }
  }

  private getDifferenceBetweenLists<T>(list1: T[], list2: T[]) {
    return list1.filter(user => !list2.includes(user));
  }
}

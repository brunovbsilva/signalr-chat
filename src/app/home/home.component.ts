import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {
  userForm: FormGroup = new FormGroup({});
  apiErrorMessages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    });
  }

  submitForm() {
    this.apiErrorMessages = [];
    if (this.userForm.valid) {
      this.chatService.registerUser(this.userForm.value).subscribe({
        next: () => {
          this.router.navigate(['/chat'], { queryParams: { name: this.userForm.value.name } });
        },
        error: (err) => {
          if(typeof err.error !== 'object') {
           this.apiErrorMessages.push(err.error);
          }
        }
      })
    }
  }
}

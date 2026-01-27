import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  
   name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeToTerms: boolean = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!this.agreeToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // TODO: Implement actual registration logic
    console.log('Registration attempt:', {
      name: this.name,
      email: this.email,
      password: this.password
    });
    
    // For now, just navigate to login
    // this.router.navigate(['/auth/login']);
  }
}
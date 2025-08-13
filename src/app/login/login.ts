import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  animations: [
    trigger('slideInOut', [
      transition('* => *', [
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('welcomeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class Login implements OnInit {
  loginForm: FormGroup;
  currentStep = 0;
  totalSteps = 2;
  isLoading = false;
  showWelcome = false;
  touchedFields: { [key: string]: boolean } = {};
  usernameErrorMatcher: ErrorStateMatcher;
  passwordErrorMatcher: ErrorStateMatcher;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.usernameErrorMatcher = {
      isErrorState: (control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return !!(control && control.invalid && this.touchedFields['username'] && control.touched);
      }
    };

    this.passwordErrorMatcher = {
      isErrorState: (control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return !!(control && control.invalid && this.touchedFields['password'] && control.touched);
      }
    };
  }

  ngOnInit(): void {
    // Start at step 1 (0% progress)
    this.currentStep = 0;
  }

  get progressValue(): number {
    if (this.showWelcome) {
      return 100; // Welcome step
    } else if (this.currentStep === 0) {
      return 0; // Step 1
    } else {
      return 50; // Step 2
    }
  }

  get currentStepForAnimation(): number {
    if (this.showWelcome) {
      return 2; // Welcome step
    }
    return this.currentStep;
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  nextStep(): void {
    if (this.currentStep === 0 && this.usernameControl?.valid) {
      this.currentStep = 1;
    } else if (this.currentStep === 1 && this.passwordControl?.valid) {
      this.completeLogin();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 0) {
      return this.usernameControl?.valid || false;
    }
    return this.passwordControl?.valid || false;
  }

  onFieldTouch(fieldName: string): void {
    this.touchedFields[fieldName] = true;
  }

  shouldShowError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return this.touchedFields[fieldName] && control?.invalid && control?.touched || false;
  }

  private completeLogin(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.showWelcome = true;
      
      // Navigate to dashboard after showing welcome message
      setTimeout(() => {
        // this.router.navigate(['/dashboard']);
      }, 2000);
    }, 1500);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.canProceed()) {
      this.nextStep();
    }
  }

  resetForm(): void {
    this.currentStep = 0;
    this.showWelcome = false;
    this.loginForm.reset();
    this.touchedFields = {};
  }
}

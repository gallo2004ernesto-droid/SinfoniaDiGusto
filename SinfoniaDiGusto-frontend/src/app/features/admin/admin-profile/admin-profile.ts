import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AdminHeader } from '../../../shared/component/admin-header/admin-header';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminHeader],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AdminAuthService);

  isUpdatingProfile = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);
  profileMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  passwordMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Dati Personali
  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: [{ value: 'ADMIN', disabled: true }]
  });

  // Form Cambio Password
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // ngOnInit(): void {
  //   // Carica dati utente corrente dal servizio Auth
  //   const currentUser = this.authService.getCurrentUser();
  //   if (currentUser) {
  //     this.profileForm.patchValue({
  //       name: currentUser.name,
  //       email: currentUser.email
  //     });
  //   }
  // }

  // Custom Validator per la conferma password
  
  ngOnInit(): void {
  this.authService.fetchProfile().subscribe({
    next: (user) => {
      console.log('PROFILO RICEVUTO:', user);

      this.profileForm.patchValue({
        name: user.firstName,
        email: user.email
      });

      console.log('VALORI FORM:', this.profileForm.getRawValue());
    },
    error: (err) => {
      console.error('Errore caricamento profilo:', err);
    }
  });
}


  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass && confirmPass && newPass !== confirmPass ? { passwordMismatch: true } : null;
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);
    this.profileMessage.set(null);

    const { name, email } = this.profileForm.getRawValue();

    this.authService.updateProfile({ name, email }).subscribe({
      next: () => {
        this.isUpdatingProfile.set(false);
        this.profileMessage.set({ text: 'Profilo aggiornato con successo!', type: 'success' });
      },
      error: (err) => {
        console.error('Errore aggiornamento profilo:', err);
        this.isUpdatingProfile.set(false);
        this.profileMessage.set({ text: 'Errore durante l\'aggiornamento del profilo.', type: 'error' });
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordMessage.set(null);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({ text: 'Password modificata con successo!', type: 'success' });
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error('Errore cambio password:', err);
        this.isChangingPassword.set(false);
        this.passwordMessage.set({ text: 'Password attuale non corretta o errore di sistema.', type: 'error' });
      }
    });
  }
}
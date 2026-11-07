import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

@Component({
  selector: 'app-password-checklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-checklist.component.html',
  styleUrls: ['./password-checklist.component.scss']
})
export class PasswordChecklistComponent {
  @Input() password = '';

  readonly rules: PasswordRule[] = [
    { label: 'At least 8 characters',        test: pw => pw.length >= 8 },
    { label: 'Contains an uppercase letter', test: pw => /[A-Z]/.test(pw) },
    { label: 'Contains a lowercase letter',  test: pw => /[a-z]/.test(pw) },
    { label: 'Contains a number',            test: pw => /[0-9]/.test(pw) },
    { label: 'Contains a special character', test: pw => /[^A-Za-z0-9]/.test(pw) }
  ];

  get allPass(): boolean {
    return this.rules.every(r => r.test(this.password));
  }
}

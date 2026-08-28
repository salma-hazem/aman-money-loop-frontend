import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LanguageSwitcherComponent,
  ],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
})
export class PublicShellComponent {
  readonly auth = inject(AuthService);
  readonly language = inject(LanguageService);
}

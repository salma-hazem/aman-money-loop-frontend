import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <button
      type="button"
      class="language-switcher"
      (click)="language.toggle()"
      [attr.aria-label]="accessibleLabel"
      [attr.title]="targetLanguageLabel"
    >
      <i class="pi pi-language" aria-hidden="true"></i>
      <span>{{ shortLabel }}</span>
    </button>
  `,
  styles: `
    .language-switcher {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .4rem;
      padding: .35rem .65rem;
      border: 1px solid var(--p-surface-300);
      border-radius: 999px;
      background: var(--p-surface-0);
      color: var(--p-surface-700);
      font: inherit;
      font-size: .78rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .language-switcher:hover {
      border-color: var(--p-primary-400);
      color: var(--p-primary-700);
      background: var(--p-primary-50);
    }
  `,
})
export class LanguageSwitcherComponent {
  readonly language = inject(LanguageService);

  get accessibleLabel(): string {
    return this.language.isArabic() ? 'Switch to English' : '\u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0628\u064a\u0629';
  }

  get targetLanguageLabel(): string {
    return this.language.isArabic() ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
  }

  get shortLabel(): string {
    return this.language.isArabic() ? 'EN' : '\u0639\u0631\u0628\u064a';
  }
}

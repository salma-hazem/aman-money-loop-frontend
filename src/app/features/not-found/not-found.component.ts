import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="not-found">
      <div class="code">404</div>
      <span class="eyebrow">Page not found</span>
      <h1>This page is outside the loop.</h1>
      <p>The address may be incorrect, or the page may have moved.</p>
      <a [routerLink]="auth.isLoggedIn() ? '/console' : '/'">
        <i class="pi pi-arrow-left"></i>
        {{ auth.isLoggedIn() ? 'Return to Dashboard' : 'Return Home' }}
      </a>
    </main>
  `,
  styles: [`
    .not-found { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; background: radial-gradient(circle at top, var(--p-highlight-background), var(--p-surface-50) 48%); }
    .code { color: color-mix(in srgb, var(--p-primary-500), transparent 82%); font-size: clamp(6rem, 18vw, 12rem); font-weight: 900; line-height: .8; }
    .eyebrow { margin-top: 1.5rem; color: var(--p-primary-600); font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: .5rem 0; font-size: clamp(1.5rem, 4vw, 2.4rem); }
    p { margin-bottom: 1.5rem; }
    a { display: inline-flex; align-items: center; gap: .5rem; padding: .75rem 1rem; border-radius: 10px; background: var(--p-primary-600); color: white; font-weight: 700; text-decoration: none; }
  `],
})
export class NotFoundComponent {
  readonly auth = inject(AuthService);
}


import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-console-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ConfirmDialogModule],
  templateUrl: './console-shell.component.html',
  styleUrl: './console-shell.component.scss',
})
export class ConsoleShellComponent {
  readonly isMobile = signal(window.innerWidth <= 900);
  readonly sidebarCollapsed = signal(this.isMobile());

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  closeMobileSidebar(): void {
    if (this.isMobile()) this.sidebarCollapsed.set(true);
  }

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth <= 900;
    if (mobile !== this.isMobile()) {
      this.isMobile.set(mobile);
      this.sidebarCollapsed.set(mobile);
    }
  }
}

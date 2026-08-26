import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const savedTheme = localStorage.getItem('aml_theme');
document.documentElement.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : 'light');

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

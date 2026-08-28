import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';

/** Carries the UI language to API validation, emails, and generated documents. */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const language = inject(LanguageService);
  return next(req.clone({
    setHeaders: { 'Accept-Language': language.locale() },
  }));
};

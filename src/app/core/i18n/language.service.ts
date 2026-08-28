import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { Translation } from 'primeng/api';
import { ARABIC_TRANSLATIONS } from './arabic-translations';

export type AppLanguage = 'en' | 'ar';

const STORAGE_KEY = 'aml_language';
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'] as const;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly primeNg = inject(PrimeNG);
  private readonly originals = new WeakMap<Node, string>();
  private readonly attributeOriginals = new WeakMap<Element, Map<string, string>>();
  private observer?: MutationObserver;

  readonly language = signal<AppLanguage>(this.readInitialLanguage());
  readonly isArabic = computed(() => this.language() === 'ar');
  readonly locale = computed(() => (this.isArabic() ? 'ar-EG' : 'en-EG'));
  readonly direction = computed(() => (this.isArabic() ? 'rtl' : 'ltr'));

  constructor() {
    this.applyDocumentLanguage();
    this.applyPrimeNgLanguage();
    this.startDomTranslation();
  }

  setLanguage(language: AppLanguage): void {
    if (language === this.language()) return;

    this.language.set(language);
    localStorage.setItem(STORAGE_KEY, language);
    this.applyDocumentLanguage();
    this.applyPrimeNgLanguage();
    this.translateSubtree(this.document.documentElement);
    this.document.dispatchEvent(new CustomEvent('aml-language-change', { detail: language }));
  }

  toggle(): void {
    this.setLanguage(this.isArabic() ? 'en' : 'ar');
  }

  translate(source: string): string {
    if (!this.isArabic()) return source;
    const exact = ARABIC_TRANSLATIONS[source.trim()];
    if (exact) return exact;

    const months = source.trim().match(/^(\d+)\s+months?$/i);
    if (months) return `${months[1]} شهر`;

    const slot = source.trim().match(/^Slot\s+(\d+)$/i);
    if (slot) return `المكان ${slot[1]}`;

    const monthNames: Readonly<Record<string, string>> = {
      January: 'يناير', February: 'فبراير', March: 'مارس', April: 'أبريل',
      May: 'مايو', June: 'يونيو', July: 'يوليو', August: 'أغسطس',
      September: 'سبتمبر', October: 'أكتوبر', November: 'نوفمبر', December: 'ديسمبر',
      Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', Jun: 'يونيو',
      Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر',
    };
    let localizedDate = source;
    for (const [english, arabic] of Object.entries(monthNames)) {
      localizedDate = localizedDate.replace(new RegExp(`\\b${english}\\b`, 'g'), arabic);
    }
    if (localizedDate !== source) return localizedDate;

    const localizedCurrency = source.replace(/\bEGP\b/g, 'ج.م.');
    if (localizedCurrency !== source) return localizedCurrency;

    return source;
  }

  private readInitialLanguage(): AppLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  }

  private applyDocumentLanguage(): void {
    const html = this.document.documentElement;
    html.lang = this.language();
    html.dir = this.direction();
    html.setAttribute('data-language', this.language());
    this.document.title = this.isArabic() ? 'أمان ماني لوب' : 'Aman Money Loop';
  }

  private applyPrimeNgLanguage(): void {
    this.primeNg.setTranslation(this.isArabic() ? ARABIC_PRIMENG : ENGLISH_PRIMENG);
  }

  private startDomTranslation(): void {
    queueMicrotask(() => this.translateSubtree(this.document.documentElement));
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          this.translateElementAttributes(mutation.target);
          continue;
        }
        if (mutation.type === 'characterData') {
          this.translateTextNode(mutation.target);
          continue;
        }

        for (const node of Array.from(mutation.addedNodes)) {
          this.translateSubtree(node);
        }
      }
    });
    this.observer.observe(this.document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });
  }

  private translateSubtree(root: Node): void {
    if (root.nodeType === Node.TEXT_NODE) {
      this.translateTextNode(root);
      return;
    }

    if (!(root instanceof Element)) return;
    this.translateElementAttributes(root);

    const walker = this.document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      if (current.nodeType === Node.TEXT_NODE) this.translateTextNode(current);
      else if (current instanceof Element) this.translateElementAttributes(current);
      current = walker.nextNode();
    }
  }

  private translateTextNode(node: Node): void {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName)) return;

    const current = node.textContent ?? '';
    const stored = this.originals.get(node);
    const storedTranslation = stored ? ARABIC_TRANSLATIONS[stored.trim()] : undefined;

    if (!stored || (current !== stored && current.trim() !== storedTranslation)) {
      this.originals.set(node, current);
    }

    const original = this.originals.get(node) ?? current;
    const translated = this.translate(original);
    const leading = original.match(/^\s*/)?.[0] ?? '';
    const trailing = original.match(/\s*$/)?.[0] ?? '';
    const next = this.isArabic() && translated !== original
      ? `${leading}${translated.trim()}${trailing}`
      : original;

    if (current !== next) node.textContent = next;
  }

  private translateElementAttributes(element: Element): void {
    let originals = this.attributeOriginals.get(element);
    if (!originals) {
      originals = new Map<string, string>();
      this.attributeOriginals.set(element, originals);
    }

    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      const current = element.getAttribute(attribute);
      if (current === null) continue;
      const stored = originals.get(attribute);
      const storedTranslation = stored ? this.translate(stored) : undefined;
      if (!stored || (current !== stored && current !== storedTranslation)) {
        originals.set(attribute, current);
      }

      const original = originals.get(attribute) ?? current;
      const next = this.isArabic() ? this.translate(original) : original;
      if (current !== next) element.setAttribute(attribute, next);
    }
  }
}

const ENGLISH_PRIMENG: Translation = {
  accept: 'Yes', reject: 'No', choose: 'Choose', upload: 'Upload', cancel: 'Cancel',
  clear: 'Clear', apply: 'Apply', today: 'Today', emptyMessage: 'No results found',
  emptyFilterMessage: 'No results found', firstDayOfWeek: 0, dateFormat: 'mm/dd/yy',
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  aria: { close: 'Close', previous: 'Previous', next: 'Next', selectAll: 'Select all', unselectAll: 'Unselect all' },
};

const ARABIC_PRIMENG: Translation = {
  accept: 'نعم', reject: 'لا', choose: 'اختيار', upload: 'رفع', cancel: 'إلغاء',
  clear: 'مسح', apply: 'تطبيق', today: 'اليوم', emptyMessage: 'لا توجد نتائج',
  emptyFilterMessage: 'لا توجد نتائج', firstDayOfWeek: 6, dateFormat: 'dd/mm/yy',
  dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  aria: { close: 'إغلاق', previous: 'السابق', next: 'التالي', selectAll: 'تحديد الكل', unselectAll: 'إلغاء تحديد الكل' },
};

import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private fallbackApplied = false;

  @Input() appImageFallback: string = APP_CONSTANTS.FALLBACK_IMAGE;

  @HostListener('error')
  onError(): void {
    if (this.fallbackApplied) return;
    this.fallbackApplied = true;
    const img = this.el.nativeElement;
    img.src = this.appImageFallback || APP_CONSTANTS.FALLBACK_IMAGE;
    img.classList.add('img-fallback-applied');
  }
}

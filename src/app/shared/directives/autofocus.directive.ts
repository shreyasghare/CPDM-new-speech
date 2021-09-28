import { Directive, AfterViewInit, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  private focus = true;
  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    if (this.focus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 100);
    }
  }

  @Input() set appAutofocus(condition: boolean) {
      this.focus = condition !== false;
  }
}

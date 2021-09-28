import { Directive, ElementRef, OnInit, HostListener, HostBinding } from '@angular/core';

@Directive({
    selector: '[addActiveClass]'
})

export class ActiveClassDirecive implements OnInit {
    @HostBinding('class.active') isActive = false;


    constructor(private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event']) toggleActive(event: Event) {
       this.isActive = this.elementRef.nativeElement.contains(event.target) ? !this.isActive : false;
    }

    ngOnInit() {

    }


}

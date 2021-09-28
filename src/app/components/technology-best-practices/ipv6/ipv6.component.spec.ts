import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IPv6Component } from './ipv6.component';

xdescribe('IPv6Component', () => {
  let component: IPv6Component;
  let fixture: ComponentFixture<IPv6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IPv6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IPv6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

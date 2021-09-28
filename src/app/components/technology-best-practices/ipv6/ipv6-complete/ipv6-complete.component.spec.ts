import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ipv6CompleteComponent } from './ipv6-complete.component';

xdescribe('Ipv6CompleteComponent', () => {
  let component: Ipv6CompleteComponent;
  let fixture: ComponentFixture<Ipv6CompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ipv6CompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ipv6CompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

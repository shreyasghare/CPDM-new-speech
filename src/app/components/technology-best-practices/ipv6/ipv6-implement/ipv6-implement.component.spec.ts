import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ipv6ImplementComponent } from './ipv6-implement.component';

xdescribe('Ipv6ImplementComponent', () => {
  let component: Ipv6ImplementComponent;
  let fixture: ComponentFixture<Ipv6ImplementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ipv6ImplementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ipv6ImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

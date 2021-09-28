import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoEloComponent } from './demo-elo.component';

xdescribe('DemoEloComponent', () => {
  let component: DemoEloComponent;
  let fixture: ComponentFixture<DemoEloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoEloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoEloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

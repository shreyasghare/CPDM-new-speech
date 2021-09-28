import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareVpatComponent } from './prepare-vpat.component';

xdescribe('PreapreVpatComponent', () => {
  let component: PrepareVpatComponent;
  let fixture: ComponentFixture<PrepareVpatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepareVpatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepareVpatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

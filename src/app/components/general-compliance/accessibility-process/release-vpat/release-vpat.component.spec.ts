import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseVpatComponent } from './release-vpat.component';

xdescribe('ReleaseVpatComponent', () => {
  let component: ReleaseVpatComponent;
  let fixture: ComponentFixture<ReleaseVpatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseVpatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseVpatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

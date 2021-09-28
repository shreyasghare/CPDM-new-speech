import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureErrorComponent } from './feature-error.component';

xdescribe('FeatureErrorComponent', () => {
  let component: FeatureErrorComponent;
  let fixture: ComponentFixture<FeatureErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

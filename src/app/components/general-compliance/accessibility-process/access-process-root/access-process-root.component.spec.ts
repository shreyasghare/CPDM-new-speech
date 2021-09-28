import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessProcessRootComponent } from './access-process-root.component';

xdescribe('AccessProcessRootComponent', () => {
  let component: AccessProcessRootComponent;
  let fixture: ComponentFixture<AccessProcessRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessProcessRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessProcessRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

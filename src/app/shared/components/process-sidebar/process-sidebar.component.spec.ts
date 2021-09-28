import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';

xdescribe('ProcessSidebarComponent', () => {
  let component: ProcessSidebarComponent;
  let fixture: ComponentFixture<ProcessSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

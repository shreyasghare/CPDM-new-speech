import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAdrChecklistDialogComponent } from './import-adr-checklist-dialog.component';

xdescribe('ImportAdrChecklistDialogComponent', () => {
  let component: ImportAdrChecklistDialogComponent;
  let fixture: ComponentFixture<ImportAdrChecklistDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportAdrChecklistDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAdrChecklistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

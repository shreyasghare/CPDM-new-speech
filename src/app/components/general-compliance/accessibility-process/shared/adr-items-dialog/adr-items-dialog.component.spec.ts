import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdrItemsDialogComponent } from './adr-items-dialog.component';

xdescribe('AdrItemsDialogComponent', () => {
  let component: AdrItemsDialogComponent;
  let fixture: ComponentFixture<AdrItemsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdrItemsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdrItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

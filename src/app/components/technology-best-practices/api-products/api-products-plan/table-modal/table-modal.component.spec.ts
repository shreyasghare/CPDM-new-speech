import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableModalComponent } from './table-modal.component';

xdescribe('TableModalComponent', () => {
  let component: TableModalComponent;
  let fixture: ComponentFixture<TableModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

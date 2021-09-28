import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyItemsTableComponent } from './technology-items-table.component';

xdescribe('TechnologyItemsTableComponent', () => {
  let component: TechnologyItemsTableComponent;
  let fixture: ComponentFixture<TechnologyItemsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TechnologyItemsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnologyItemsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

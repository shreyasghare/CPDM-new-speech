import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReccomendationEditTableComponent } from './reccomendation-edit-table.component';

describe('ReccomendationEditTableComponent', () => {
  let component: ReccomendationEditTableComponent;
  let fixture: ComponentFixture<ReccomendationEditTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReccomendationEditTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReccomendationEditTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

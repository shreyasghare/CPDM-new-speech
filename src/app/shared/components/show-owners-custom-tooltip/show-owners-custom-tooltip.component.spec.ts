import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowOwnersCustomTooltipComponent } from './show-owners-custom-tooltip.component';

xdescribe('ShowOwnersCustomTooltipComponent', () => {
  let component: ShowOwnersCustomTooltipComponent;
  let fixture: ComponentFixture<ShowOwnersCustomTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowOwnersCustomTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowOwnersCustomTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ipv6RecommendationsModalComponent } from './ipv6-recommendations-modal.component';

xdescribe('Ipv6RecommendationsModalComponent', () => {
  let component: Ipv6RecommendationsModalComponent;
  let fixture: ComponentFixture<Ipv6RecommendationsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ipv6RecommendationsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ipv6RecommendationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

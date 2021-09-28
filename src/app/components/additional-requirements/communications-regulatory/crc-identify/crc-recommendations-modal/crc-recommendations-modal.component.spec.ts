import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrcRecommendationsModalComponent } from './crc-recommendations-modal.component';

describe('CrcRecommendationsModalComponent', () => {
  let component: CrcRecommendationsModalComponent;
  let fixture: ComponentFixture<CrcRecommendationsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcRecommendationsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcRecommendationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

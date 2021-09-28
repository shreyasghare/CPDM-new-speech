import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdrListApprovalComponent } from './adr-list-approval.component';

xdescribe('AdrListApprovalPmComponent', () => {
  let component: AdrListApprovalComponent;
  let fixture: ComponentFixture<AdrListApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdrListApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdrListApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDetailsAdminComponent } from './edit-details-admin.component';


xdescribe('EditModalsInfoIconsComponent', () => {
  let component: EditDetailsAdminComponent;
  let fixture: ComponentFixture<EditDetailsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDetailsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

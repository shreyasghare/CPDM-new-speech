import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProjectComponent } from './edit-project.component';
import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

xdescribe('EditProjectComponent', () => {
  let component: EditProjectComponent;
  let fixture: ComponentFixture<EditProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule, RouterTestingModule ],
      providers: [ProjectsDataService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have app-footer', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-footer')).not.toBeNull();
  });
  // it('editProject-should have link to home page', () => {
  //   let de=fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
  //   fixture.detectChanges();
  //   let index =de.findIndex(d=>d.properties['href']==='/home')
  //   expect(index).toBeGreaterThan(0);
  // });
});

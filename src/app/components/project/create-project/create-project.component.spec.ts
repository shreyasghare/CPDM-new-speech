import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { CreateProjectComponent } from './create-project.component';
import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

xdescribe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;
  let testBedService: ProjectsDataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule],
    //   declarations: [CreateProjectFormComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    testBedService = TestBed.get(ProjectsDataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call onSaveNext', () => {
    spyOn(component.child, 'onSaveNext');
    component.goToNextPage();
    expect(component.child.onSaveNext).toHaveBeenCalled();
  });
  it('should call gotoBack', () => {
    spyOn(component.child, 'gotoBack');
    component.goToPreviousPage();
    expect(component.child.gotoBack).toHaveBeenCalled();
  });
  it('should call gotoHome', () => {
    spyOn(component.child, 'gotoHome');
    component.goToHome();
    expect(component.child.gotoHome).toHaveBeenCalled();
  });
  it('should inject UserDetailsService', inject([ProjectsDataService], (injectService: ProjectsDataService) => {
    expect(injectService).toBe(testBedService);
  }));

  it('shoiuld have app-footer', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-footer')).not.toBeNull();
  });
  it('createProject:app-footer', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.footer__fixed')).toBeTruthy();
  });
  it('should call ngOnDestroy once', () => {
    spyOn(component.standardTemplate, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.standardTemplate.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

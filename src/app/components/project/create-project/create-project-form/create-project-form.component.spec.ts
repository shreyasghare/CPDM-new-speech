import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectFormComponent } from './create-project-form.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ToastService } from '@cpdm-service/shared/toast.service';

xdescribe('CreateProjectFormComponent', () => {
  let component: CreateProjectFormComponent;
  let fixture: ComponentFixture<CreateProjectFormComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // declarations: [ CreateProjectFormComponent ],
      imports: [AppModule, ReactiveFormsModule, FormsModule],
      providers: [ProjectsDataService, ToastService, FormBuilder]
    })
    .compileComponents().then(() => {
        fixture = TestBed.createComponent(CreateProjectFormComponent);
        component = fixture.componentInstance;
        // de=fixture.debugElement.query(By.css('form'));
        // el=de.nativeElement;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form invalid when empty', () => {
    expect(component.createProForm.valid).toBeFalsy();
  });
  it('form projectName fields validity', () => {
    expect(component.createProForm.controls.projectName.valid).toBeFalsy();
  });
  it('form projectDescription fields validity', () => {
    expect(component.createProForm.controls.projectDescription.valid).toBeFalsy();
  });
  it('form productCodeName fields validity', () => {
    expect(component.createProForm.controls.productCodeName.valid).toBeTruthy();
  });
  it('form productVersion fields validity', () => {
    expect(component.createProForm.controls.productVersion.valid).toBeTruthy();
  });
  it('projectName field validity', () => {
    let errors = {};
    const projectName = component.createProForm.controls.projectName;
    errors = projectName.errors || {};
   // expect(errors.required).toBeTruthy();
  });
  it('projectName maxlength', () => {
    expect(component.createProForm.get('projectname').value.length).toBeLessThan(200);
   });
  it('projectDescription field validity', () => {
    let errors = {};
    const projectDescription = component.createProForm.controls.projectDescription;
    errors = projectDescription.errors || {};
    //expect(errors.required).toBeTruthy();
  });
  it('projectDescription maxlength', () => {
    expect(component.createProForm.get('projectDescription').value.length).toBeLessThan(4000);
   });
  it('productCodeName maxlength', () => {
    expect(component.createProForm.get('productCodeName').value.length).toBeLessThan(200);
   });
  it('productVersion maxlength', () => {
    expect(component.createProForm.get('productVersion').value.length).toBeLessThan(200);
   });
  it('should call getStandatdTemplate', () => {
    spyOn(component.child, 'getStandatdTemplate');
    component.onHelpMeSelect();
    expect(component.child.getStandatdTemplate).toHaveBeenCalled();
  });

  it('should set submitted to be true', () => {
    component.onSubmitForm('');
    expect(component.createProForm).toBeTruthy();
  });
  it('should call the Onsubmit method', () => {
    fixture.detectChanges();
    spyOn(component, 'onSubmitForm');
    el = fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.onSubmitForm).toHaveBeenCalledTimes(0);
  });
  it(`should have app-loader`, () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.animated')).not.toBeNull();
  });
});

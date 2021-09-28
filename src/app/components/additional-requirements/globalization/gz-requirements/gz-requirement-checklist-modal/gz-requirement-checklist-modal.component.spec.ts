import { async, ComponentFixture,TestBed} from '@angular/core/testing';
import { GzRequirementChecklistModalComponenet } from './gz-requirement-checklist-modal.component';

describe('GzRequirementChecklistModalComponenet', () => {
  let component: GzRequirementChecklistModalComponenet;
  let fixture: ComponentFixture<GzRequirementChecklistModalComponenet>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GzRequirementChecklistModalComponenet ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GzRequirementChecklistModalComponenet);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });
});

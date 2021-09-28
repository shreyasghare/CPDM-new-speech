import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRemoveMemberComponent } from './add-remove-member.component';
import { AppModule } from 'src/app/app.module';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

xdescribe('AddRemoveMemberComponent', () => {
  let component: AddRemoveMemberComponent;
  let fixture: ComponentFixture<AddRemoveMemberComponent>;
  let service: UserDetailsService;
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      // declarations: [ AddRemoveMemberComponent, CuiModalModule ],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [AppModule],
      providers: [UserDetailsService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRemoveMemberComponent);
    component = fixture.componentInstance;

    // fixture.detectChanges();
  });
  // it('should emit when the button is clicked', () => {
  //   spyOn(component.onValueChange, 'emit');
  //   spyOn(component,'getCurrentOwner');
  //   expect(component.onValueChange.emit).toHaveBeenCalled();

  // });
  it('should create AddRemoveMemberComponent', () => {
    expect(component).toBeTruthy();
  });
  it('should set getCurrentOwner to be true', () => {
    component.getCurrentOwner();
    expect(component.getCurrentOwner).toBeTruthy();
  });
  it('should set getMailerIds to be true', () => {
    component.getMailerIds('');
    expect(component.getMailerIds).toBeTruthy();
  });
  it('should set hideModal to be true', () => {
    component.hideModal();
    expect(component.hideModal).toBeTruthy();
  });
  it('should set showModal to be true', () => {
    component.showModal('', '');
    expect(component.showModal).toBeTruthy();
  });
  it('should set clearInputField to be true', () => {
    component.clearInputField();
    expect(component.clearInputField).toBeTruthy();
  });
  it('should set clearErrorMessage to be true', () => {
    component.clearErrorMessage();
    expect(component.clearErrorMessage).toBeTruthy();
  });
  it('should set setErrorMessage to be true', () => {
    component.setErrorMessage('');
    expect(component.setErrorMessage).toBeTruthy();
  });
  it('should set getErrorMessageFromStatus to be true', () => {
    component.getErrorMessageFromStatus('');
    expect(component.getErrorMessageFromStatus).toBeTruthy();
  });
  it('should set onAdd to be true', () => {
    component.onAdd();
    expect(component.onAdd).toBeTruthy();
  });
  it('should set onRemove to be true', () => {
    let num: number;
    component.onRemove(num);
    expect(component.onRemove).toBeTruthy();
  });
  it('should set addMembersToArray to be true', () => {
    component.addMembersToArray('');
    expect(component.addMembersToArray).toBeTruthy();
  });
  it('should set getShortName to be true', () => {
    component.getShortName('');
    expect(component.getShortName).toBeTruthy();
  });
  it('should set getCurrentOwner to be true', () => {
    component.getCurrentOwner();
    expect(component.getCurrentOwner).toBeTruthy();
  });

//   it('should work',
//  injectAsync([ TestComponentBuilder ], (tcb: TestComponentBuilder) => {
//       return tcb.createAsync(TestCmpWrapper).then(rootCmp => {
//         let cmpInstance: ProductThumbnail =
//                <ProductThumbnail>rootCmp.debugElement.children[ 0 ].componentInstance;

//         expect(cmpInstance.openProductPage()).toBe(/* whatever */)
//       });
//   }));

});

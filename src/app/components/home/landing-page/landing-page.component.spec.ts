import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedComDirModule } from '@cpdm-shared/shared-com-dir.module';
import { CuiPagerModule, CuiSearchModule, CuiTableModule } from '@cisco-ngx/cui-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatomoModule } from 'ngx-matomo';
import { Role } from '@cpdm-model/role';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPageComponent ],
      imports: [ SharedComDirModule,
        HttpClientTestingModule,
        CuiSearchModule,
        CuiTableModule,
        CuiPagerModule,
        MatomoModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    component.userRole = Role.pm;
    component.role = Role;
    fixture.detectChanges();
  });

  /*
  it('should create LandingPageComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should pageNumber be one if less then zero', () => {
    component.pageNumber = 0;
    fixture.detectChanges();
    expect(component.pageNumber).toBe(0);
  });

  it('should convert date', () => {
    const lastUpdatedDate = new Date('2019-07-21T01:11:18.965Z');
    // tslint:disable-next-line: variable-name
    const month_names = ['Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];
    // tslint:disable-next-line: max-line-length
    const expectedDate = '' +
  lastUpdatedDate.getDate() + '-' + 
  (month_names[(lastUpdatedDate.getMonth())]) + '-' +
  lastUpdatedDate.getFullYear();
    const result = component.convartDate(new Date(lastUpdatedDate));
    fixture.detectChanges();
    expect(result).toBe(expectedDate);

  });*/
});



import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterLinkWithHref } from '@angular/router';
import { By } from '@angular/platform-browser';

xdescribe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create NavbarComponent', () => {
    expect(component).toBeTruthy();
  });
  // it('navbar-should have link to home page', () => {
  //   let de=fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
  //   fixture.detectChanges();
  //   let index =de.findIndex(d=>d.properties['href']==='/home')
  //   expect(index).toBeGreaterThan(0);
  // });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchDirComponent } from './user-search-dir.component';

xdescribe('UserSearchDirComponent', () => {
  let component: UserSearchDirComponent;
  let fixture: ComponentFixture<UserSearchDirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSearchDirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchDirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

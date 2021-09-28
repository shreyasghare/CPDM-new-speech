import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PushToRepositoryComponent } from './push-to-repository.component';

xdescribe('PushToRepositoryComponent', () => {
  let component: PushToRepositoryComponent;
  let fixture: ComponentFixture<PushToRepositoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushToRepositoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushToRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

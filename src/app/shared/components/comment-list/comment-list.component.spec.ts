import { async, ComponentFixture, TestBed , inject} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommentListComponent } from './comment-list.component';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MatomoTracker } from 'ngx-matomo';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentListComponent ],
      imports: [ HttpClientTestingModule ],
      providers:[ UserDetailsService, DeviceDetectorService,MatomoTracker ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    const commentObj: Comment = new Comment();
    component.comments = commentObj;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have comments data in input', () => {
    expect(component.comments instanceof Comment).toBeTruthy();
  });

  it('Current user role from service should be defined', () => {
    const testBedUserDetailsService = TestBed.get(UserDetailsService);
    spyOn(testBedUserDetailsService , "userRole");
    expect(testBedUserDetailsService.userRole).toBeDefined();
  });

  it('Should call Onscroll function', () => {
    expect(component.onScroll).toBeDefined();
  });
});
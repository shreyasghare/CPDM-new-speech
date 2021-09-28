import { TestBed, fakeAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';


xdescribe('UserDetailsService', () => {
    let service: UserDetailsService;
    let backend;
    beforeEach(() => TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [UserDetailsService]
  }));

    it('should be created', () => {
    const service: UserDetailsService = TestBed.get(UserDetailsService);
    expect(service).toBeTruthy();
  });
    it('should return loggedInUser', fakeAsync(() => {

  })

  );
});

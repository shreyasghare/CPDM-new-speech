import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedComDirModule } from '@cpdm-shared/shared-com-dir.module';

import { CrcCompleteComponent } from './crc-complete.component';

describe('CrcCompleteComponent', () => {
  let component: CrcCompleteComponent;
  let fixture: ComponentFixture<CrcCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        SharedComDirModule
      ],
      declarations: [ CrcCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should instantiate CrcCompleteComponent', () => {
    expect(component).toBeDefined();
  });

  it('should have app-holding-status', () => {
    const banner = fixture.debugElement.nativeElement.querySelector('#banner-screen');
    expect(banner).toBeTruthy();
    expect(banner.innerHTML).not.toBeNull();
    expect(banner.innerHTML.length).toBeGreaterThan(0);
  });
});
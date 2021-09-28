import { TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from './app.module';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { AppComponent } from './app.component';

class MockAuthService extends ToastService {
    popToast() { }
}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let testBedService: ToastService;
    let componentService: ToastService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppModule, RouterTestingModule
            ],
            declarations: [],
            providers: [ToastService]
        }).compileComponents();

        TestBed.overrideComponent(AppComponent,
            { set: { providers: [{ provide: ToastService, useClass: MockAuthService }] } });

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;

        testBedService = TestBed.get(ToastService);
        componentService = fixture.debugElement.injector.get(ToastService);

    });
    /*
    it('should create the app AppComponent', () => {
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it('toast service injection test',
        inject([ToastService], (injectService: ToastService) => {
            expect(injectService).toBe(testBedService);
        })
    );

    it('service ionjected via component should be an instance of MockAuthService', () => {
        expect(componentService instanceof MockAuthService).toBeTruthy();
    });

    it('should show cui-spinner', () => {
        component.showSpinner = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.loading-spinner')).not.toBeNull();
    });

    it('should hide cui-spinner', () => {
        component.showSpinner = false;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.loading-spinner')).toBeNull();
    });

    it('should show cui-loader', () => {
        component.showLoader = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.loading-dots')).not.toBeNull();
    });

    it('should hide cui-loader', () => {
        component.showSpinner = false;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.loading-dots')).toBeNull();
    });*/
});

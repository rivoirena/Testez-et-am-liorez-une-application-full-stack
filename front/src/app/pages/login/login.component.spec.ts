import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect, jest } from '@jest/globals';
import { SessionService } from 'src/app/core/service/session.service';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { By } from '@angular/platform-browser';
import { AuthService } from 'src/app/core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const mockSessionInformation: SessionInformation = {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockSessionService = {
    logIn: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component logic', () => {
    it('should call authService.login, sessionService.logIn and navigate on successful submit', () => {
      mockAuthService.login.mockReturnValue(of(mockSessionInformation));

      component.form.setValue({ email: 'test@test.com', password: 'password' });
      component.submit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
      expect(mockSessionService.logIn).toHaveBeenCalledWith(mockSessionInformation);
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBe(false);
    });

    it('should set onError to true when login fails', () => {
      mockAuthService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

      component.form.setValue({ email: 'test@test.com', password: 'wrongpassword' });
      component.submit();

      expect(component.onError).toBe(true);
      expect(mockSessionService.logIn).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form validation', () => {
    it('should have an invalid form when email is empty', () => {
      component.form.setValue({ email: '', password: 'password' });
      expect(component.form.valid).toBe(false);
    });

    it('should have an invalid form when email format is incorrect', () => {
      component.form.setValue({ email: 'not-an-email', password: 'password' });
      expect(component.form.valid).toBe(false);
    });

    it('should have a valid form when email and password are correct', () => {
      component.form.setValue({ email: 'test@test.com', password: 'password' });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('DOM interactions', () => {
    it('should disable submit button when form is invalid', () => {
      component.form.setValue({ email: '', password: '' });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.form.setValue({ email: 'test@test.com', password: 'password' });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should call submit() when form is submitted', () => {
      const submitSpy = jest.spyOn(component, 'submit');

      component.form.setValue({ email: 'test@test.com', password: 'password' });
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);

      expect(submitSpy).toHaveBeenCalled();
    });

    it('should display error message when onError is true', () => {
      component.onError = true;
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('An error occurred');
    });

    it('should not display error message when onError is false', () => {
      component.onError = false;
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error'));
      expect(errorMessage).toBeFalsy();
    });

    it('should toggle password visibility when clicking the visibility icon button', () => {
      expect(component.hide).toBe(true);

      const toggleButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.hide).toBe(false);

      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      expect(passwordInput.nativeElement.type).toBe('text');
    });

    it('should update email input value when user types', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]'));
      emailInput.nativeElement.value = 'user@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.form.get('email')?.value).toBe('user@example.com');
    });
  });
  
});

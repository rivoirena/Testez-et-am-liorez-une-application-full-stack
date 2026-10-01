import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect, jest } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from 'src/app/core/service/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterRequest } from 'src/app/core/models/registerRequest.interface';
import { faker } from '@faker-js/faker/.';
import { By } from '@angular/platform-browser';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  const mockRegisterRequest: RegisterRequest = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    };

  const mockAuthService = {
    register: jest.fn(),
  };



  const fillInput = (selector: string, value: string) => {
    const input = fixture.debugElement.query(By.css(selector)).nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const fillForm = (data: RegisterRequest) => {
    fillInput('input[formControlName="firstName"]', data.firstName);
    fillInput('input[formControlName="lastName"]', data.lastName);
    fillInput('input[formControlName="email"]', data.email);
    fillInput('input[formControlName="password"]', data.password);
    fixture.detectChanges();
  };

  const submitForm = () => {
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
    it('should call authService.register and navigate on successful submit', () => {
      mockAuthService.register.mockReturnValue(of(undefined));

      
      fillForm(mockRegisterRequest);
      submitForm();

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterRequest);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBe(false);
    });
    
    it('should set onError to true when register fails', () => {
      mockAuthService.register.mockReturnValue(throwError(() => new Error('Invalid credentials')));

      
      fillForm(mockRegisterRequest);
      submitForm();

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterRequest);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.onError).toBe(true);
    });
  });

  describe('DOM interactions', () => {
    it('should disable submit button when form is invalid', () => {
      fillForm({ ...mockRegisterRequest, email: '' });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      fillForm(mockRegisterRequest);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should call submit() when form is submitted', () => {
      const submitSpy = jest.spyOn(component, 'submit');
      component.form.setValue(mockRegisterRequest);
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
    });

    it('should not display error message when onError is false', () => {
      component.onError = false;
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error'));
      expect(errorMessage).toBeFalsy();
    });

    it('should update firstName input value when user types', () => {
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]'));
      firstNameInput.nativeElement.value = 'Alice';
      firstNameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.form.get('firstName')?.value).toBe('Alice');
    });
  });
});

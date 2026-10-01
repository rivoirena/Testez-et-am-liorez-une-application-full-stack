import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { FormComponent } from './form.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { MaterialModule } from '../../../../shared/material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: SessionApiService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  const mockSession: Session = {
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing session',
    date: new Date('2024-01-01'),
    teacher_id: 1,
    users: [],
  };

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSessionApiService = {
    detail: jest.fn().mockReturnValue(of(mockSession)),
    create: jest.fn().mockReturnValue(of(mockSession)),
    update: jest.fn().mockReturnValue(of(mockSession)),
  };

  const mockTeacherService = {
    all: jest.fn().mockReturnValue(of([mockTeacher])),
  };

  const mockSessionService = {
    sessionInformation: {
      id: 1,
      admin: true,
    },
  };

  const setup = async (url: string, paramId: string | null = null) => {
    TestBed.overrideComponent(FormComponent, {
      add: {
        providers: [{ provide: MatSnackBar, useValue: { open: jest.fn() } }],
      },
    });

    await TestBed.configureTestingModule({
      imports: [
        FormComponent,
        MaterialModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionService, useValue: mockSessionService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => paramId } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    sessionApiService = TestBed.inject(SessionApiService);
    router = TestBed.inject(Router);
    matSnackBar = fixture.debugElement.injector.get(MatSnackBar);

    jest.spyOn(router, 'navigate');
    Object.defineProperty(router, 'url', { value: url, writable: true });

    fixture.detectChanges();
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when creating a session', () => {
    beforeEach(async () => {
      await setup('/sessions/create');
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should not be in update mode', () => {
      expect(component.onUpdate).toBe(false);
    });

    it('should initialize an empty form', () => {
      expect(component.sessionForm?.value).toEqual({
        name: '',
        date: '',
        teacher_id: '',
        description: '',
      });
    });

    it('should call create and navigate on submit', () => {
      fixture.nativeElement.querySelector('input[formControlName="name"]').value = 'New session';
      fixture.nativeElement
        .querySelector('input[formControlName="name"]')
        .dispatchEvent(new Event('input'));

      fixture.nativeElement.querySelector('input[formControlName="date"]').value = '2024-05-01';
      fixture.nativeElement
        .querySelector('input[formControlName="date"]')
        .dispatchEvent(new Event('input'));

      component.sessionForm?.get('teacher_id')?.setValue(1);

      fixture.nativeElement.querySelector('textarea[formControlName="description"]').value = 'desc';
      fixture.nativeElement
        .querySelector('textarea[formControlName="description"]')
        .dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      submitButton.click();
      fixture.detectChanges();

      expect(sessionApiService.create).toHaveBeenCalled();
      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Session created !',
        'Close',
        { duration: 3000 }
      );
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('when updating a session', () => {
    beforeEach(async () => {
      await setup('/sessions/update/1', '1');
    });

    it('should be in update mode', () => {
      expect(component.onUpdate).toBe(true);
    });

    it('should load session detail and populate the form', () => {
      expect(sessionApiService.detail).toHaveBeenCalledWith('1');
      expect(component.sessionForm?.value.name).toBe(mockSession.name);
      expect(component.sessionForm?.value.teacher_id).toBe(
        mockSession.teacher_id
      );
    });

    it('should display the loaded session data in the form inputs', () => {
      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector(
        'input[formControlName="name"]'
      );
      const dateInput: HTMLInputElement = fixture.nativeElement.querySelector(
        'input[formControlName="date"]'
      );
      const descriptionTextarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(
        'textarea[formControlName="description"]'
      );

      const expectedDate = mockSession.date.toISOString().slice(0, 10);

      expect(nameInput.value).toBe(mockSession.name);
      expect(dateInput.value).toBe(expectedDate);
      expect(descriptionTextarea.value).toBe(mockSession.description);
    });

    it('should call update and navigate on submit', () => {
      const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      submitButton.click();
      fixture.detectChanges();

      expect(sessionApiService.update).toHaveBeenCalledWith(
        '1',
        component.sessionForm?.value
      );
      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Session updated !',
        'Close',
        { duration: 3000 }
      );
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('when user is not admin', () => {
    beforeEach(async () => {
      mockSessionService.sessionInformation.admin = false;
      await setup('/sessions/create');
    });

    afterEach(() => {
      mockSessionService.sessionInformation.admin = true;
    });

    it('should redirect to /sessions', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });
  });
});
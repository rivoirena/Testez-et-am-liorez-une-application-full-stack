import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule, } from '@angular/router/testing';
import { expect, jest } from '@jest/globals';
import { SessionService } from '../../../../core/service/session.service';

import { DetailComponent } from './detail.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SessionApiService } from 'src/app/core/service/session-api.service';
import { TeacherService } from 'src/app/core/service/teacher.service';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Session } from 'src/app/core/models/session.interface';
import { Teacher } from 'src/app/core/models/teacher.interface';


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  
  const mockSession: Session = {
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing session',
    date: new Date('2023-06-01'),
    teacher_id: 1,
    users: [2, 3],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'Margot',
    lastName: 'Delahaye',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('when user is admin', () => {
    let sessionApiService: SessionApiService;
    let router: Router;
    let matSnackBar: MatSnackBar;

    beforeEach(async () => {

      TestBed.overrideComponent(DetailComponent, {
        add: {
          providers: [{ provide: MatSnackBar, useValue: { open: jest.fn() } }],
        },
      });

      await TestBed.configureTestingModule({
        imports: [
          DetailComponent, 
          MaterialModule, 
          RouterTestingModule.withRoutes([
            { path: 'sessions', component: DetailComponent }, // factice
          ]),
          HttpClientTestingModule
        ],
        providers: [
          { provide: SessionApiService, 
              useValue: {
                detail: jest.fn().mockReturnValue(of(mockSession)),
                delete: jest.fn().mockReturnValue(of(undefined)),
                participate: jest.fn().mockReturnValue(of(undefined)),
                unParticipate: jest.fn().mockReturnValue(of(undefined)),
              }, 
            },
          { provide: TeacherService, useValue: { detail: jest.fn().mockReturnValue(of(mockTeacher)) } },
          { provide: SessionService, useValue: { sessionInformation: { id: 1, admin: true } } },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
          {
            provide: MatSnackBar,
            useValue: { open: jest.fn() },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      sessionApiService = TestBed.inject(SessionApiService);
      router = TestBed.inject(Router);
      matSnackBar = fixture.debugElement.injector.get(MatSnackBar);

      jest.spyOn(router, 'navigate');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set isAdmin to true', () => {
      expect(component.isAdmin).toBe(true);
    });

    it('should display session information correctly', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('h1').textContent).toContain('Yoga Session');
      expect(compiled.querySelector('.description').textContent).toContain('A relaxing session');
      expect(compiled.textContent).toContain('2 attendees');
      expect(compiled.textContent).toContain('Margot');
      expect(compiled.textContent).toContain('DELAHAYE');
    });

    it('should show the Delete button when user is admin', () => {
      const compiled = fixture.nativeElement;
      const deleteButton = compiled.querySelector('[data-testid="delete-button"]');
      expect(deleteButton).toBeTruthy();
    });
    

    describe('delete()', () => {
      it('should call sessionApiService.delete with the correct sessionId', () => {
        const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector(
          '[data-testid="delete-button"]',
        );

        deleteButton.click();
        fixture.detectChanges();

        expect(sessionApiService.delete).toHaveBeenCalledWith('1');
      });

      it('should show a snackbar and navigate to sessions after deletion', () => {
        const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector(
          '[data-testid="delete-button"]',
        );

        deleteButton.click();
        fixture.detectChanges();

        expect(sessionApiService.delete).toHaveBeenCalledWith('1');
        expect(matSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
        expect(router.navigate).toHaveBeenCalledWith(['sessions']);
      });
    });
  });

  describe('when user is not admin', () => {
    let sessionApiService: SessionApiService;
    describe('and user is participating', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [DetailComponent, MaterialModule, RouterTestingModule, HttpClientTestingModule],
          providers: [
            { provide: SessionApiService, 
              useValue: {
                detail: jest.fn().mockReturnValue(of(mockSession)),
                delete: jest.fn().mockReturnValue(of(undefined)),
                participate: jest.fn().mockReturnValue(of(undefined)),
                unParticipate: jest.fn().mockReturnValue(of(undefined)),
              }, 
            },
            { provide: TeacherService, useValue: { detail: jest.fn().mockReturnValue(of(mockTeacher)) } },
            { provide: SessionService, useValue: { sessionInformation: { id: 2, admin: false } } },
            { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
          ],
        }).compileComponents();

        fixture = TestBed.createComponent(DetailComponent);
        sessionApiService = TestBed.inject(SessionApiService);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should set isAdmin to false', () => {
        expect(component.isAdmin).toBe(false);
      });

      it('should show the "Do not participate" button', () => {
        const unParticipateButton = fixture.nativeElement.querySelector(
          '[data-testid="unparticipate-button"]',
        );
        const participateButton = fixture.nativeElement.querySelector(
          '[data-testid="participate-button"]',
        );

        expect(unParticipateButton).toBeTruthy();
        expect(participateButton).toBeFalsy();
      });

      describe('unParticipate()', () => {
        it('should call sessionApiService.unParticipate with the correct sessionId', () => {
          const unParticipateButton: HTMLButtonElement = fixture.nativeElement.querySelector(
            '[data-testid="unparticipate-button"]',
          );

          unParticipateButton.click();
          fixture.detectChanges();

          expect(sessionApiService.unParticipate).toHaveBeenCalledWith('1', '2');
        });
      });
    });
    
    describe('and user is not participating', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [DetailComponent, MaterialModule, RouterTestingModule, HttpClientTestingModule],
          providers: [
            { provide: SessionApiService, 
              useValue: {
                detail: jest.fn().mockReturnValue(of(mockSession)),
                delete: jest.fn().mockReturnValue(of(undefined)),
                participate: jest.fn().mockReturnValue(of(undefined)),
                unParticipate: jest.fn().mockReturnValue(of(undefined)),
              }, 
            },
            { provide: TeacherService, useValue: { detail: jest.fn().mockReturnValue(of(mockTeacher)) } },
            { provide: SessionService, useValue: { sessionInformation: { id: 1, admin: false } } },
            { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
          ],
        }).compileComponents();

        fixture = TestBed.createComponent(DetailComponent);
        sessionApiService = TestBed.inject(SessionApiService);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should set isAdmin to false', () => {
        expect(component.isAdmin).toBe(false);
      });

      it('should show the "Participate" button', () => {
        const unParticipateButton = fixture.nativeElement.querySelector(
          '[data-testid="unparticipate-button"]',
        );
        const participateButton = fixture.nativeElement.querySelector(
          '[data-testid="participate-button"]',
        );

        expect(participateButton).toBeTruthy();
        expect(unParticipateButton).toBeFalsy();
      });

      describe('participate()', () => {
        it('should call sessionApiService.participate with the correct sessionId', () => {
          const participateButton: HTMLButtonElement = fixture.nativeElement.querySelector(
            '[data-testid="participate-button"]',
          );

          participateButton.click();
          fixture.detectChanges();

          expect(sessionApiService.participate).toHaveBeenCalledWith('1', '1');
        });
      });
    });
  });
});


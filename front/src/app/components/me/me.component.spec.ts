import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { faker } from '@faker-js/faker/.';

import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';
import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  const mockUser: User = {
    id: 1,
    email: faker.internet.email(),
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
    admin: false,
    password: faker.internet.password(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    getById: jest.fn(),
    delete: jest.fn(),
  };

  const mockSessionService = {
    sessionInformation: {
      id: 1,
    },
    logOut: jest.fn(),
  };

  const mockMatSnackBar = {
    open: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    mockUserService.getById.mockReturnValue(of(mockUser));
    mockUserService.delete.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [MeComponent, HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: Router, useValue: mockRouter },
      ],
    })    
    .overrideComponent(MeComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: mockMatSnackBar },
        ],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch and set the user', () => {
      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUser);
    });
  });

  describe('back', () => {
    it('should call window.history.back', () => {
      const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

      component.back();

      expect(historyBackSpy).toHaveBeenCalled();
    });
  });

   describe('delete', () => {
  beforeEach(() => {
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
    it('should call userService.delete with the correct id (unit)', () => {
      component.delete();

      expect(mockUserService.delete).toHaveBeenCalledWith('1');
    });

    it('should delete the account, log out, show a snackbar and navigate on button click (integration)', () => {
      const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[data-testid="delete-button"]'
      );

      deleteButton.click();
      fixture.detectChanges();

      expect(mockUserService.delete).toHaveBeenCalledWith('1');
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
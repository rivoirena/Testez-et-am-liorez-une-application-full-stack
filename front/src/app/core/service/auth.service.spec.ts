import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect, jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { AuthService } from './auth.service';
import { LoginRequest } from '../models/loginRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest } from '../models/registerRequest.interface';

describe('AuthService test suites', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // vérifie qu'aucune requête inattendue n'a été faite
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login test suites', () => {
    it('should send a POST request to /api/auth/login with correct body', () => {
      const mockLoginRequest: LoginRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const mockResponse: SessionInformation = {
        token: faker.string.alphanumeric(20),
        type: 'Bearer',
        id: faker.number.int({ min: 1, max: 1000 }),
        username: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: faker.datatype.boolean(),
      };

      const nextCallback = jest.fn();

      service.login(mockLoginRequest).subscribe(nextCallback);

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);

      req.flush(mockResponse);
      
      expect(nextCallback).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle error when login fails (wrong credentials)', () => {
      const mockLoginRequest: LoginRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      let actualError: HttpErrorResponse | undefined;

      service.login(mockLoginRequest).subscribe({
        next: () => {},
        error: (error: HttpErrorResponse) => {
          actualError = error;
        },
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(actualError?.status).toBe(401);
    });

    it('should handle error when login fails (wrong credentials)', () => {
      const mockLoginRequest: LoginRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const errorCallback = jest.fn(); // on wrap dans un mock

      service.login(mockLoginRequest).subscribe({
        next: () => {},
        error: errorCallback,
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorCallback).toHaveBeenCalledTimes(1); // vérifie qu'il a été appelé
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
      );
    });
  });

  describe('register test suites', () => {
    it('should send a POST request to /api/auth/register with correct body', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      const mockResponse: SessionInformation = {
        token: faker.string.alphanumeric(20),
        type: 'Bearer',
        id: faker.number.int({ min: 1, max: 1000 }),
        username: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: faker.datatype.boolean(),
      };

      const nextCallback = jest.fn();
      service.register(mockRegisterRequest).subscribe(nextCallback);

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);

      req.flush(null);
      expect(nextCallback).toHaveBeenCalledWith(null);
    });

    it('should handle error when register fails', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      const errorCallback = jest.fn(); // on wrap dans un mock

      service.register(mockRegisterRequest).subscribe({
        next: () => {},
        error: errorCallback,
      });

      const req = httpMock.expectOne('/api/auth/register');
      req.flush('Error: Email is already taken!', {
        status: 400,
        statusText: 'Bad Request',
      });

      expect(errorCallback).toHaveBeenCalledTimes(1); // vérifie qu'il a été appelé
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({ status: 400 }),
      );
    });
  });
});

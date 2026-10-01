import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { faker } from '@faker-js/faker';

import { SessionService } from './session.service';
import { SessionInformation } from '../models/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('default state', () => {
    it('should have isLogged false and sessionInformation undefined by default', () => {
      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });
  });

  describe('logIn', () => {
    it('should update isLogged to true and set sessionInformation', () => {
      const mockUser: SessionInformation = {
        token: faker.string.alphanumeric(20),
        type: 'Bearer',
        id: faker.number.int({ min: 1, max: 1000 }),
        username: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: faker.datatype.boolean(),
      };

      service.logIn(mockUser);

      expect(service.isLogged).toBe(true);
      expect(service.sessionInformation).toEqual(mockUser);
    });

    it('should emit true via $isLogged()', (done) => {
      const mockUser: SessionInformation = {
        token: faker.string.alphanumeric(20),
        type: 'Bearer',
        id: faker.number.int({ min: 1, max: 1000 }),
        username: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: faker.datatype.boolean(),
      };

      service.$isLogged().subscribe((isLogged) => {
        if (isLogged) {
          expect(isLogged).toBe(true);
          done();
        }
      });

      service.logIn(mockUser);
    });
  });

  describe('logOut', () => {
    it('should reset isLogged to false and sessionInformation to undefined', () => {
      const mockUser: SessionInformation = {
        token: faker.string.alphanumeric(20),
        type: 'Bearer',
        id: faker.number.int({ min: 1, max: 1000 }),
        username: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: faker.datatype.boolean(),
      };

      service.logIn(mockUser);
      service.logOut();

      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });
  });
});

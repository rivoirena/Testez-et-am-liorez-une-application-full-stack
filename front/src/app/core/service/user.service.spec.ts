import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '../models/user.interface';
import { faker } from '@faker-js/faker/.';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: faker.number.int({ min: 1, max: 1000 }),
    email: faker.internet.email(),
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
    admin: faker.datatype.boolean(),
    password: faker.internet.password(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should send a GET request to /api/user/:id and return the user detail', () => {
    const id = '1';
    let actualResult: User | undefined;

    service.getById(id).subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne(`api/user/${id}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockUser);

    expect(actualResult).toEqual(mockUser);
  });

  

  it('should send a DELETE request to /api/user/:id', () => {
    const id = '1';

    service.delete(id).subscribe();

    const req = httpMock.expectOne(`api/user/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});

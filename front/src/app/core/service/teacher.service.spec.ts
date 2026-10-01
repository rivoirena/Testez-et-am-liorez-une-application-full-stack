import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { faker } from '@faker-js/faker';

import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const mockTeacher: Teacher = {
    id: faker.number.int({ min: 1, max: 1000 }),
    lastName: faker.person.lastName(),
    firstName: faker.person.firstName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService],
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a GET request to /api/teacher and return all teachers', () => {
    const mockTeachers: Teacher[] = [mockTeacher];
    let actualResult: Teacher[] | undefined;

    service.all().subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');

    req.flush(mockTeachers);

    expect(actualResult).toEqual(mockTeachers);
  });

  it('should send a GET request to /api/teacher/:id and return the teacher detail', () => {
    const id = '1';
    let actualResult: Teacher | undefined;

    service.detail(id).subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne(`api/teacher/${id}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockTeacher);

    expect(actualResult).toEqual(mockTeacher);
  });
});
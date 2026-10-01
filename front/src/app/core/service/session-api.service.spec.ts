import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { faker } from '@faker-js/faker/.';
import { Session } from '../models/session.interface';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSession: Session = {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    date: faker.date.future(),
    teacher_id: faker.number.int({ min: 1, max: 100 }),
    users: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService],
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a GET request to /api/session and return all sessions', () => {
    const mockSessions: Session[] = [mockSession];
    let actualResult: Session[] | undefined;

    service.all().subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');

    req.flush(mockSessions);

    expect(actualResult).toEqual(mockSessions);
  });

  it('should send a GET request to /api/session/:id and return the session detail', () => {
    const id = '1';
    let actualResult: Session | undefined;

    service.detail(id).subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne(`api/session/${id}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockSession);

    expect(actualResult).toEqual(mockSession);
  });

  it('should send a DELETE request to /api/session/:id', () => {
    const id = '1';

    service.delete(id).subscribe();

    const req = httpMock.expectOne(`api/session/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should send a POST request to /api/session with session body and return the created session', () => {
    let actualResult: Session | undefined;

    service.create(mockSession).subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSession);

    req.flush(mockSession);

    expect(actualResult).toEqual(mockSession);
  });

  it('should send a PUT request to /api/session/:id with session body and return the updated session', () => {
    const id = '1';
    let actualResult: Session | undefined;

    service.update(id, mockSession).subscribe((result) => {
      actualResult = result;
    });

    const req = httpMock.expectOne(`api/session/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockSession);

    req.flush(mockSession);

    expect(actualResult).toEqual(mockSession);
  });

  it('should send a POST request to /api/session/:id/participate/:userId', () => {
    const id = '1';
    const userId = '2';

    service.participate(id, userId).subscribe();

    const req = httpMock.expectOne(`api/session/${id}/participate/${userId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();

    req.flush(null);
  });

  it('should send a DELETE request to /api/session/:id/participate/:userId', () => {
    const id = '1';
    const userId = '2';

    service.unParticipate(id, userId).subscribe();

    const req = httpMock.expectOne(`api/session/${id}/participate/${userId}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});

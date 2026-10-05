import { regularUser } from "cypress/support/mocks/users.mock";
import { Session } from "../../src/app/core/models/session.interface";
import { User } from "../../src/app/core/models/user.interface";
import { mockSessions } from "../support/mocks/sessions.mock";
import { mockTeachers } from "../support/mocks/teachers.mock";
import { formatDate } from "../support/utils/date.utils";

describe('Detail spec', () => {

    beforeEach(() => {
        // Intercept générique pour le teacher, valable pour tous les tests
        cy.intercept('GET', '/api/teacher/*', { body: mockTeachers[0] }).as('teacherDetails');
    });
    
    it('Should display session details', () => {

        cy.login(regularUser, mockSessions);
        
        const formattedCreatedAt = formatDate(mockSessions[1].createdAt);
        const formattedUpdatedAt = formatDate(mockSessions[1].updatedAt);
        cy.intercept('GET', `/api/session/${mockSessions[1].id}`, { body: mockSessions[1] }).as('sessionDetails');
        cy.contains('mat-card', mockSessions[1].name)
            .find('button')
            .contains('Detail')
            .click();

        cy.wait('@sessionDetails');

        cy.url().should('include', `/detail/${mockSessions[1].id}`);

        cy.get('h1').should('contain.text', mockSessions[1].name);
        cy.get('.description').should('contain.text', 'Description:');
        cy.get('.description').should('contain.text', mockSessions[1].description);

        cy.get('div').should('contain.text', `${formattedCreatedAt}`);
        cy.get('div').should('contain.text', `${formattedUpdatedAt}`);
    });

    it('Should display do not participate button and not display participate button if user participate to the session', () => {
        cy.login(regularUser, mockSessions);

        cy.intercept('GET', `/api/session/${mockSessions[1].id}`, { body: mockSessions[1] }).as('sessionDetails');
        cy.contains('mat-card', mockSessions[1].name)
            .find('button')
            .contains('Detail')
            .click();

        cy.wait('@sessionDetails');
        
        cy.get('[data-testid=unparticipate-button]').should('exist');
        cy.get('[data-testid=participate-button]').should('not.exist');
    });

    it('Should display participate button and not display do not participate button if user participate to the session', () => {
        cy.login(regularUser, mockSessions);

        cy.intercept('GET', `/api/session/${mockSessions[0].id}`, { body: mockSessions[0] }).as('sessionDetails');
        cy.contains('mat-card', mockSessions[0].name)
            .find('button')
            .contains('Detail')
            .click();

        cy.wait('@sessionDetails');
        
        cy.get('[data-testid=participate-button]').should('exist');
        cy.get('[data-testid=unparticipate-button]').should('not.exist');
    });

    it('Should allow user to participate to a session', () => {
        cy.login(regularUser, mockSessions);

        cy.intercept('GET', `/api/session/${mockSessions[0].id}`, { body: mockSessions[0] }).as('sessionDetails');
        cy.contains('mat-card', mockSessions[0].name)
            .find('button').contains('Detail').click();
        cy.wait('@sessionDetails');

        cy.get('[data-testid=participate-button]').should('exist');

        cy.intercept('POST', `/api/session/${mockSessions[0].id}/participate/${regularUser.id}`, {
            statusCode: 200,
        }).as('participate');

        const updatedSession = {
            ...mockSessions[0],
            users: [...mockSessions[0].users, regularUser.id]
        };
        cy.intercept('GET', `/api/session/${mockSessions[0].id}`, { body: updatedSession }).as('sessionDetailsUpdated');

        cy.get('[data-testid=participate-button]').click();

        cy.wait('@participate');
        cy.wait('@sessionDetailsUpdated');

        cy.get('[data-testid=unparticipate-button]').should('exist');
        cy.get('[data-testid=participate-button]').should('not.exist');
    });

    it('Should allow user to unparticipate from a session', () => {
        cy.login(regularUser, mockSessions);

        cy.intercept('GET', `/api/session/${mockSessions[1].id}`, { body: mockSessions[1] }).as('sessionDetails');
        cy.contains('mat-card', mockSessions[1].name)
            .find('button').contains('Detail').click();
        cy.wait('@sessionDetails');

        cy.get('[data-testid=unparticipate-button]').should('exist');

        cy.intercept('DELETE', `/api/session/${mockSessions[1].id}/participate/${regularUser.id}`, {
            statusCode: 200,
        }).as('unparticipate');

        const updatedSession = {
            ...mockSessions[1],
            users: mockSessions[1].users.filter(id => id !== regularUser.id)
        };
        cy.intercept('GET', `/api/session/${mockSessions[1].id}`, { body: updatedSession }).as('sessionDetailsUpdated');

        cy.get('[data-testid=unparticipate-button]').click();

        cy.wait('@unparticipate');
        cy.wait('@sessionDetailsUpdated');

        cy.get('[data-testid=participate-button]').should('exist');
        cy.get('[data-testid=unparticipate-button]').should('not.exist');
    });
});
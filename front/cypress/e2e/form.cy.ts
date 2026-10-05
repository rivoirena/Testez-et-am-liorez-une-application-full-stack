import { mockSessions } from "cypress/support/mocks/sessions.mock";
import { mockTeachers } from "cypress/support/mocks/teachers.mock";
import { adminUser } from "cypress/support/mocks/users.mock";

describe('Form spec', () => {
    function formatDateToInputFormat(date: Date): string {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    beforeEach(() => {
        // Intercept générique pour le teacher, valable pour tous les tests
        cy.intercept('GET', '/api/teacher', { body: mockTeachers }).as('teacherDetails');
        cy.login(adminUser, mockSessions);
        
    });

    describe('create form', () => {

        beforeEach(() => {
            cy.get('[routerLink=create]').click();
            cy.wait('@teacherDetails');
        });

        it('Should displayall form fields', () => {
            cy.get('input[formcontrolname=name]').should('exist');
            cy.get('input[formcontrolname=date]').should('exist');
            cy.get('mat-select[formcontrolname=teacher_id]').should('exist');
            cy.get('textarea[formcontrolname=description]').should('exist');
            cy.get('button[type=submit]').should('exist').and('be.disabled');
        });

        it('should keep submit button disabled until all required fields are filled', () => {
            cy.get('button[type=submit]').should('be.disabled');

            cy.get('input[formcontrolname=name]').type('Yoga');
            cy.get('button[type=submit]').should('be.disabled'); // toujours invalide

            cy.get('input[formcontrolname=date]').type('2026-10-04');
            cy.get('mat-select[formcontrolname=teacher_id]').click();
            cy.get('mat-option').first().click();
            cy.get('textarea[formcontrolname=description]').type('desc');

            cy.get('button[type=submit]').should('not.be.disabled');
        });

        it('should create a session', () => {
            cy.intercept('POST', '/api/session', { body: mockSessions[0] }).as('createSession');

            cy.get('input[formcontrolname=name]').type('Yoga session');
            cy.get('input[formcontrolname=date]').type('2026-10-04');
            cy.get('textarea[formcontrolname=description]').type('Une session de yoga relaxante');

            cy.get('mat-select[formcontrolname=teacher_id]').click();
            cy.get('mat-option').contains(`${mockTeachers[0].firstName} ${mockTeachers[0].lastName}`);
            cy.get('mat-option').contains(`${mockTeachers[1].firstName} ${mockTeachers[1].lastName}`).click();

            cy.get('button[type=submit]').click();

            cy.wait('@createSession');

            cy.url().should('include', '/sessions');

        });
    });

    describe('update form', () => {

        beforeEach(() => {
            cy.intercept('GET', `/api/session/${mockSessions[0].id}`, { body: mockSessions[0] }).as('sessionDetails');

            cy.contains('mat-card', mockSessions[0].name)
                .find('button')
                .contains('Edit')
                .click();

            cy.wait('@teacherDetails');
            cy.wait('@sessionDetails');
                
        });

        it('should display the edit form with right informations', () => {
            
            const session = mockSessions[0];
            const teacher = mockTeachers.find(t => t.id === session.teacher_id);
            
            if (!teacher) {
                throw new Error('Teacher not found in mock data');
            }

            cy.get('input[formcontrolname=name]')
                .should('have.value', session.name);

            const expectedDate = formatDateToInputFormat(session.date);
            cy.get('input[formcontrolname=date]')
                .should('have.value', expectedDate); // attention au format de date

            cy.get('textarea[formcontrolname=description]')
                .should('have.value', session.description);

            cy.get('mat-select[formcontrolname=teacher_id]').click();
            cy.get('mat-option')
                .contains(`${teacher.firstName} ${teacher.lastName.toUpperCase()}`)
                .closest('mat-option')
                .should('have.attr', 'aria-selected', 'true');
        });

        it('should update the form', () => {
            
            const session = mockSessions[0];
            const teacher = mockTeachers.find(t => t.id === session.teacher_id);
            
            if (!teacher) {
                throw new Error('Teacher not found in mock data');
            }

            cy.intercept('PUT', `/api/session/${session.id}`, { body: mockSessions[0] }).as('updateSession');

            cy.get('input[formcontrolname=name]').type('Yoga session');
            cy.get('input[formcontrolname=date]').type('2026-10-04');
            cy.get('textarea[formcontrolname=description]').type('Une session de yoga relaxante');

            cy.get('mat-select[formcontrolname=teacher_id]').click();
            cy.get('mat-option').contains(`${mockTeachers[0].firstName} ${mockTeachers[0].lastName}`);
            cy.get('mat-option').contains(`${mockTeachers[1].firstName} ${mockTeachers[1].lastName}`).click();

            cy.get('button[type=submit]').click();

            cy.wait('@updateSession');

            cy.url().should('include', '/sessions');
        });
    });
});
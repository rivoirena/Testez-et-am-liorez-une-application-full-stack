import { adminUser, regularUser } from "cypress/support/mocks/users.mock";
import { User } from "../../src/app/core/models/user.interface";
import { formatDate } from "../support/utils/date.utils";
import { mockSessions } from "cypress/support/mocks/sessions.mock";
import { mockTeachers } from "cypress/support/mocks/teachers.mock";

describe('Me spec', () => {

    function loginAndGoToMe(user: User) {
        cy.login(user, mockSessions);
        cy.intercept('GET', `/api/user/${user.id}`, { body: user }).as('me');

        cy.get('[routerLink=me]').click();
        cy.wait('@me');

        cy.url().should('include', '/me');

    }
    
    beforeEach(() => {
        // Intercept générique pour le teacher, valable pour tous les tests
        cy.intercept('GET', '/api/teacher/*', { body: mockTeachers[0] }).as('teacherDetails');
    });

    it('Should display admin informations', () => {
        loginAndGoToMe(adminUser);

        const formattedCreatedAt = formatDate(adminUser.createdAt);
        const formattedUpdatedAt = formatDate(adminUser.updatedAt);

        cy.get('h1').should('contain.text', 'User information');

        cy.get('p').should('contain.text', `Email: ${adminUser.email}`);
        cy.get('p').should('contain.text', `Name: ${adminUser.firstName} ${adminUser.lastName.toUpperCase()}`);
        cy.get('p').should('contain.text', 'You are admin');

        cy.get('p').should('not.contain.text', 'Delete my account:');

        cy.get('p').should('contain.text', `${formattedCreatedAt}`);
        cy.get('p').should('contain.text', `${formattedUpdatedAt}`);

    })

    describe('Regular user tests', () => {
        
        beforeEach(() => {
            loginAndGoToMe(regularUser);
        });

        it('Should display user informations', () => {
            const formattedCreatedAt = formatDate(regularUser.createdAt);
            const formattedUpdatedAt = formatDate(regularUser.updatedAt);

            cy.get('mat-icon').contains('arrow_back').should('be.visible');

            cy.get('h1').should('contain.text', 'User information');

            cy.get('p').should('contain.text', `Email: ${regularUser.email}`);
            cy.get('p').should('contain.text', `Name: ${regularUser.firstName} ${regularUser.lastName.toUpperCase()}`);
            cy.get('p').should('contain.text', 'Delete my account:');
            cy.get('p').should('not.contain.text', 'You are admin');

            cy.get('p').should('contain.text', `${formattedCreatedAt}`);
            cy.get('p').should('contain.text', `${formattedUpdatedAt}`);
        });

        it('Should delete user account, redirect to login page and show account deleted message', () => {

            cy.intercept('DELETE', `/api/user/${regularUser.id}`, {
                statusCode: 200,
            }).as('deleteUser');

            cy.get('[data-testid=delete-button]').click();

            cy.wait('@deleteUser');

            // Vérifier la redirection après suppression (généralement vers l'accueil)
            cy.url().should('include', '/login');

            // Optionnel : vérifier qu'on est bien déconnecté (ex: lien login visible)
            cy.get('[routerLink="/login"]').should('be.visible');
            cy.get('simple-snack-bar').should('be.visible');
            cy.get('.mat-mdc-snack-bar-container').should('contain.text', 'Your account has been deleted !');
        });
    });
});


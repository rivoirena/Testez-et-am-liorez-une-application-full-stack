import { mockSessions } from "cypress/support/mocks/sessions.mock";
import { regularUser } from "cypress/support/mocks/users.mock";

describe('Login spec', () => {
  it('Login successfull', () => {

    cy.login(regularUser, mockSessions);

    cy.url().should('include', '/sessions')
  })

  it('Login failed', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: 'Bad credentials',
          path: '/api/auth/login'
      }
    }).as('loginRequest')
    

    cy.get('input[formControlName=email]').type(regularUser.email)
    cy.get('input[formControlName=password]').type(`${regularUser.password}{enter}{enter}`)

    // On attend que la requête ait bien été effectuée
    cy.wait('@loginRequest')

    // On vérifie qu'on reste sur la page register (pas de redirection)
    cy.url().should('include', '/login')

    // On vérifie qu'un message d'erreur s'affiche
    cy.get('.error').should('be.visible')
  })
});
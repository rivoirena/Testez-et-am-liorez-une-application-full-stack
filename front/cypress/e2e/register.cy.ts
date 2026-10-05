describe('Register spec', () => {
  it('Register successfull', () => {
    cy.visit('/register')  

    cy.intercept('POST', '/api/auth/register', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })
    
    cy.get('input[formControlName=firstName]').type("test")
    cy.get('input[formControlName=lastName]').type(`test`)
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/login')
  })


  it('Register fails - email already used', () => {
    cy.visit('/register')

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: 'Error: Email is already taken!'
      }
    }).as('registerRequest')

    cy.get('input[formControlName=firstName]').type("test")
    cy.get('input[formControlName=lastName]').type("test")
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234{enter}")

    // On attend que la requête ait bien été effectuée
    cy.wait('@registerRequest')

    // On vérifie qu'on reste sur la page register (pas de redirection)
    cy.url().should('include', '/register')

    // On vérifie qu'un message d'erreur s'affiche
    cy.get('.error').should('be.visible')
  })
});
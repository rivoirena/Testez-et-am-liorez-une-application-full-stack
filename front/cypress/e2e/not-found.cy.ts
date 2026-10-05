describe('NotFound spec', () => {
  it('Should display not found message', () => {
    cy.visit('/non-existent-route')
    
    cy.url().should('include', '/404')

    cy.get('h1').should('contain.text', 'Page not found !')
  })
});
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * @param source - CSS-селектор исходного элемента
     * @param target - CSS-селектор целевого элемента
     */
    dragAndDrop(source: string, target: string): Chainable<JQuery<HTMLElement>>;
    
    /**
     * @param ingredientName - Имя ингредиента для перетаскивания
     */
    dragIngredientToConstructor(ingredientName: string): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add('dragAndDrop', (source: string, target: string) => {
  cy.get(source).trigger('dragstart');
  cy.get(target).trigger('drop');
  cy.get(source).trigger('dragend');
});

// Перетаскивание ингредиентов в конструктор
Cypress.Commands.add('dragIngredientToConstructor', (ingredientName: string) => {
  cy.contains(ingredientName)
    .parent()
    .parent()
    .trigger('dragstart');
  
  cy.contains('button', 'Оформить заказ')
    .closest('section')
    .trigger('drop');
});

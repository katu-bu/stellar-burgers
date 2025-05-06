/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Добавляет ингредиент в конструктор нажатием на кнопку
     * @param ingredientAlias - Алиас ингредиента
     */
    addIngredient(ingredientAlias: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Настраивает моки для аутентификации
     */
    loginWithMock(): Chainable<void>;

    /**
     * Настраивает моки для API ингредиентов и заказов
     */
    mockApi(): Chainable<void>;

    /**
     * Проверяет наличие ингредиента в конструкторе
     * @param ingredientName - Имя ингредиента
     */
    verifyIngredientInConstructor(
      ingredientName: string
    ): Chainable<JQuery<HTMLElement>>;

    /**
     * Открывает модальное окно ингредиента
     * @param ingredientAlias - Алиас ингредиента
     */
    openIngredientModal(
      ingredientAlias: string
    ): Chainable<JQuery<HTMLElement>>;

    /**
     * Закрывает модальное окно
     */
    closeModal(): Chainable<JQuery<HTMLElement>>;

    /**
     * Создает заказ с базовыми ингредиентами
     */
    createOrder(): Chainable<void>;
  }
}

// Добавление ингредиента в конструктор нажатием на кнопку
Cypress.Commands.add('addIngredient', (ingredientAlias: string) => {
  cy.get(ingredientAlias).parent().find('button').click();
});

// Настройка моков для аутентификации
Cypress.Commands.add('loginWithMock', () => {
  cy.intercept('GET', '**/auth/user', { fixture: 'user.json' }).as('getUser');
  localStorage.setItem('accessToken', 'Bearer test-access-token');
  localStorage.setItem('refreshToken', 'test-refresh-token');
});

// Настройка моков для API ингредиентов и заказов
Cypress.Commands.add('mockApi', () => {
  cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' }).as(
    'getIngredients'
  );
  cy.intercept('POST', '**/orders', { fixture: 'order.json' }).as(
    'createOrder'
  );
});

// Проверка наличия ингредиента в конструкторе
Cypress.Commands.add(
  'verifyIngredientInConstructor',
  (ingredientName: string) => {
    cy.get('@orderButton')
      .closest('section')
      .within(() => {
        cy.contains(ingredientName).should('exist');
      });
  }
);

// Открытие модального окна ингредиента
Cypress.Commands.add('openIngredientModal', (ingredientAlias: string) => {
  cy.get(ingredientAlias).click();
  cy.contains('Детали ингредиента').as('ingredientModal').should('be.visible');
});

// Закрытие модального окна
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-cy="modal-close-button"]').click();
});

// Создание заказа с базовыми ингредиентами
Cypress.Commands.add('createOrder', () => {
  cy.addIngredient('@bunItem');
  cy.addIngredient('@pattyItem');
  cy.addIngredient('@spicySauceItem');
  cy.get('@orderButton').click();
  cy.wait('@createOrder');
});

describe('Тесты конструктора бургера', () => {
  beforeEach(() => {
    // Перехватить API-запрос и подготовить приложение
    cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('должен загружать ингредиенты из мок-данных', () => {
    // Проверка вкладок и ингредиентов
    cy.contains('Булки').should('be.visible');
    cy.contains('Начинки').should('be.visible');
    cy.contains('Соусы').should('be.visible');

    cy.contains('Краторная булка N-200i').should('exist');
    cy.contains('Филе Люминесцентного тетраодонтимформа').should('exist');
    cy.contains('Соус фирменный Space Sauce').should('exist');
  });

  it('должен позволять добавить булку в конструктор через кнопку', () => {
    // Добавление булки и проверка её наличия
    cy.contains('Краторная булка N-200i').parent().find('button').click();

    cy.contains('Краторная булка N-200i (верх)').should('be.visible');
    cy.contains('Краторная булка N-200i (низ)').should('be.visible');
  });

  it('должен позволять добавить начинки в конструктор через кнопку', () => {
    // Добавление и проверка ингредиентов в конструкторе
    cy.contains('Биокотлета из марсианской Магнолии')
      .parent()
      .find('button')
      .click();
    cy.contains('Филе Люминесцентного тетраодонтимформа')
      .parent()
      .find('button')
      .click();

    cy.contains('Соус Spicy-X').parent().find('button').click();
    cy.contains('Соус фирменный Space Sauce').parent().find('button').click();

    cy.contains('button', 'Оформить заказ')
      .closest('section')
      .within(() => {
        cy.contains('Биокотлета из марсианской Магнолии').should('exist');
        cy.contains('Филе Люминесцентного тетраодонтимформа').should('exist');
        cy.contains('Соус Spicy-X').should('exist');
        cy.contains('Соус фирменный Space Sauce').should('exist');
      });
  });

  it('должен позволять добавить несколько ингредиентов для создания полного бургера', () => {
    // Создание полного бургера
    cy.contains('Краторная булка N-200i').parent().find('button').click();

    cy.contains('Биокотлета из марсианской Магнолии')
      .parent()
      .find('button')
      .click();
    cy.contains('Филе Люминесцентного тетраодонтимформа')
      .parent()
      .find('button')
      .click();

    cy.contains('Соус Spicy-X').parent().find('button').click();
    cy.contains('Соус фирменный Space Sauce').parent().find('button').click();

    cy.contains('1255').should('exist'); // Цена булки
    cy.contains('424').should('exist'); // Цена основного ингредиента
    cy.contains('988').should('exist'); // Цена второго основного ингредиента
    cy.contains('90').should('exist'); // Цена соуса
    cy.contains('80').should('exist'); // Цена второго соуса

    cy.contains('button', 'Оформить заказ')
      .should('be.visible')
      .and('not.be.disabled');
  });
});

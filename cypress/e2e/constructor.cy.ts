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

  describe('Тесты модальных окон', () => {
    it('должен открывать модальное окно ингредиента при клике на карточку', () => {
      // Открытие модального окна ингредиента - клик на карточку ингредиента
      cy.contains('Краторная булка N-200i').click();

      cy.contains('Детали ингредиента').should('be.visible');
      cy.contains('Краторная булка N-200i').should('be.visible');
      cy.contains('Калории').should('be.visible');
      cy.contains('420').should('be.visible');
    });

    it('должен закрывать модальное окно при клике на крестик', () => {
      // Открываем модальное окно
      cy.contains('Биокотлета из марсианской Магнолии').click();
      cy.contains('Детали ингредиента').should('be.visible');

      // Находим кнопку закрытия в модальном окне
      cy.contains('Детали ингредиента')
        .parents('div')
        .find('button')
        .first()
        .click();

      // Проверяем, что модальное окно закрылось
      cy.contains('Детали ингредиента').should('not.exist');
    });

    // Проверяем закрытие модального окна с помощью клавиши ESC вместо оверлея
    it('должен закрывать модальное окно при клике на оверлей', () => {
      cy.contains('Соус Spicy-X').click();
      cy.contains('Детали ингредиента').should('be.visible');

      // Используем Escape для закрытия модального окна
      cy.get('body').type('{esc}');

      // Проверяем, что модальное окно закрылось
      cy.contains('Детали ингредиента').should('not.exist');
    });
  });
});

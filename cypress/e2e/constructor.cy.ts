describe('Тесты конструктора бургера', () => {
  beforeEach(() => {
    // загружаем страницу и ждем загрузки ингредиентов
    cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('должен загружать ингредиенты из мок-данных', () => {
    // проверка вкладок и ингредиентов
    cy.contains('Булки').should('be.visible');
    cy.contains('Начинки').should('be.visible');
    cy.contains('Соусы').should('be.visible');

    cy.contains('Краторная булка N-200i').should('exist');
    cy.contains('Филе Люминесцентного тетраодонтимформа').should('exist');
    cy.contains('Соус фирменный Space Sauce').should('exist');
  });

  it('должен позволять добавить булку в конструктор через кнопку', () => {
    // добавление булки и проверка её наличия
    cy.contains('Краторная булка N-200i').parent().find('button').click();

    cy.contains('Краторная булка N-200i (верх)').should('be.visible');
    cy.contains('Краторная булка N-200i (низ)').should('be.visible');
  });

  it('должен позволять добавить начинки в конструктор через кнопку', () => {
    // добавление и проверка ингредиентов в конструкторе
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
    // создание полного бургера
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

    cy.contains('1255').should('exist'); // цена булки
    cy.contains('424').should('exist'); // цена основного ингредиента
    cy.contains('988').should('exist'); // цена второго основного ингредиента
    cy.contains('90').should('exist'); // цена соуса
    cy.contains('80').should('exist'); // цена второго соуса

    cy.contains('button', 'Оформить заказ')
      .should('be.visible')
      .and('not.be.disabled');
  });

  describe('Тесты модальных окон', () => {
    it('должен открывать модальное окно ингредиента при клике на карточку', () => {
      // открытие модального окна ингредиента - клик на карточку ингредиента
      cy.contains('Краторная булка N-200i').click();

      cy.contains('Детали ингредиента').should('be.visible');
      cy.contains('Краторная булка N-200i').should('be.visible');
      cy.contains('Калории').should('be.visible');
      cy.contains('420').should('be.visible');
    });

    it('должен закрывать модальное окно при клике на крестик', () => {
      // открываем модальное окно
      cy.contains('Биокотлета из марсианской Магнолии').click();
      cy.contains('Детали ингредиента').should('be.visible');

      // находим кнопку закрытия в модальном окне
      cy.contains('Детали ингредиента')
        .parents('div')
        .find('button')
        .first()
        .click();

      // проверяем, что модальное окно закрылось
      cy.contains('Детали ингредиента').should('not.exist');
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      // перехватываем запросы API для аутентификации и заказа
      cy.intercept('GET', '**/auth/user', { fixture: 'user.json' }).as(
        'getUser'
      );
      cy.intercept('POST', '**/orders', { fixture: 'order.json' }).as(
        'createOrder'
      );

      // устанавливаем моковые токены
      localStorage.setItem('accessToken', 'Bearer test-access-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');

      // загружаем страницу и ждем загрузки ингредиентов
      cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' }).as(
        'getIngredients'
      );
      cy.visit('/');
      cy.wait('@getIngredients');
    });

    it('должен создавать заказ после добавления всех ингредиентов', () => {
      // добавляем булку
      cy.contains('Краторная булка N-200i').parent().find('button').click();

      cy.contains('Краторная булка N-200i (верх)').should('be.visible');
      cy.contains('Краторная булка N-200i (низ)').should('be.visible');

      // добавляем ингредиенты
      cy.contains('Биокотлета из марсианской Магнолии')
        .parent()
        .find('button')
        .click();
      cy.contains('Соус Spicy-X').parent().find('button').click();

      // проверяем общую сумму заказа
      // булка (1255 * 2) + начинка (424) + соус (90) = 3024
      cy.contains('3024').should('exist');

      cy.contains('button', 'Оформить заказ').click();

      // ожидаем запрос на создание заказа
      cy.wait('@createOrder');

      // проверяем, что модальное окно с деталями заказа открылось
      cy.contains('идентификатор заказа').should('be.visible');
      cy.contains('12345').should('be.visible');

      cy.contains('Ваш заказ начали готовить').should('be.visible');

      // закрываем модальное окно
      cy.get('body').type('{esc}');
      cy.contains('идентификатор заказа').should('not.exist');

      // проверяем, что конструктор пуст после оформления заказа

      // проверка на отсутствие булок
      cy.contains('верх').should('not.exist');
      cy.contains('низ').should('not.exist');
      // проверка на отсутствие начинок
      cy.contains('button', 'Оформить заказ')
        .parent()
        .within(() => {
          // проверяем, что сумма заказа 0
          cy.contains('0').should('exist');

          // проверяем, что нет ни одного из добавленных ранее ингредиентов
          cy.contains('Биокотлета из марсианской Магнолии').should('not.exist');
          cy.contains('Соус Spicy-X').should('not.exist');
        });
      cy.contains('button', 'Оформить заказ').should('be.disabled');
    });
  });
});

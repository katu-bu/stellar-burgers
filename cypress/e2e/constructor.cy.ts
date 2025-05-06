describe('Тесты конструктора бургера', () => {
  beforeEach(() => {
    cy.mockApi();
    cy.visit('/');
    cy.wait('@getIngredients');

    // алиасы для часто используемых элементов
    cy.contains('Краторная булка N-200i').as('bunItem');
    cy.contains('Биокотлета из марсианской Магнолии').as('pattyItem');
    cy.contains('Филе Люминесцентного тетраодонтимформа').as('filletItem');
    cy.contains('Соус Spicy-X').as('spicySauceItem');
    cy.contains('Соус фирменный Space Sauce').as('spaceSauceItem');
    cy.contains('button', 'Оформить заказ').as('orderButton');
  });

  it('должен загружать ингредиенты из мок-данных', () => {
    // проверка вкладок и ингредиентов
    cy.contains('Булки').should('be.visible');
    cy.contains('Начинки').should('be.visible');
    cy.contains('Соусы').should('be.visible');

    cy.get('@bunItem').should('exist');
    cy.get('@filletItem').should('exist');
    cy.get('@spaceSauceItem').should('exist');
  });

  it('должен позволять добавить булку в конструктор через кнопку', () => {
    // добавление булки и проверка её наличия с помощью custom command
    cy.addIngredient('@bunItem');

    cy.contains('Краторная булка N-200i (верх)').should('be.visible');
    cy.contains('Краторная булка N-200i (низ)').should('be.visible');
  });

  it('должен позволять добавить начинки в конструктор через кнопку', () => {
    // добавление и проверка ингредиентов в конструкторе с помощью custom commands
    cy.addIngredient('@pattyItem');
    cy.addIngredient('@filletItem');
    cy.addIngredient('@spicySauceItem');
    cy.addIngredient('@spaceSauceItem');

    cy.get('@orderButton')
      .closest('section')
      .within(() => {
        cy.contains('Биокотлета из марсианской Магнолии').should('exist');
        cy.contains('Филе Люминесцентного тетраодонтимформа').should('exist');
        cy.contains('Соус Spicy-X').should('exist');
        cy.contains('Соус фирменный Space Sauce').should('exist');
      });
  });

  it('должен позволять добавить несколько ингредиентов для создания полного бургера', () => {
    // создание полного бургера с помощью custom commands
    cy.addIngredient('@bunItem');
    cy.addIngredient('@pattyItem');
    cy.addIngredient('@filletItem');
    cy.addIngredient('@spicySauceItem');
    cy.addIngredient('@spaceSauceItem');

    // сохраняем цены в алиасы для проверки
    cy.contains('1255').as('bunPrice').should('exist'); // цена булки
    cy.contains('424').as('pattyPrice').should('exist'); // цена основного ингредиента
    cy.contains('988').as('filletPrice').should('exist'); // цена второго основного ингредиента
    cy.contains('90').as('spicySaucePrice').should('exist'); // цена соуса
    cy.contains('80').as('spaceSaucePrice').should('exist'); // цена второго соуса

    cy.get('@orderButton').should('be.visible').and('not.be.disabled');
  });

  describe('Тесты модальных окон', () => {
    it('должен открывать модальное окно ингредиента при клике на карточку', () => {
      // открытие модального окна ингредиента с помощью custom command
      cy.openIngredientModal('@bunItem');
      cy.get('@bunItem').should('be.visible');
      cy.contains('Калории').should('be.visible');
      cy.contains('420').should('be.visible');
    });

    it('должен закрывать модальное окно при клике на крестик', () => {
      // открываем модальное окно
      cy.get('@pattyItem').click();
      cy.contains('Детали ингредиента')
        .as('ingredientModal')
        .should('be.visible');

      // закрываем модальное окно с помощью custom command
      cy.closeModal();

      // проверяем, что модальное окно закрылось
      cy.get('@ingredientModal').should('not.exist');
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      // используем custom commands для аутентификации и настройки моков API
      cy.loginWithMock();
      cy.mockApi();
      cy.visit('/');
      cy.wait('@getIngredients');
    });

    it('должен создавать заказ после добавления всех ингредиентов', () => {
      // используем custom command для создания заказа
      cy.createOrder();

      // проверяем верхнюю и нижнюю булки
      cy.verifyIngredientInConstructor('Краторная булка N-200i (верх)');
      cy.verifyIngredientInConstructor('Краторная булка N-200i (низ)');

      // проверяем общую сумму заказа
      // булка (1255 * 2) + начинка (424) + соус (90) = 3024
      cy.contains('3024').as('totalPrice').should('exist');

      // проверяем, что модальное окно с деталями заказа открылось
      cy.contains('идентификатор заказа')
        .as('orderNumberTitle')
        .should('be.visible');
      cy.contains('12345').as('orderNumber').should('be.visible');

      cy.contains('Ваш заказ начали готовить')
        .as('orderConfirmation')
        .should('be.visible');

      // закрываем модальное окно
      cy.get('body').type('{esc}');
      cy.get('@orderNumberTitle').should('not.exist');

      // проверяем, что конструктор пуст после оформления заказа

      // проверка на отсутствие булок
      cy.contains('верх').should('not.exist');
      cy.contains('низ').should('not.exist');
      // проверка на отсутствие начинок
      cy.get('@orderButton')
        .parent()
        .within(() => {
          // проверяем, что сумма заказа 0
          cy.contains('0').should('exist');

          // проверяем, что нет ни одного из добавленных ранее ингредиентов
          cy.contains('Биокотлета из марсианской Магнолии').should('not.exist');
          cy.contains('Соус Spicy-X').should('not.exist');
        });
      cy.get('@orderButton').should('be.disabled');
    });
  });
});

import rootReducer from './rootReducer';

describe('rootReducer', () => {
  it('должен содержать все необходимые редюсеры', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });

    const expectedReducers = [
      'ingredients',
      'user',
      'constructorItems',
      'feed',
      'orderModal',
      'orderSuccessModal',
      'myOrders'
    ];

    expectedReducers.forEach((reducerKey) => {
      expect(state).toHaveProperty(reducerKey);
    });

    expect(Object.keys(state)).toHaveLength(expectedReducers.length);
  });

  it('должен возвращать текущее состояние для неизвестного события', () => {
    const currentState = rootReducer(undefined, { type: '@@INIT' });
    const newState = rootReducer(currentState, { type: 'UNKNOWN_ACTION' });

    expect(newState).toEqual(currentState);
  });
});

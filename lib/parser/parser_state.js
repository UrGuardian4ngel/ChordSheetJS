import ELSE from './else';

export default class ParserState {
  constructor(name, callback) {
    this.name = name;
    this.conditions = [];
    this.conditionCount = 0;
    callback.apply(this, [this]);
  }

  on(condition, callback) {
    conditionObj = new ParserCondition(condition, callback)
    this.conditions[this.conditionCount++] = conditionObj
  }

  ignore(conditions) {
    for (let i = 0, length = arguments.length; i < length; i++) {
      let condition = arguments[i];
      this.on(condition, () => {});
    }
  }

  else(callback) {
    this.on(ELSE, callback)
  }
}

class ParserCondition {
  constructor(condition, callback) {
    this.condition = condition;
    this.callback = callback;
  }
}

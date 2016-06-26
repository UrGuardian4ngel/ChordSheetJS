import ELSE from './else';
import ParserState from './parser_state';

export default class ParserBase {
  constructor() {
    this.cursor = 0;
    this.debugging = false;
    this.waitForExpr = null;
    this.states = {};
    this.namelessConditionIndex = 0;
    this.currentState = null;
  }

  waitFor(waitForExpr) {
    this.waitForExpr = waitForExpr;
  }

  error(message) {
    console.error(message);
  }

  debug(message, level = 0) {
    if (this.debugging) {
      let indentation = '';
      for(let l = 0; l < level; l++, indentation += '    ');
      console.log(indentation + message);
    }
  }

  handleWaitForExpr(chr) {
    if (this.testCondition(this.waitForExpr, chr)) {
      this.debug(`Was waiting for ${this.waitForExpr}, now found`, 1);
      this.waitForExpr = null;
    } else {
      this.debug(`Still waiting for ${this.waitForExpr}`, 1);
    }
  }

  char(chr) {
    switch(chr) {
      case '\n':
        return '<NEW LINE>';
      case ' ':
        return '<SPACE>';
      default:
        return chr;
    }
  }

  parse(contents) {
    const length = contents.length;

    for (this.cursor = 0; this.cursor < length; this.cursor++) {
      const chr = contents[this.cursor];
      this.debug(`${this.char(chr)} #####`);

      if (this.waitForExpr) {
        this.handleWaitForExpr(chr);
        continue;
      }

      this.debug(`No expression to wait for, testing conditions`, 1);
      this.testConditions(chr);
    }
  }

  getNewState(chr, callback) {
    let newState = callback.call(this, chr);

    if (newState &&
        newState != this.currentState &&
        newState instanceof ParserState) {
      return this.currentState = newState;
    }

    return null;
  }

  retryWith(name) {
    this.cursor--;
    return this.transitionTo(name);
  }

  transitionTo(name) {
    return this.currentState = this.states[name];
  }

  testConditions(chr) {
    this.currentState.conditions.some((condition) => {
      this.debug(`Condition ${condition.condition}`, 1);

      if (this.testCondition(condition.condition, chr)) {
        let newState = null;
        this.debug(`Matches condition, calling callback` +
          condition.callback, 2);

        if ((newState = this.getNewState(chr, condition.callback))) {
          this.debug(`New state: ${newState.name}`, 1);
        } else {
          this.debug(`State remains ${this.currentState.name}`);
        }
        
        // Break out of this loop as soon as a condition was handled.
        return true;
      }
    });
  }

  testCondition(condition, chr) {
    if (condition === ELSE) {
      this.debug('Condition is ELSE conditions, so condition matches', 3);
      return true
    } else if (condition instanceof RegExp) {
      if (condition.test(chr)) {
        this.debug(`${chr} matches regex ${condition}`, 3);
        return true;
      }
    } else if (typeof condition == 'string') {
      if (condition == chr) {
        this.debug(`${chr} equals string ${this.char(condition)}`, 3);
        return true;
      }
    } else {
      this.debug(`Invalid condition ${condition}`, 3);
    }

    return false;
  }

  state(name, callback) {
    if (typeof(callback) !== 'undefined') {
      this.states[name] = new ParserState(name, callback);
    }
    
    return this.states[name];
  }
}

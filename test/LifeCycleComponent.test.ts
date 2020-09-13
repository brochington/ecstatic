import { expect } from 'chai';
import LifeCycleComponent from '../src/LifecycleComponent';

enum CompTypes {
  FirstComponent,
  SecondComponent,
}

interface TestCompStorage {
  id: string;
}

class FirstComponent extends LifeCycleComponent<CompTypes, TestCompStorage> {
  type: CompTypes.FirstComponent;

  constructor(id: string) {
    super({ id });
  }
}

describe('LifeCycleComponent', () => {
  it('exists', () => {
    const testCLComp = new FirstComponent('something');

    expect(testCLComp).to.be.instanceof(LifeCycleComponent);
  });

  // TODO: Add a whole bunch more tests!!!
});

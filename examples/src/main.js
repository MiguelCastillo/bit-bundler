import Other from './other';

class Main {
  constructor() {
    this._other = new Other();
  }

  render() {
    console.log(`render:main`);
    this._other.render();
  }
}

(new Main()).render();

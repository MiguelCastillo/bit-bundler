import Renderit from './renderer/render-it';

class Other extends Renderit {
  constructor() {
    super();
  }

  render() {
    this.super();
    console.log(`render:other`);
  }
}

export default Other;
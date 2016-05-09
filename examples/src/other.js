import RenderIt from './renderer/render-it';

class Other extends RenderIt {
  constructor() {
    super();
  }

  render() {
    super.render();
    console.log(`render:other`);
  }
}

export default Other;

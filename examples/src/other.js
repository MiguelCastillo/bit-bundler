import RenderIt from './renderer/render-it';
import mainRecursive from './main';

class Other extends RenderIt {
  constructor() {
    super();
  }

  render() {
    super.render();
    console.log(`render:other`);
    console.log('test recursive', mainRecursive);
  }
}

export default Other;

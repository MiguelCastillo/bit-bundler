import RenderIt from './renderer/render-it';
import mainRecursive from './main';
import log2console from 'log2console';

class Other extends RenderIt {
  constructor() {
    super();
  }

  render() {
    super.render();
    log2console(`render:other`);
    log2console('test recursive', mainRecursive);
  }
}

export default Other;

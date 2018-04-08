import scheduler from '../../scheduler';
import run from 'ember-runloop';

const DEFAULT_ARRAY_SIZE = 10;

export class ScrollHandler {
  constructor() {
    this.elements = new Array(DEFAULT_ARRAY_SIZE);
    this.maxLength = DEFAULT_ARRAY_SIZE;
    this.length = 0;
    this.handlers = new Array(DEFAULT_ARRAY_SIZE);
    this.isPolling = false;
  }

  addElementHandler(element, handler) {
    let index = this.elements.indexOf(element);

    if (index === -1) {
      index = this.length++;

      if (index === this.maxLength) {
        this.maxLength *= 2;
        this.elements.length = this.maxLength;
        this.handlers.length = this.maxLength;
      }

      this.elements[index] = element;
      this.handlers[index] =  { top: undefined, left: undefined, handlers: [handler] };
    } else {
      let handlers = this.handlers[index].handlers;

      handlers.push(handler);
    }

    if (!this.isPolling) {
      this.poll();
    }
  }

  removeElementHandler(element, handler) {
    let index = this.elements.indexOf(element);
    let elementCache = this.handlers[index];

    if (elementCache && elementCache.handlers) {
      let index = elementCache.handlers.indexOf(handler);

      if (index === -1) {
        throw new Error('Attempted to remove an unattached handler');
      }

      elementCache.handlers.splice(index, 1);

      // cleanup element entirely if needed
      if (!elementCache.handlers.length) {
        this.handlers.splice(index, 1);

        index = this.elements.indexOf(element);
        this.elements.splice(index, 1);
        this.length--;
        this.maxLength--;
      }

    } else {
      throw new Error('Attempted to remove an unattached handler');
    }
  }

  poll() {
    this.isPolling = true;

    scheduler.schedule('sync', () => {
      for (let i = 0; i < this.length; i++) {
        let element = this.elements[i];
        let info = this.handlers[i];
        let cachedTop = element.scrollTop;
        let cachedLeft = element.scrollLeft;
        let topChanged = cachedTop !== info.top && info.top !== undefined;
        let leftChanged = cachedLeft !== info.left && info.left !== undefined;

        info.top = cachedTop;
        info.left = cachedLeft;

        if (topChanged || leftChanged) {
          run.join(() => {
            for (let j = 0; j < info.handlers.length; j++) {
              info.handlers[j].call(null, info);
            }
          });
        }
      }

      this.isPolling = this.length > 0;
      if (this.isPolling) {
        this.poll();
      }
    });
  }

}

const instance = new ScrollHandler();

export function addScrollHandler(element, handler) {
  instance.addElementHandler(element, handler);
}

export function removeScrollHandler(element, handler) {
  instance.removeElementHandler(element, handler);
}

export default instance;

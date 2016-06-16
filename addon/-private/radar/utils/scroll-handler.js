import CacheList from '../../cache-list';

const DEFAULT_ARRAY_SIZE = 10;

export class ScrollHandler {

  constructor() {
    this.elements = new Array(DEFAULT_ARRAY_SIZE);
    this.maxLength = DEFAULT_ARRAY_SIZE;
    this.length = 0;
    this.handlers = new CacheList();
    this.isPolling = false;
  }

  addElementHandler(element, handler) {
    let index = this.length++;

    if (this.elements.indexOf(element) === -1) {
      if (index === this.maxLength) {
        this.maxLength *= 2;
        this.elements.length = this.maxLength;
      }

      this.elements[index] = element;
      this.handlers.set(element, { top: undefined, left: undefined, handlers: [handler] });
    } else {
      let handlers = this.handlers.get(element).handlers;

      handlers.push(handler);
    }

    if (!this.isPolling) {
      this.isPolling = true;
      this.poll();
    }
  }

  removeElementHandler(element, handler) {
    let handlers = this.handlers.get(element).handlers;

    if (handlers) {
      let index = handlers.indexOf(handler);

      if (index === -1) {
        throw new Error('Attempted to remove an unattached handler');
      }

      handlers.splice(index, 1);

      // cleanup element entirely if needed
      if (!handlers.length) {
        this.handlers.remove(element);

        index = this.elements.indexOf(element);
        this.elements[index].splice(index, 1);
        this.length--;
        this.maxLength--;
      }
    }

    throw new Error('Attempted to remove an unattached handler');
  }

  poll() {
    requestAnimationFrame(() => {
      for (let i = 0; i < this.length; i++) {
        let element = this.elements[i];
        let info = this.handlers.get(element);
        let topChanged = element.scrollTop !== info.top && info.top !== undefined;
        let leftChanged = element.scrollLeft !== info.left && info.left !== undefined;

        info.top = element.scrollTop;
        info.left = element.scrollLeft;

        if (topChanged || leftChanged) {
          Promise.resolve(info)
            .then((info) => {
              for (let j = 0; j < info.handlers.length; j++) {
                info.handlers[j].call(null, { top: info.top, left: info.left });
              }
            });
        }
      }

      if (this.length) {
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

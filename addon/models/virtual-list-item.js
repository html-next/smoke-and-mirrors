export default class VirtualListItem {

  constructor(index) {
    this.index = index;
    this.model = null;
    this.satellite = null;
    this.element = null;
    this.style = null;
    this.state = null;
    this.zoneX = 0;
    this.zoneY = 0;
  }

  setInitialStyle(obj) {}

  zoneDidChange(/*zY, zX*/) {}


}

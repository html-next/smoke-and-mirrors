let ID = 0;

export default class RecycleContainer {
  constructor(content, position) {
    this.content = content || null;
    this.position = position || 0;
    this.id = ID++;
  }
}

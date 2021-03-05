import $ from 'cash-dom';
class DraggableRowsJquery {
  constructor(className) {
    this.className = className;
  }
  init() {
    $(`.${this.className}`).draggable({
      appendTo: 'body',
      scroll: false,
    });
  }
}
export default DraggableRowsJquery;

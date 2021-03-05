class DraggableRows {
  constructor(table) {
    this.bind();
    this.table = table;

    this.draggingEle = null;
    this.draggingRowIndex = null;
    this.placeholder = null;
    this.list = null;
    this.isDraggingStarted = false;
    // The current position of mouse relative to the dragging element
    this.x = 0;
    this.y = 0;
  }
  bind = () => {
    ['mouseDownHandler', 'isAbove', 'cloneTable', 'mouseMoveHandler', 'mouseUpHandler'].forEach(
      (fn) => (this[fn] = this[fn].bind(this))
    );
  };
  mouseDownHandler = (e) => {
    // Get the original row
    const originalRow = e.target.parentNode.closest('tr');
    this.draggingRowIndex = [].slice.call(this.table.querySelectorAll('tr')).indexOf(originalRow);

    // Determine the mouse position
    this.x = e.clientX;
    this.y = e.clientY;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  };
  // Swap two nodes
  swap = (nodeA, nodeB) => {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
  };

  // Check if `nodeA` is above `nodeB`
  isAbove = (nodeA, nodeB) => {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
  };

  cloneTable = () => {
    // const rect = this.table.getBoundingClientRect();
    const width = parseInt(window.getComputedStyle(this.table).width);

    this.list = document.createElement('div');
    this.list.classList.add('clone-list');
    this.list.style.position = 'absolute';
    // this.list.style.left = `${rect.left}px`;
    // this.list.style.top = `${rect.top}px`;
    this.table.parentNode.insertBefore(this.list, this.table);

    // Hide the original this.table
    // this.table.style.visibility = 'hidden';
    var self = this;
    this.table.querySelectorAll('tr').forEach(function (row) {
      // Create a new table from given row
      const item = document.createElement('div');
      item.classList.add('draggable');

      const newTable = document.createElement('table');
      newTable.setAttribute('class', 'clone-table');
      newTable.style.width = `${width}px`;

      const newRow = document.createElement('tr');
      const cells = [].slice.call(row.children);
      cells.forEach(function (cell) {
        const newCell = cell.cloneNode(true);
        newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
        newRow.appendChild(newCell);
      });

      newTable.appendChild(newRow);
      item.appendChild(newTable);
      self.list.appendChild(item);
    });
  };

  mouseMoveHandler = (e) => {
    if (!this.isDraggingStarted) {
      this.table.style.visibility = 'hidden';
      this.isDraggingStarted = true;

      this.cloneTable();

      this.draggingEle = [].slice.call(this.list.children)[this.draggingRowIndex];
      this.draggingEle.classList.add('dragging');

      // Let the this.placeholder take the height of dragging element
      // So the next element won't move up
      this.placeholder = document.createElement('div');
      this.placeholder.classList.add('placeholder');
      this.draggingEle.parentNode.insertBefore(this.placeholder, this.draggingEle.nextSibling);
      this.placeholder.style.height = `${this.draggingEle.offsetHeight}px`;
    }

    // Set position for dragging element
    this.draggingEle.style.position = 'absolute';
    this.draggingEle.style.top = `${this.draggingEle.offsetTop + e.clientY - this.y}px`;
    this.draggingEle.style.left = `${this.draggingEle.offsetLeft + e.clientX - this.x}px`;
    // Reassign the position of mouse
    this.x = e.clientX;
    this.y = e.clientY;

    // The current order
    // prevEle
    // this.draggingEle
    // this.placeholder
    // nextEle
    const prevEle = this.draggingEle.previousElementSibling;
    const nextEle = this.placeholder.nextElementSibling;

    // The dragging element is above the previous element
    // User moves the dragging element to the top
    // We don't allow to drop above the header
    // (which doesn't have `previousElementSibling`)
    if (prevEle && prevEle.previousElementSibling && this.isAbove(this.draggingEle, prevEle)) {
      // The current order    -> The new order
      // prevEle              -> this.placeholder
      // this.draggingEle          -> this.draggingEle
      // this.placeholder          -> prevEle
      this.swap(this.placeholder, this.draggingEle);
      this.swap(this.placeholder, prevEle);
      return;
    }

    // The dragging element is below the next element
    // User moves the dragging element to the bottom
    if (nextEle && this.isAbove(nextEle, this.draggingEle)) {
      // The current order    -> The new order
      // this.draggingEle          -> nextEle
      // this.placeholder          -> this.placeholder
      // nextEle              -> this.draggingEle
      this.swap(nextEle, this.placeholder);
      this.swap(nextEle, this.draggingEle);
    }
  };

  mouseUpHandler = () => {
    // Remove the this.placeholder
    this.placeholder && this.placeholder.parentNode.removeChild(this.placeholder);

    if (this.draggingEle) {
      this.draggingEle.classList.remove('dragging');
      this.draggingEle.style.removeProperty('top');
      this.draggingEle.style.removeProperty('left');
      this.draggingEle.style.removeProperty('position');

      // Get the end index
      const endRowIndex = [].slice.call(this.list.children).indexOf(this.draggingEle);

      this.isDraggingStarted = false;

      // Remove the `list` element
      this.list.parentNode.removeChild(this.list);

      // Move the dragged row to `endRowIndex`
      let rows = [].slice.call(this.table.querySelectorAll('tr'));
      this.draggingRowIndex > endRowIndex
        ? rows[endRowIndex].parentNode.insertBefore(rows[this.draggingRowIndex], rows[endRowIndex])
        : rows[endRowIndex].parentNode.insertBefore(rows[this.draggingRowIndex], rows[endRowIndex].nextSibling);

      // Bring back the table
      this.table.style.removeProperty('visibility');

      // Remove the handlers of `mousemove` and `mouseup`
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mouseup', this.mouseUpHandler);
    }
  };
  init = () => {
    var self = this;
    this.table.querySelectorAll('tr').forEach(function (row, index) {
      // Ignore the header
      // We don't want user to change the order of header
      if (index === 0) {
        return;
      }
      const firstCell = row.firstElementChild; //firstCell is the handler of the draggable-indicator
      //because we don't want all the row to be selected for draggable since you want to click at other cols
      firstCell.addEventListener('mousedown', self.mouseDownHandler);
    });
  };
}
export default DraggableRows;

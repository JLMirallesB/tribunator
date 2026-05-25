window.Tribunator = window.Tribunator || {};

Tribunator.Utils = {
  el: function(tag, attrs, children) {
    var elem = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        if (key === 'className') {
          elem.className = attrs[key];
        } else if (key === 'textContent') {
          elem.textContent = attrs[key];
        } else if (key === 'innerHTML') {
          elem.innerHTML = attrs[key];
        } else if (key.startsWith('on')) {
          elem.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
        } else if (key === 'dataset') {
          Object.keys(attrs[key]).forEach(function(dk) {
            elem.dataset[dk] = attrs[key][dk];
          });
        } else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(elem.style, attrs[key]);
        } else {
          elem.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function(child) {
        if (!child) return;
        if (typeof child === 'string') {
          elem.appendChild(document.createTextNode(child));
        } else {
          elem.appendChild(child);
        }
      });
    }
    return elem;
  },

  clearElement: function(elem) {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  },

  showModal: function(options) {
    var overlay = this.el('div', { className: 'modal-overlay' });
    var modal = this.el('div', { className: 'modal' });

    if (options.title) {
      modal.appendChild(this.el('div', { className: 'modal-header' }, [
        this.el('h3', { className: 'modal-title', textContent: options.title }),
        this.el('button', {
          className: 'btn-icon modal-close',
          textContent: '×',
          onClick: function() { overlay.remove(); if (options.onCancel) options.onCancel(); }
        })
      ]));
    }

    var body = this.el('div', { className: 'modal-body' });
    if (typeof options.body === 'string') {
      body.innerHTML = options.body;
    } else if (options.body) {
      body.appendChild(options.body);
    }
    modal.appendChild(body);

    if (options.buttons) {
      var footer = this.el('div', { className: 'modal-footer' });
      options.buttons.forEach(function(btn) {
        footer.appendChild(Tribunator.Utils.el('button', {
          className: 'btn ' + (btn.className || 'btn-secondary'),
          textContent: btn.text,
          onClick: function() {
            if (btn.action) btn.action();
            if (btn.close !== false) overlay.remove();
          }
        }));
      });
      modal.appendChild(footer);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
        if (options.onCancel) options.onCancel();
      }
    });

    return overlay;
  },

  showConfirm: function(message, onConfirm) {
    this.showModal({
      title: t('common.confirm'),
      body: this.el('p', { textContent: message }),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.confirm'), className: 'btn-danger', action: onConfirm }
      ]
    });
  },

  showImportDialog: function(onReplace, onMerge) {
    this.showModal({
      title: t('export.importWarning'),
      body: this.el('p', { textContent: t('export.importWarning') }),
      buttons: [
        { text: t('export.importCancel'), className: 'btn-secondary' },
        { text: t('export.importMerge'), className: 'btn-primary', action: onMerge },
        { text: t('export.importReplace'), className: 'btn-danger', action: onReplace }
      ]
    });
  },

  showToast: function(message, type) {
    type = type || 'success';
    var toast = this.el('div', { className: 'toast toast-' + type, textContent: message });
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('toast-visible'); }, 10);
    setTimeout(function() {
      toast.classList.remove('toast-visible');
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  },

  downloadFile: function(content, filename, mimeType) {
    mimeType = mimeType || 'application/json';
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  readFile: function(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) { callback(null, e.target.result); };
    reader.onerror = function() { callback(t('export.fileError')); };
    reader.readAsText(file);
  },

  areCellsContiguous: function(cells) {
    if (cells.length <= 1) return true;
    var visited = {};
    var queue = [cells[0]];
    visited[cells[0].col + ',' + cells[0].row] = true;
    var count = 1;
    var cellSet = {};
    cells.forEach(function(c) { cellSet[c.col + ',' + c.row] = true; });

    while (queue.length > 0) {
      var current = queue.shift();
      var neighbors = [
        { col: current.col - 1, row: current.row },
        { col: current.col + 1, row: current.row },
        { col: current.col, row: current.row - 1 },
        { col: current.col, row: current.row + 1 }
      ];
      neighbors.forEach(function(n) {
        var key = n.col + ',' + n.row;
        if (cellSet[key] && !visited[key]) {
          visited[key] = true;
          queue.push(n);
          count++;
        }
      });
    }
    return count === cells.length;
  },

  debounce: function(fn, delay) {
    var timer;
    return function() {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(context, args); }, delay);
    };
  },

  _collapsedSections: {},

  collapsibleSection: function(id, title, rightEl, contentFn) {
    var self = this;
    var isCollapsed = this._collapsedSections[id] || false;
    var section = this.el('div', { className: 'sidebar-section' });
    var toggle = isCollapsed ? '▸' : '▾';
    var header = this.el('div', {
      className: 'sidebar-header collapsible',
      onClick: function() {
        self._collapsedSections[id] = !self._collapsedSections[id];
        body.className = self._collapsedSections[id] ? 'sidebar-section-body collapsed' : 'sidebar-section-body';
        toggleEl.textContent = self._collapsedSections[id] ? '▸' : '▾';
      }
    });
    var toggleEl = this.el('span', { textContent: toggle, style: { marginRight: '6px', fontSize: '9px' } });
    var titleEl = this.el('span', { textContent: title });
    var leftGroup = this.el('span', { style: { display: 'flex', alignItems: 'center' } }, [toggleEl, titleEl]);
    header.appendChild(leftGroup);
    if (rightEl) header.appendChild(rightEl);
    section.appendChild(header);
    var body = this.el('div', { className: isCollapsed ? 'sidebar-section-body collapsed' : 'sidebar-section-body' });
    contentFn(body);
    section.appendChild(body);
    return section;
  }
};

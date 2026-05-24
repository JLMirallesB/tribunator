window.Tribunator = window.Tribunator || {};

Tribunator.Space = {
  currentCampusId: null,
  currentFloorId: null,
  currentView: 'plan',
  selectedCells: [],
  editingRoomId: null,
  mergeMode: false,
  isMouseDown: false,
  highlightGroupId: null,
  tooltip: null,
  _roomListTableContainer: null,
  selectedDayId: null,
  zoomLevel: 1.0,

  init: function() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'room-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
    var self = this;
    document.addEventListener('mouseup', function() { self.isMouseDown = false; self._dragOrigin = false; });
    document.addEventListener('mouseleave', function() { self.isMouseDown = false; self._dragOrigin = false; });
    document.addEventListener('mousemove', function(e) {
      if (self.tooltip.style.display === 'block') {
        self.tooltip.style.left = (e.clientX + 14) + 'px';
        self.tooltip.style.top = (e.clientY + 14) + 'px';
      }
    });
  },

  render: function() {
    var container = document.getElementById('phase-space');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'flex';

    var sidebar = Tribunator.Utils.el('div', { className: 'sidebar', id: 'space-sidebar' });
    var main = Tribunator.Utils.el('div', { className: 'main-area', id: 'space-main' });

    container.appendChild(sidebar);
    container.appendChild(main);

    this.renderSidebar();
    this.renderMain();
  },

  // --- SIDEBAR ---
  renderSidebar: function() {
    var sidebar = document.getElementById('space-sidebar');
    Tribunator.Utils.clearElement(sidebar);
    var self = this;
    var store = Tribunator.Store;

    // Campuses section
    var campusSection = Tribunator.Utils.el('div', { className: 'sidebar-section' });
    var campusHeader = Tribunator.Utils.el('div', { className: 'sidebar-header' }, [
      t('space.campuses'),
      Tribunator.Utils.el('button', {
        className: 'btn-icon',
        textContent: '+',
        title: t('space.addCampus'),
        onClick: function() { self.promptAddCampus(); }
      })
    ]);
    campusSection.appendChild(campusHeader);

    var campuses = store.getCampuses();
    if (campuses.length === 0) {
      campusSection.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-empty', textContent: t('space.noCampuses') }));
    } else {
      campuses.forEach(function(campus) {
        var isActive = campus.id === self.currentCampusId;
        var item = Tribunator.Utils.el('div', {
          className: 'sidebar-item' + (isActive ? ' active' : ''),
          onClick: function(e) {
            if (e.target.closest('.sidebar-item-actions')) return;
            self.selectCampus(campus.id);
          }
        }, [
          Tribunator.Utils.el('span', { className: 'sidebar-item-name', textContent: campus.name }),
          Tribunator.Utils.el('div', { className: 'sidebar-item-actions' }, [
            Tribunator.Utils.el('button', {
              className: 'btn-icon btn-sm',
              textContent: '✎',
              title: t('common.edit'),
              onClick: function() { self.promptEditCampus(campus.id); }
            }),
            Tribunator.Utils.el('button', {
              className: 'btn-icon btn-sm',
              textContent: '×',
              title: t('common.delete'),
              onClick: function() { self.promptDeleteCampus(campus.id); }
            })
          ])
        ]);
        campusSection.appendChild(item);

        if (isActive) {
          // Floors sub-section
          var floorHeader = Tribunator.Utils.el('div', {
            className: 'sidebar-header sidebar-indent',
            style: { paddingTop: '4px', paddingBottom: '4px' }
          }, [
            t('space.floors'),
            Tribunator.Utils.el('button', {
              className: 'btn-icon',
              textContent: '+',
              title: t('space.addFloor'),
              onClick: function() { self.promptAddFloor(campus.id); }
            })
          ]);
          campusSection.appendChild(floorHeader);

          if (campus.floors.length === 0) {
            campusSection.appendChild(Tribunator.Utils.el('div', {
              className: 'sidebar-empty sidebar-indent',
              textContent: t('space.noFloors')
            }));
          } else {
            campus.floors.forEach(function(floor) {
              var isFloorActive = floor.id === self.currentFloorId;
              var floorItem = Tribunator.Utils.el('div', {
                className: 'sidebar-item sidebar-indent' + (isFloorActive ? ' active' : ''),
                onClick: function(e) {
                  if (e.target.closest('.sidebar-item-actions')) return;
                  self.selectFloor(campus.id, floor.id);
                }
              }, [
                Tribunator.Utils.el('span', { className: 'sidebar-item-name', textContent: floor.name }),
                Tribunator.Utils.el('div', { className: 'sidebar-item-actions' }, [
                  Tribunator.Utils.el('button', {
                    className: 'btn-icon btn-sm',
                    textContent: '✎',
                    title: t('common.edit'),
                    onClick: function() { self.promptEditFloor(campus.id, floor.id); }
                  }),
                  Tribunator.Utils.el('button', {
                    className: 'btn-icon btn-sm',
                    textContent: '↑',
                    title: t('common.moveUp'),
                    onClick: function() { Tribunator.Store.moveFloor(campus.id, floor.id, 'up'); self.renderSidebar(); }
                  }),
                  Tribunator.Utils.el('button', {
                    className: 'btn-icon btn-sm',
                    textContent: '↓',
                    title: t('common.moveDown'),
                    onClick: function() { Tribunator.Store.moveFloor(campus.id, floor.id, 'down'); self.renderSidebar(); }
                  }),
                  Tribunator.Utils.el('button', {
                    className: 'btn-icon btn-sm',
                    title: t('space.duplicateFloor'),
                    textContent: '⧉',
                    onClick: function() { self.duplicateFloor(campus.id, floor.id); }
                  }),
                  Tribunator.Utils.el('button', {
                    className: 'btn-icon btn-sm',
                    textContent: '×',
                    title: t('common.delete'),
                    onClick: function() { self.promptDeleteFloor(campus.id, floor.id); }
                  })
                ])
              ]);
              campusSection.appendChild(floorItem);
            });
          }
        }
      });
    }
    sidebar.appendChild(campusSection);

    // Groups section
    var groupSection = Tribunator.Utils.el('div', { className: 'sidebar-section' });
    groupSection.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-header' }, [
      t('space.groups'),
      Tribunator.Utils.el('button', {
        className: 'btn-icon',
        textContent: '+',
        title: t('space.addGroup'),
        onClick: function() { self.promptAddGroup(); }
      })
    ]));

    var groups = store.getGroups();
    if (groups.length === 0) {
      groupSection.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-empty', textContent: t('space.noGroups') }));
    } else {
      groups.forEach(function(group) {
        var warnings = store.getGroupWarnings(group.id);
        var warningIcon = warnings.length > 0 ? ' ⚠' : '';
        groupSection.appendChild(Tribunator.Utils.el('div', {
          className: 'sidebar-item',
          onClick: function(e) {
            if (e.target.closest('.sidebar-item-actions')) return;
            self.promptEditGroup(group.id);
          },
          onMouseenter: function() { self.highlightGroup(group.id); },
          onMouseleave: function() { self.highlightGroup(null); }
        }, [
          Tribunator.Utils.el('span', { className: 'sidebar-item-name', textContent: group.name + warningIcon }),
          Tribunator.Utils.el('div', { className: 'sidebar-item-actions' }, [
            Tribunator.Utils.el('button', {
              className: 'btn-icon btn-sm',
              textContent: '✎',
              title: t('common.edit'),
              onClick: function() { self.promptEditGroup(group.id); }
            }),
            Tribunator.Utils.el('button', {
              className: 'btn-icon btn-sm',
              textContent: '×',
              title: t('common.delete'),
              onClick: function() { self.promptDeleteGroup(group.id); }
            })
          ])
        ]));
      });
    }
    sidebar.appendChild(groupSection);

    // Custom fields section
    var fieldsSection = Tribunator.Utils.el('div', { className: 'sidebar-section' });
    fieldsSection.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-header' }, [
      t('space.customFields'),
      Tribunator.Utils.el('button', {
        className: 'btn-icon',
        textContent: '+',
        title: t('space.addField'),
        onClick: function() { self.promptAddCustomField(); }
      })
    ]));

    var fieldDefs = store.getCustomFieldDefs();
    fieldDefs.forEach(function(field) {
      fieldsSection.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-item' }, [
        Tribunator.Utils.el('span', { className: 'sidebar-item-name' }, [
          Tribunator.Utils.el('span', { textContent: field.name }),
          Tribunator.Utils.el('span', { className: 'field-list-type', textContent: ' ' + t('common.' + field.type), style: { marginLeft: '6px' } })
        ]),
        Tribunator.Utils.el('div', { className: 'sidebar-item-actions' }, [
          Tribunator.Utils.el('button', {
            className: 'btn-icon btn-sm',
            textContent: '✎',
            onClick: function() { self.promptEditCustomField(field.id); }
          }),
          Tribunator.Utils.el('button', {
            className: 'btn-icon btn-sm',
            textContent: '×',
            onClick: function() { self.promptDeleteCustomField(field.id); }
          })
        ])
      ]));
    });
    sidebar.appendChild(fieldsSection);

    // Export/Import bar
    var ioBar = Tribunator.Utils.el('div', { className: 'sidebar-section' });
    ioBar.appendChild(Tribunator.Utils.el('div', { className: 'sidebar-header' }, [
      t('common.export') + ' / ' + t('common.import')
    ]));
    var ioBody = Tribunator.Utils.el('div', { style: { padding: '8px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' } });
    ioBody.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm',
      textContent: t('export.exportSpaces'),
      onClick: function() { self.exportSpaces(); }
    }));
    ioBody.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm',
      textContent: t('export.exportAll'),
      onClick: function() { self.exportAll(); }
    }));

    var fileInput = Tribunator.Utils.el('input', {
      type: 'file',
      accept: '.json',
      className: 'file-input-hidden',
      id: 'import-file-input',
      onChange: function(e) { self.handleImport(e); }
    });
    ioBody.appendChild(fileInput);
    ioBody.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm',
      textContent: t('export.importData'),
      onClick: function() { fileInput.click(); }
    }));
    ioBar.appendChild(ioBody);
    sidebar.appendChild(ioBar);
  },

  // --- MAIN AREA ---
  renderMain: function() {
    var main = document.getElementById('space-main');
    Tribunator.Utils.clearElement(main);
    var self = this;

    if (!this.currentCampusId || !this.currentFloorId) {
      main.appendChild(Tribunator.Utils.el('div', { className: 'empty-state' }, [
        Tribunator.Utils.el('div', { className: 'empty-state-icon', textContent: '⬚' }),
        Tribunator.Utils.el('div', { className: 'empty-state-text', textContent: t('space.noCampuses') }),
        Tribunator.Utils.el('button', {
          className: 'btn btn-primary',
          textContent: t('space.addCampus'),
          onClick: function() { self.promptAddCampus(); }
        })
      ]));
      return;
    }

    var campus = Tribunator.Store.getCampus(this.currentCampusId);
    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    if (!campus || !floor) return;

    // Mobile warning
    main.appendChild(Tribunator.Utils.el('div', { className: 'mobile-warning', textContent: t('space.mobileWarning') }));

    // Header with view toggle
    var header = Tribunator.Utils.el('div', { className: 'main-area-header' });
    header.appendChild(Tribunator.Utils.el('div', { className: 'main-area-title', textContent: campus.name + ' — ' + floor.name }));

    var viewToggle = Tribunator.Utils.el('div', { className: 'btn-group' });
    viewToggle.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm' + (this.currentView === 'plan' ? ' active' : ''),
      textContent: t('space.viewPlan'),
      onClick: function() { self.setView('plan'); }
    }));
    viewToggle.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm' + (this.currentView === 'list' ? ' active' : ''),
      textContent: t('space.viewList'),
      onClick: function() { self.setView('list'); }
    }));

    // Day selector for occupation view
    var days = Tribunator.Store.getDays();
    var activeSol = Tribunator.Store.getActiveSolution();
    var daySelect = null;
    if (days.length > 0 && activeSol) {
      daySelect = Tribunator.Utils.el('select', { className: 'filter-select', onChange: function() { self.selectedDayId = daySelect.value || null; self.renderMain(); } });
      daySelect.appendChild(Tribunator.Utils.el('option', { value: '', textContent: '— ' + t('time.date') + ' —' }));
      days.forEach(function(d) {
        var opt = Tribunator.Utils.el('option', { value: d.id, textContent: Tribunator.Time.formatDate(d.date) });
        if (d.id === self.selectedDayId) opt.selected = true;
        daySelect.appendChild(opt);
      });
    }

    var actions = Tribunator.Utils.el('div', { className: 'main-area-actions' });
    if (daySelect) actions.appendChild(daySelect);
    actions.appendChild(viewToggle);
    header.appendChild(actions);
    main.appendChild(header);

    // Plan view
    var planView = Tribunator.Utils.el('div', {
      className: 'view-area' + (this.currentView === 'plan' ? ' active' : ''),
      id: 'plan-view'
    });
    this.renderGridEditor(planView, floor);
    main.appendChild(planView);

    // List view
    var listView = Tribunator.Utils.el('div', {
      className: 'view-area' + (this.currentView === 'list' ? ' active' : ''),
      id: 'list-view'
    });
    this.renderRoomList(listView);
    main.appendChild(listView);
  },

  // --- GRID EDITOR ---
  _gridCells: null,

  renderGridEditor: function(container, floor) {
    var self = this;
    var el = Tribunator.Utils.el;

    // Toolbar - lives in a container so we can swap just the toolbar
    var toolbarContainer = el('div', { id: 'grid-toolbar-container' });

    // Grid layout: edge buttons around the grid
    var gridLayout = el('div', { className: 'grid-layout' });

    gridLayout.appendChild(el('div', { className: 'grid-edge grid-edge-h' }, [
      el('button', { className: 'grid-edge-btn', textContent: '+', title: t('space.expandUp'),
        onClick: function() { Tribunator.Store.resizeGrid(self.currentCampusId, self.currentFloorId, 'up'); self.renderMain(); }
      }),
      el('button', { className: 'grid-edge-btn', textContent: '−', title: t('space.shrinkUp'),
        onClick: function() { self.handleShrink('up'); }
      })
    ]));

    var middleRow = el('div', { className: 'grid-edge-row' });

    middleRow.appendChild(el('div', { className: 'grid-edge grid-edge-v' }, [
      el('button', { className: 'grid-edge-btn', textContent: '+', title: t('space.expandLeft'),
        onClick: function() { Tribunator.Store.resizeGrid(self.currentCampusId, self.currentFloorId, 'left'); self.renderMain(); }
      }),
      el('button', { className: 'grid-edge-btn', textContent: '−', title: t('space.shrinkLeft'),
        onClick: function() { self.handleShrink('left'); }
      })
    ]));

    var gridInner = el('div', { className: 'grid-inner' });
    gridInner.appendChild(toolbarContainer);

    var grid = el('div', {
      className: 'grid' + (this.mergeMode ? ' grid-merge-mode' : ''),
      id: 'space-grid',
      style: { gridTemplateColumns: 'repeat(' + floor.gridCols + ', ' + Math.round(32 * this.zoomLevel) + 'px)' }
    });

    var cellLookup = {};
    floor.rooms.forEach(function(room) {
      room.cells.forEach(function(cell) { cellLookup[cell.col + ',' + cell.row] = room; });
    });

    var selectedLookup = {};
    this.selectedCells.forEach(function(c) { selectedLookup[c.col + ',' + c.row] = true; });

    var occupation = {};
    var activeSol = Tribunator.Store.getActiveSolution();
    if (this.selectedDayId && activeSol) {
      occupation = Tribunator.Store.getRoomOccupation(activeSol.id, this.selectedDayId);
    }

    this._gridCells = {};

    for (var row = 0; row < floor.gridRows; row++) {
      for (var col = 0; col < floor.gridCols; col++) {
        var key = col + ',' + row;
        var room = cellLookup[key];
        var isSelected = selectedLookup[key];
        var isOccupied = room && occupation[room.id];

        var cellClasses = 'grid-cell';
        if (room) cellClasses += ' room-cell';
        if (isSelected) cellClasses += ' selected';
        if (room && room.id === this.editingRoomId) cellClasses += ' room-active';
        if (isOccupied) cellClasses += ' room-occupied';
        else if (room && this.selectedDayId) cellClasses += ' room-free';

        if (room && this.highlightGroupId) {
          var roomGroups = Tribunator.Store.getRoomGroups(room.id);
          if (roomGroups.some(function(g) { return g.id === self.highlightGroupId; })) {
            cellClasses += ' highlight-group';
          }
        }

        var cellEl = el('div', { className: cellClasses, dataset: { col: col, row: row } });
        this._gridCells[key] = cellEl;

        if (room) {
          cellEl.style.backgroundColor = room.color;

          // Compute external borders
          var roomId = room.id;
          var topN = cellLookup[col + ',' + (row - 1)];
          var botN = cellLookup[col + ',' + (row + 1)];
          var lefN = cellLookup[(col - 1) + ',' + row];
          var rigN = cellLookup[(col + 1) + ',' + row];
          var bc = 'rgba(0,0,0,0.45)';
          var bw = '2px';
          if (!topN || topN.id !== roomId) cellEl.style.borderTop = bw + ' solid ' + bc;
          if (!botN || botN.id !== roomId) cellEl.style.borderBottom = bw + ' solid ' + bc;
          if (!lefN || lefN.id !== roomId) cellEl.style.borderLeft = bw + ' solid ' + bc;
          if (!rigN || rigN.id !== roomId) cellEl.style.borderRight = bw + ' solid ' + bc;

          if (room.cells[0].col === col && room.cells[0].row === row) {
            cellEl.appendChild(el('span', { className: 'room-label', textContent: room.name }));
          }
          (function(r) {
            cellEl.addEventListener('mouseenter', function(e) { self.showRoomTooltip(e, r); });
            cellEl.addEventListener('mouseleave', function() { self.hideRoomTooltip(); });
          })(room);
        }

        (function(c, r, cellElement) {
          cellElement.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            e.preventDefault();
            self.isMouseDown = true;
            self._dragOrigin = true;
            self._isDrag = false;
            self._mouseDownCell = { col: c, row: r, el: cellElement };
          });
          cellElement.addEventListener('mouseup', function() {
            if (self._mouseDownCell && self._mouseDownCell.col === c && self._mouseDownCell.row === r && !self._isDrag) {
              self._handleCellClick(c, r, cellElement);
            }
            self._mouseDownCell = null;
          });
          cellElement.addEventListener('mouseenter', function() {
            if (self.isMouseDown && self._dragOrigin) {
              self._isDrag = true;
              if (!cellElement.classList.contains('room-cell')) {
                var idx = self._findSelected(c, r);
                if (idx < 0) {
                  self.selectedCells.push({ col: c, row: r });
                  cellElement.classList.add('selected');
                  self._refreshToolbar();
                }
              }
            }
          });
        })(col, row, cellEl);

        grid.appendChild(cellEl);
      }
    }

    gridInner.appendChild(grid);
    middleRow.appendChild(gridInner);

    middleRow.appendChild(el('div', { className: 'grid-edge grid-edge-v' }, [
      el('button', { className: 'grid-edge-btn', textContent: '+', title: t('space.expandRight'),
        onClick: function() { Tribunator.Store.resizeGrid(self.currentCampusId, self.currentFloorId, 'right'); self.renderMain(); }
      }),
      el('button', { className: 'grid-edge-btn', textContent: '−', title: t('space.shrinkRight'),
        onClick: function() { self.handleShrink('right'); }
      })
    ]));

    gridLayout.appendChild(middleRow);

    gridLayout.appendChild(el('div', { className: 'grid-edge grid-edge-h' }, [
      el('button', { className: 'grid-edge-btn', textContent: '+', title: t('space.expandDown'),
        onClick: function() { Tribunator.Store.resizeGrid(self.currentCampusId, self.currentFloorId, 'down'); self.renderMain(); }
      }),
      el('button', { className: 'grid-edge-btn', textContent: '−', title: t('space.shrinkDown'),
        onClick: function() { self.handleShrink('down'); }
      })
    ]));

    container.appendChild(gridLayout);

    // Render toolbar (lightweight, can be called independently)
    this._refreshToolbar();

    // Room edit panel
    if (this.editingRoomId && !this.mergeMode) {
      this.renderRoomEditPanel(container);
    }
  },

  _refreshToolbar: function() {
    var tc = document.getElementById('grid-toolbar-container');
    if (!tc) return;
    Tribunator.Utils.clearElement(tc);
    var self = this;
    var el = Tribunator.Utils.el;
    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    var toolbar = el('div', { className: 'grid-toolbar' });

    if (this.mergeMode) {
      var editingRoom = Tribunator.Store.getRoom(this.editingRoomId);
      var roomName = editingRoom ? editingRoom.room.name : '';
      toolbar.appendChild(el('span', { style: { fontSize: '12px', fontWeight: '500', color: 'var(--primary)' }, textContent: t('space.expandingRoom') + ': ' + roomName }));
      toolbar.appendChild(el('div', { className: 'grid-toolbar-separator' }));
      if (this.selectedCells.length > 0) {
        toolbar.appendChild(el('button', { className: 'btn btn-sm btn-primary', textContent: t('space.applyExpand') + ' (' + this.selectedCells.length + ')', onClick: function() { self.applyMerge(); } }));
      }
      toolbar.appendChild(el('button', { className: 'btn btn-sm', textContent: t('common.cancel'), onClick: function() { self.mergeMode = false; self.selectedCells = []; self.renderMain(); } }));
    } else if (this.selectedCells.length > 0) {
      toolbar.appendChild(el('button', { className: 'btn btn-sm btn-primary', textContent: t('space.addRoom') + ' (' + this.selectedCells.length + ')', onClick: function() { self.promptCreateRoom(); } }));
      toolbar.appendChild(el('button', { className: 'btn btn-sm', textContent: t('space.clearSelection'), onClick: function() { self._clearSelection(); } }));
    } else if (this.editingRoomId) {
      var editingRoom = Tribunator.Store.getRoom(this.editingRoomId);
      if (editingRoom) {
        toolbar.appendChild(el('span', { style: { fontSize: '12px', color: 'var(--text-secondary)' }, textContent: editingRoom.room.name }));
        toolbar.appendChild(el('div', { className: 'grid-toolbar-separator' }));
        toolbar.appendChild(el('button', { className: 'btn btn-sm', textContent: t('space.expandRoom'), onClick: function() { self.mergeMode = true; self.selectedCells = []; self.renderMain(); } }));
      }
    }

    if (floor) toolbar.appendChild(el('div', { className: 'grid-info', textContent: floor.gridCols + '×' + floor.gridRows }));

    // Zoom controls
    toolbar.appendChild(el('div', { className: 'grid-toolbar-separator' }));
    toolbar.appendChild(el('div', { className: 'grid-toolbar-group' }, [
      el('button', { className: 'btn-icon', textContent: '−', title: 'Zoom −', onClick: function() { self.setZoom(self.zoomLevel - 0.25); } }),
      el('span', { style: { fontSize: '11px', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'center' }, textContent: Math.round(self.zoomLevel * 100) + '%' }),
      el('button', { className: 'btn-icon', textContent: '+', title: 'Zoom +', onClick: function() { self.setZoom(self.zoomLevel + 0.25); } })
    ]));

    tc.appendChild(toolbar);
  },

  setZoom: function(level) {
    this.zoomLevel = Math.max(0.5, Math.min(3, level));
    var grid = document.getElementById('space-grid');
    if (grid) {
      var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
      if (floor) {
        var cellSize = Math.round(32 * this.zoomLevel);
        grid.style.gridTemplateColumns = 'repeat(' + floor.gridCols + ', ' + cellSize + 'px)';
      }
    }
    this._refreshToolbar();
  },

  _clearSelection: function() {
    var self = this;
    this.selectedCells.forEach(function(c) {
      var cell = self._gridCells && self._gridCells[c.col + ',' + c.row];
      if (cell) cell.classList.remove('selected');
    });
    this.selectedCells = [];
    this._refreshToolbar();
  },

  _handleCellClick: function(col, row, cellEl) {
    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    if (!floor) return;

    var isRoom = cellEl.classList.contains('room-cell');

    if (this.mergeMode) {
      if (!isRoom) {
        var idx = this._findSelected(col, row);
        if (idx >= 0) {
          this.selectedCells.splice(idx, 1);
          cellEl.classList.remove('selected');
        } else {
          this.selectedCells.push({ col: col, row: row });
          cellEl.classList.add('selected');
        }
        this._refreshToolbar();
      }
      return;
    }

    if (isRoom) {
      var cellRoom = null;
      floor.rooms.forEach(function(r) {
        r.cells.forEach(function(c) { if (c.col === col && c.row === row) cellRoom = r; });
      });
      if (cellRoom) {
        this.editingRoomId = cellRoom.id;
        this.selectedCells = [];
        this.renderMain();
      }
    } else {
      var hadEditing = !!this.editingRoomId;
      this.editingRoomId = null;
      var idx = this._findSelected(col, row);
      if (idx >= 0) {
        this.selectedCells.splice(idx, 1);
        cellEl.classList.remove('selected');
      } else {
        this.selectedCells.push({ col: col, row: row });
        cellEl.classList.add('selected');
      }
      if (hadEditing) {
        this.renderMain();
      } else {
        this._refreshToolbar();
      }
    }
  },

  _findSelected: function(col, row) {
    for (var i = 0; i < this.selectedCells.length; i++) {
      if (this.selectedCells[i].col === col && this.selectedCells[i].row === row) return i;
    }
    return -1;
  },

  applyMerge: function() {
    if (!this.editingRoomId || this.selectedCells.length === 0) return;
    var found = Tribunator.Store.getRoom(this.editingRoomId);
    if (!found) return;
    var room = found.room;

    var allCells = room.cells.concat(this.selectedCells);
    if (!Tribunator.Utils.areCellsContiguous(allCells)) {
      Tribunator.Utils.showToast(t('space.cellsNotContiguous'), 'error');
      return;
    }

    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    var overlap = false;
    var selectedSet = {};
    this.selectedCells.forEach(function(c) { selectedSet[c.col + ',' + c.row] = true; });
    floor.rooms.forEach(function(r) {
      if (r.id === room.id) return;
      r.cells.forEach(function(c) { if (selectedSet[c.col + ',' + c.row]) overlap = true; });
    });
    if (overlap) {
      Tribunator.Utils.showToast(t('space.roomOverlap'), 'error');
      return;
    }

    Tribunator.Store.updateRoom(this.editingRoomId, { cells: allCells });
    this.mergeMode = false;
    this.selectedCells = [];
    this.renderMain();
    this.renderSidebar();
    Tribunator.Utils.showToast(t('common.success'));
  },

  // --- ROOM TOOLTIP ---
  showRoomTooltip: function(e, room) {
    var store = Tribunator.Store;
    var html = '<div class="room-tooltip-name">' + this._escapeHtml(room.name) + '</div>';

    if (room.notes) {
      html += '<div class="room-tooltip-field"><span class="room-tooltip-label">' + t('common.notes') + ':</span> ' + this._escapeHtml(room.notes) + '</div>';
    }

    var fieldDefs = store.getCustomFieldDefs();
    fieldDefs.forEach(function(def) {
      var val = room.customFields && room.customFields[def.id];
      if (val !== undefined && val !== '') {
        var displayVal = val;
        if (def.type === 'boolean') displayVal = val ? t('common.yes') : t('common.no');
        html += '<div class="room-tooltip-field"><span class="room-tooltip-label">' + this._escapeHtml(def.name) + ':</span> ' + this._escapeHtml(String(displayVal)) + '</div>';
      }
    }.bind(this));

    var groups = store.getRoomGroups(room.id);
    if (groups.length > 0) {
      html += '<div class="room-tooltip-field"><span class="room-tooltip-label">' + t('space.groups') + ':</span> ' + groups.map(function(g) { return g.name; }).join(', ') + '</div>';
    }

    // Occupation info
    if (this.selectedDayId) {
      var activeSol = store.getActiveSolution();
      if (activeSol) {
        var occ = store.getRoomOccupation(activeSol.id, this.selectedDayId);
        var roomOcc = occ[room.id];
        if (roomOcc && roomOcc.length > 0) {
          html += '<div style="border-top:1px solid rgba(255,255,255,0.2);margin-top:4px;padding-top:4px;">';
          html += '<div style="color:#ff6b6b;font-weight:600;">' + t('common.assigned') + '</div>';
          roomOcc.forEach(function(o) {
            html += '<div class="room-tooltip-field">' + o.tribunal.name + ' (' + o.type + ')' + '</div>';
          });
          html += '</div>';
        } else {
          html += '<div style="border-top:1px solid rgba(255,255,255,0.2);margin-top:4px;padding-top:4px;color:#69db7c;">' + t('common.free') + '</div>';
        }
      }
    }

    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (e.clientX + 12) + 'px';
    this.tooltip.style.top = (e.clientY + 12) + 'px';
  },

  hideRoomTooltip: function() {
    this.tooltip.style.display = 'none';
  },

  // --- ROOM EDIT PANEL ---
  renderRoomEditPanel: function(container) {
    var self = this;
    var store = Tribunator.Store;
    var found = store.getRoom(this.editingRoomId);
    if (!found) return;
    var room = found.room;

    var panel = Tribunator.Utils.el('div', { className: 'room-edit-panel' });

    panel.appendChild(Tribunator.Utils.el('div', { className: 'room-edit-panel-title' }, [
      t('space.editRoom') + ': ' + room.name,
      Tribunator.Utils.el('div', { style: { display: 'flex', gap: '4px' } }, [
        Tribunator.Utils.el('button', {
          className: 'btn btn-sm btn-danger',
          textContent: t('common.delete'),
          onClick: function() {
            var refs = store.getRoomReferences(room.id);
            var msg = t('space.confirmDeleteRoom');
            if (refs.length > 0) {
              msg += '\n\n⚠ ' + t('verify.roomHasRefs') + ':\n' + refs.map(function(r) { return r.tribunal + ' (' + r.slotTime + ')'; }).join('\n');
            }
            Tribunator.Utils.showConfirm(msg, function() {
              store.deleteRoom(room.id);
              self.editingRoomId = null;
              self.renderMain();
              self.renderSidebar();
            });
          }
        }),
        Tribunator.Utils.el('button', {
          className: 'btn-icon',
          textContent: '×',
          onClick: function() { self.editingRoomId = null; self.renderMain(); }
        })
      ])
    ]));

    // Name
    var nameGroup = Tribunator.Utils.el('div', { className: 'form-group' });
    nameGroup.appendChild(Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.roomName') }));
    var nameInput = Tribunator.Utils.el('input', {
      className: 'form-input',
      type: 'text',
      value: room.name,
      onChange: function() {
        store.updateRoom(room.id, { name: nameInput.value });
        self.renderSidebar();
      }
    });
    nameGroup.appendChild(nameInput);
    panel.appendChild(nameGroup);

    // Color
    var colorGroup = Tribunator.Utils.el('div', { className: 'form-group' });
    colorGroup.appendChild(Tribunator.Utils.el('label', { className: 'form-label', textContent: 'Color' }));
    var colorInput = Tribunator.Utils.el('input', {
      type: 'color',
      value: room.color,
      style: { width: '48px', height: '32px', border: 'none', cursor: 'pointer' },
      onChange: function() {
        store.updateRoom(room.id, { color: colorInput.value });
        self.renderMain();
      }
    });
    colorGroup.appendChild(colorInput);
    panel.appendChild(colorGroup);

    // Notes
    var notesGroup = Tribunator.Utils.el('div', { className: 'form-group' });
    notesGroup.appendChild(Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.notes') }));
    var notesInput = Tribunator.Utils.el('textarea', {
      className: 'form-textarea',
      value: room.notes || '',
      placeholder: t('common.notes') + '...',
      onChange: function() { store.updateRoom(room.id, { notes: notesInput.value }); }
    });
    notesInput.value = room.notes || '';
    notesGroup.appendChild(notesInput);
    panel.appendChild(notesGroup);

    // Custom fields
    var fieldDefs = store.getCustomFieldDefs();
    if (fieldDefs.length > 0) {
      panel.appendChild(Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.customFields'), style: { marginBottom: '8px', display: 'block' } }));
      fieldDefs.forEach(function(def) {
        var fieldGroup = Tribunator.Utils.el('div', { className: 'form-group', style: { marginBottom: '8px' } });
        fieldGroup.appendChild(Tribunator.Utils.el('label', {
          className: 'form-label',
          textContent: def.name,
          style: { fontSize: '11px', color: 'var(--text-muted)' }
        }));

        var currentVal = (room.customFields && room.customFields[def.id]) || '';

        if (def.type === 'text') {
          var input = Tribunator.Utils.el('input', {
            className: 'form-input',
            type: 'text',
            value: currentVal,
            onChange: function() {
              if (!room.customFields) room.customFields = {};
              room.customFields[def.id] = input.value;
              store.save();
            }
          });
          fieldGroup.appendChild(input);
        } else if (def.type === 'number') {
          var input = Tribunator.Utils.el('input', {
            className: 'form-input',
            type: 'number',
            value: currentVal,
            onChange: function() {
              if (!room.customFields) room.customFields = {};
              room.customFields[def.id] = parseFloat(input.value) || 0;
              store.save();
            }
          });
          fieldGroup.appendChild(input);
        } else if (def.type === 'boolean') {
          var checkbox = Tribunator.Utils.el('input', {
            type: 'checkbox',
            style: { marginLeft: '0' },
            onChange: function() {
              if (!room.customFields) room.customFields = {};
              room.customFields[def.id] = checkbox.checked;
              store.save();
            }
          });
          checkbox.checked = !!currentVal;
          fieldGroup.appendChild(checkbox);
        } else if (def.type === 'select') {
          var select = Tribunator.Utils.el('select', {
            className: 'form-select',
            onChange: function() {
              if (!room.customFields) room.customFields = {};
              room.customFields[def.id] = select.value;
              store.save();
            }
          });
          select.appendChild(Tribunator.Utils.el('option', { value: '', textContent: '—' }));
          (def.options || []).forEach(function(opt) {
            var option = Tribunator.Utils.el('option', { value: opt, textContent: opt });
            if (currentVal === opt) option.selected = true;
            select.appendChild(option);
          });
          fieldGroup.appendChild(select);
        }
        panel.appendChild(fieldGroup);
      });
    }

    // Groups for this room
    var roomGroups = store.getRoomGroups(room.id);
    if (roomGroups.length > 0) {
      var groupInfo = Tribunator.Utils.el('div', { style: { marginTop: '8px' } });
      groupInfo.appendChild(Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.groups') }));
      var groupBadges = Tribunator.Utils.el('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } });
      roomGroups.forEach(function(g) {
        groupBadges.appendChild(Tribunator.Utils.el('span', { className: 'group-badge', textContent: g.name }));
      });
      if (roomGroups.length > 1) {
        groupBadges.appendChild(Tribunator.Utils.el('span', { className: 'warning-badge', textContent: '⚠ ' + t('space.roomMultiGroupWarning') }));
      }
      groupInfo.appendChild(groupBadges);
      panel.appendChild(groupInfo);
    }

    container.appendChild(panel);
  },

  // --- ROOM LIST VIEW ---
  renderRoomList: function(container) {
    var self = this;
    var store = Tribunator.Store;
    var allRooms = store.getAllRooms();

    // Filter controls
    var controls = Tribunator.Utils.el('div', { className: 'room-list-controls' });

    // Campus filter
    var campusFilter = Tribunator.Utils.el('select', { className: 'filter-select', id: 'filter-campus' });
    campusFilter.appendChild(Tribunator.Utils.el('option', { value: '', textContent: t('common.all') + ' ' + t('space.campuses').toLowerCase() }));
    store.getCampuses().forEach(function(c) {
      campusFilter.appendChild(Tribunator.Utils.el('option', { value: c.id, textContent: c.name }));
    });
    if (this.currentCampusId) campusFilter.value = this.currentCampusId;

    // Floor filter
    var floorFilter = Tribunator.Utils.el('select', { className: 'filter-select', id: 'filter-floor' });
    floorFilter.appendChild(Tribunator.Utils.el('option', { value: '', textContent: t('common.all') + ' ' + t('space.floors').toLowerCase() }));
    var selectedCampus = store.getCampus(campusFilter.value);
    if (selectedCampus) {
      selectedCampus.floors.forEach(function(f) {
        floorFilter.appendChild(Tribunator.Utils.el('option', { value: f.id, textContent: f.name }));
      });
    }
    if (this.currentFloorId) floorFilter.value = this.currentFloorId;

    // Status filter
    var statusFilter = Tribunator.Utils.el('select', { className: 'filter-select', id: 'filter-status' });
    statusFilter.appendChild(Tribunator.Utils.el('option', { value: '', textContent: t('common.all') }));
    statusFilter.appendChild(Tribunator.Utils.el('option', { value: 'free', textContent: t('common.free') }));
    statusFilter.appendChild(Tribunator.Utils.el('option', { value: 'assigned', textContent: t('common.assigned') }));

    // Search
    var searchInput = Tribunator.Utils.el('input', {
      className: 'search-input',
      type: 'text',
      placeholder: t('common.search') + '...'
    });

    var filterChange = function() {
      self._renderFilteredTable(campusFilter.value, floorFilter.value, statusFilter.value, searchInput.value);
    };
    campusFilter.addEventListener('change', function() {
      // Update floor filter options
      Tribunator.Utils.clearElement(floorFilter);
      floorFilter.appendChild(Tribunator.Utils.el('option', { value: '', textContent: t('common.all') + ' ' + t('space.floors').toLowerCase() }));
      var c = store.getCampus(campusFilter.value);
      if (c) {
        c.floors.forEach(function(f) {
          floorFilter.appendChild(Tribunator.Utils.el('option', { value: f.id, textContent: f.name }));
        });
      }
      filterChange();
    });
    floorFilter.addEventListener('change', filterChange);
    statusFilter.addEventListener('change', filterChange);
    searchInput.addEventListener('input', Tribunator.Utils.debounce(filterChange, 200));

    controls.appendChild(campusFilter);
    controls.appendChild(floorFilter);
    controls.appendChild(statusFilter);
    controls.appendChild(searchInput);
    container.appendChild(controls);

    // Table container
    var tableContainer = Tribunator.Utils.el('div', { id: 'room-list-table-container' });
    container.appendChild(tableContainer);
    this._roomListTableContainer = tableContainer;

    this._renderFilteredTable(campusFilter.value, floorFilter.value, '', '');
  },

  _renderFilteredTable: function(campusId, floorId, status, search) {
    var store = Tribunator.Store;
    var tableContainer = this._roomListTableContainer;
    if (!tableContainer) return;
    Tribunator.Utils.clearElement(tableContainer);

    var allRooms = store.getAllRooms();
    var filtered = allRooms.filter(function(item) {
      if (campusId && item.campus.id !== campusId) return false;
      if (floorId && item.floor.id !== floorId) return false;
      if (search) {
        var s = search.toLowerCase();
        if (item.room.name.toLowerCase().indexOf(s) === -1 &&
            item.campus.name.toLowerCase().indexOf(s) === -1 &&
            item.floor.name.toLowerCase().indexOf(s) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tableContainer.appendChild(Tribunator.Utils.el('div', { className: 'empty-state' }, [
        Tribunator.Utils.el('div', { className: 'empty-state-text', textContent: t('space.noRooms') })
      ]));
      return;
    }

    var table = Tribunator.Utils.el('table', { className: 'room-list-table' });
    var fieldDefs = store.getCustomFieldDefs();

    // Header
    var thead = Tribunator.Utils.el('thead');
    var headerRow = Tribunator.Utils.el('tr');
    [t('space.room'), t('space.campus'), t('space.floor'), t('space.status'), t('space.groups'), t('common.notes')]
      .concat(fieldDefs.map(function(f) { return f.name; }))
      .concat([t('common.actions')])
      .forEach(function(h) {
        headerRow.appendChild(Tribunator.Utils.el('th', { textContent: h }));
      });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    // Compute occupation
    var occupation = {};
    var activeSol = store.getActiveSolution();
    if (this.selectedDayId && activeSol) {
      occupation = store.getRoomOccupation(activeSol.id, this.selectedDayId);
    }

    var tbody = Tribunator.Utils.el('tbody');
    var self = this;
    filtered.forEach(function(item) {
      var room = item.room;
      var roomOcc = occupation[room.id];

      // Apply status filter
      if (status === 'free' && roomOcc) return;
      if (status === 'assigned' && !roomOcc) return;

      var tr = Tribunator.Utils.el('tr');

      var nameCell = Tribunator.Utils.el('td');
      nameCell.appendChild(Tribunator.Utils.el('span', { className: 'room-color-dot', style: { backgroundColor: room.color } }));
      nameCell.appendChild(document.createTextNode(room.name));
      tr.appendChild(nameCell);

      tr.appendChild(Tribunator.Utils.el('td', { textContent: item.campus.name }));
      tr.appendChild(Tribunator.Utils.el('td', { textContent: item.floor.name }));

      // Status - real
      var statusCell = Tribunator.Utils.el('td');
      if (roomOcc && roomOcc.length > 0) {
        statusCell.appendChild(Tribunator.Utils.el('span', { className: 'status-badge assigned', textContent: t('common.assigned') }));
        roomOcc.forEach(function(o) {
          statusCell.appendChild(Tribunator.Utils.el('span', { style: { fontSize: '11px', color: 'var(--text-muted)', display: 'block' }, textContent: o.tribunal.name }));
        });
      } else {
        statusCell.appendChild(Tribunator.Utils.el('span', { className: 'status-badge free', textContent: t('common.free') }));
      }
      tr.appendChild(statusCell);

      // Groups
      var groupCell = Tribunator.Utils.el('td');
      var roomGroups = store.getRoomGroups(room.id);
      roomGroups.forEach(function(g) {
        groupCell.appendChild(Tribunator.Utils.el('span', { className: 'group-badge', textContent: g.name }));
      });
      if (roomGroups.length > 1) {
        groupCell.appendChild(Tribunator.Utils.el('span', { className: 'warning-badge', textContent: '⚠' }));
      }
      tr.appendChild(groupCell);

      // Notes
      tr.appendChild(Tribunator.Utils.el('td', { textContent: (room.notes || '').substring(0, 50) + ((room.notes || '').length > 50 ? '...' : '') }));

      // Custom fields
      fieldDefs.forEach(function(def) {
        var val = room.customFields && room.customFields[def.id];
        var displayVal = '';
        if (val !== undefined && val !== '') {
          if (def.type === 'boolean') displayVal = val ? t('common.yes') : t('common.no');
          else displayVal = String(val);
        }
        tr.appendChild(Tribunator.Utils.el('td', { textContent: displayVal }));
      });

      // Actions
      var actionsCell = Tribunator.Utils.el('td');
      actionsCell.appendChild(Tribunator.Utils.el('button', {
        className: 'btn btn-sm',
        textContent: t('common.edit'),
        onClick: function() {
          self.selectFloor(item.campus.id, item.floor.id);
          self.editingRoomId = room.id;
          self.setView('plan');
        }
      }));
      tr.appendChild(actionsCell);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  },

  // --- PROMPTS ---
  promptAddCampus: function() {
    var self = this;
    var input = Tribunator.Utils.el('input', {
      className: 'form-input',
      type: 'text',
      placeholder: t('space.campusName')
    });
    Tribunator.Utils.showModal({
      title: t('space.addCampus'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
        input
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.create'),
          className: 'btn-primary',
          action: function() {
            var name = input.value.trim();
            if (name) {
              var campus = Tribunator.Store.addCampus(name);
              self.selectCampus(campus.id);
            }
          }
        }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptEditCampus: function(id) {
    var self = this;
    var campus = Tribunator.Store.getCampus(id);
    if (!campus) return;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', value: campus.name });
    Tribunator.Utils.showModal({
      title: t('space.editCampus'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
        input
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.save'),
          className: 'btn-primary',
          action: function() {
            var name = input.value.trim();
            if (name) {
              Tribunator.Store.updateCampus(id, name);
              self.renderSidebar();
              self.renderMain();
            }
          }
        }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptDeleteCampus: function(id) {
    var self = this;
    Tribunator.Utils.showConfirm(t('space.confirmDeleteCampus'), function() {
      Tribunator.Store.deleteCampus(id);
      if (self.currentCampusId === id) {
        self.currentCampusId = null;
        self.currentFloorId = null;
      }
      self.render();
    });
  },

  promptAddFloor: function(campusId) {
    var self = this;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', placeholder: t('space.floorName') });
    Tribunator.Utils.showModal({
      title: t('space.addFloor'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
        input
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.create'),
          className: 'btn-primary',
          action: function() {
            var name = input.value.trim();
            if (name) {
              var floor = Tribunator.Store.addFloor(campusId, name);
              self.selectFloor(campusId, floor.id);
            }
          }
        }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptEditFloor: function(campusId, floorId) {
    var self = this;
    var floor = Tribunator.Store.getFloor(campusId, floorId);
    if (!floor) return;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', value: floor.name });
    Tribunator.Utils.showModal({
      title: t('space.editFloor'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
        input
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.save'),
          className: 'btn-primary',
          action: function() {
            var name = input.value.trim();
            if (name) {
              Tribunator.Store.updateFloor(campusId, floorId, name);
              self.renderSidebar();
              self.renderMain();
            }
          }
        }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptDeleteFloor: function(campusId, floorId) {
    var self = this;
    Tribunator.Utils.showConfirm(t('space.confirmDeleteFloor'), function() {
      Tribunator.Store.deleteFloor(campusId, floorId);
      if (self.currentFloorId === floorId) {
        self.currentFloorId = null;
      }
      self.render();
    });
  },

  handleShrink: function(direction) {
    var self = this;
    var store = Tribunator.Store;
    var check = store.checkShrinkGrid(this.currentCampusId, this.currentFloorId, direction);

    if (check.tooSmall) {
      Tribunator.Utils.showToast(t('space.gridMinSize'), 'warning');
      return;
    }

    if (!check.can) {
      var roomNames = check.rooms.map(function(r) { return r.name; }).join(', ');
      Tribunator.Utils.showModal({
        title: t('common.warning'),
        body: Tribunator.Utils.el('div', {}, [
          Tribunator.Utils.el('p', { textContent: t('space.shrinkBlockedByRooms') }),
          Tribunator.Utils.el('p', { style: { fontWeight: '600', marginTop: '8px' }, textContent: roomNames }),
          Tribunator.Utils.el('p', { style: { marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('space.shrinkForceHint') })
        ]),
        buttons: [
          { text: t('common.cancel'), className: 'btn-secondary' },
          {
            text: t('space.shrinkForce'),
            className: 'btn-danger',
            action: function() {
              store.shrinkGrid(self.currentCampusId, self.currentFloorId, direction, true);
              self.editingRoomId = null;
              self.selectedCells = [];
              self.renderMain();
              self.renderSidebar();
            }
          }
        ]
      });
      return;
    }

    store.shrinkGrid(this.currentCampusId, this.currentFloorId, direction);
    this.renderMain();
  },

  duplicateFloor: function(campusId, floorId) {
    var newFloor = Tribunator.Store.duplicateFloor(campusId, floorId);
    if (newFloor) {
      this.selectFloor(campusId, newFloor.id);
      Tribunator.Utils.showToast(t('common.success'));
    }
  },

  promptCreateRoom: function() {
    var self = this;
    if (this.selectedCells.length === 0) {
      Tribunator.Utils.showToast(t('space.selectCells'), 'warning');
      return;
    }

    if (!Tribunator.Utils.areCellsContiguous(this.selectedCells)) {
      Tribunator.Utils.showToast(t('space.cellsNotContiguous'), 'error');
      return;
    }

    // Check overlap
    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    var overlap = false;
    var selectedSet = {};
    this.selectedCells.forEach(function(c) { selectedSet[c.col + ',' + c.row] = true; });
    floor.rooms.forEach(function(r) {
      r.cells.forEach(function(c) {
        if (selectedSet[c.col + ',' + c.row]) overlap = true;
      });
    });
    if (overlap) {
      Tribunator.Utils.showToast(t('space.roomOverlap'), 'error');
      return;
    }

    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', placeholder: t('space.roomName') });
    Tribunator.Utils.showModal({
      title: t('space.addRoom'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
        input,
        Tribunator.Utils.el('div', {
          style: { marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' },
          textContent: this.selectedCells.length + ' ' + t('space.selectedCells')
        })
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.create'),
          className: 'btn-primary',
          action: function() {
            var name = input.value.trim();
            if (name) {
              var newRoom = Tribunator.Store.addRoom(self.currentCampusId, self.currentFloorId, {
                name: name,
                cells: self.selectedCells.slice()
              });
              self.selectedCells = [];
              self.editingRoomId = newRoom.id;
              self.renderMain();
              self.renderSidebar();
            }
          }
        }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptEditRoom: function(roomId) {
    this.editingRoomId = roomId;
    this.selectedCells = [];
    this.renderMain();
  },

  // --- CUSTOM FIELDS ---
  promptAddCustomField: function() {
    var self = this;
    var nameInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', placeholder: t('space.fieldName') });
    var typeSelect = Tribunator.Utils.el('select', { className: 'form-select' });
    ['text', 'number', 'boolean', 'select'].forEach(function(type) {
      typeSelect.appendChild(Tribunator.Utils.el('option', { value: type, textContent: t('common.' + type) }));
    });
    var optionsInput = Tribunator.Utils.el('input', {
      className: 'form-input',
      type: 'text',
      placeholder: t('space.fieldOptions'),
      style: { display: 'none' }
    });
    typeSelect.addEventListener('change', function() {
      optionsInput.style.display = typeSelect.value === 'select' ? 'block' : 'none';
    });

    Tribunator.Utils.showModal({
      title: t('space.addField'),
      body: Tribunator.Utils.el('div', {}, [
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldName') }),
          nameInput
        ]),
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldType') }),
          typeSelect
        ]),
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldOptions') }),
          optionsInput
        ])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.create'),
          className: 'btn-primary',
          action: function() {
            var name = nameInput.value.trim();
            if (name) {
              var options = typeSelect.value === 'select'
                ? optionsInput.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                : [];
              Tribunator.Store.addCustomFieldDef({ name: name, type: typeSelect.value, options: options });
              self.renderSidebar();
              if (self.editingRoomId) self.renderMain();
            }
          }
        }
      ]
    });
    setTimeout(function() { nameInput.focus(); }, 100);
  },

  promptEditCustomField: function(id) {
    var self = this;
    var field = Tribunator.Store.getCustomFieldDefs().find(function(f) { return f.id === id; });
    if (!field) return;

    var nameInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', value: field.name });
    var typeSelect = Tribunator.Utils.el('select', { className: 'form-select' });
    ['text', 'number', 'boolean', 'select'].forEach(function(type) {
      var opt = Tribunator.Utils.el('option', { value: type, textContent: t('common.' + type) });
      if (type === field.type) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    var optionsInput = Tribunator.Utils.el('input', {
      className: 'form-input',
      type: 'text',
      value: (field.options || []).join(', '),
      style: { display: field.type === 'select' ? 'block' : 'none' }
    });
    typeSelect.addEventListener('change', function() {
      optionsInput.style.display = typeSelect.value === 'select' ? 'block' : 'none';
    });

    Tribunator.Utils.showModal({
      title: t('common.edit') + ': ' + field.name,
      body: Tribunator.Utils.el('div', {}, [
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldName') }),
          nameInput
        ]),
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldType') }),
          typeSelect
        ]),
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.fieldOptions') }),
          optionsInput
        ])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.save'),
          className: 'btn-primary',
          action: function() {
            var name = nameInput.value.trim();
            if (name) {
              var options = typeSelect.value === 'select'
                ? optionsInput.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                : [];
              Tribunator.Store.updateCustomFieldDef(id, { name: name, type: typeSelect.value, options: options });
              self.renderSidebar();
              if (self.editingRoomId) self.renderMain();
            }
          }
        }
      ]
    });
  },

  promptDeleteCustomField: function(id) {
    var self = this;
    Tribunator.Utils.showConfirm(t('common.confirm'), function() {
      Tribunator.Store.deleteCustomFieldDef(id);
      self.renderSidebar();
      if (self.editingRoomId) self.renderMain();
    });
  },

  // --- GROUPS ---
  promptAddGroup: function() {
    var self = this;
    var allRooms = Tribunator.Store.getAllRooms();
    if (allRooms.length === 0) {
      Tribunator.Utils.showToast(t('space.noRooms'), 'warning');
      return;
    }
    this._showGroupEditor(null, function(name, roomIds) {
      Tribunator.Store.addGroup(name, roomIds);
      self.renderSidebar();
      self.renderMain();
    });
  },

  promptEditGroup: function(id) {
    var self = this;
    var group = Tribunator.Store.getGroup(id);
    if (!group) return;
    this._showGroupEditor(group, function(name, roomIds) {
      Tribunator.Store.updateGroup(id, { name: name, roomIds: roomIds });
      self.renderSidebar();
      self.renderMain();
    });
  },

  promptDeleteGroup: function(id) {
    var self = this;
    Tribunator.Utils.showConfirm(t('space.confirmDeleteGroup'), function() {
      Tribunator.Store.deleteGroup(id);
      self.renderSidebar();
      self.renderMain();
    });
  },

  _showGroupEditor: function(group, onSave) {
    var allRooms = Tribunator.Store.getAllRooms();
    var selectedIds = group ? group.roomIds.slice() : [];
    var nameInput = Tribunator.Utils.el('input', {
      className: 'form-input',
      type: 'text',
      value: group ? group.name : '',
      placeholder: t('space.groupName')
    });

    var roomList = Tribunator.Utils.el('div', { style: { maxHeight: '300px', overflowY: 'auto', marginTop: '8px' } });
    allRooms.forEach(function(item) {
      var isSelected = selectedIds.indexOf(item.room.id) !== -1;
      var label = Tribunator.Utils.el('label', {
        style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '13px' }
      });
      var cb = Tribunator.Utils.el('input', { type: 'checkbox' });
      cb.checked = isSelected;
      cb.addEventListener('change', function() {
        var idx = selectedIds.indexOf(item.room.id);
        if (cb.checked && idx === -1) selectedIds.push(item.room.id);
        if (!cb.checked && idx !== -1) selectedIds.splice(idx, 1);
      });
      label.appendChild(cb);
      label.appendChild(Tribunator.Utils.el('span', { className: 'room-color-dot', style: { backgroundColor: item.room.color } }));
      label.appendChild(document.createTextNode(item.room.name + ' (' + item.campus.name + ' / ' + item.floor.name + ')'));

      var otherGroups = Tribunator.Store.getRoomGroups(item.room.id);
      if (group) otherGroups = otherGroups.filter(function(g) { return g.id !== group.id; });
      if (otherGroups.length > 0) {
        label.appendChild(Tribunator.Utils.el('span', { className: 'warning-badge', textContent: '⚠ ' + otherGroups.map(function(g) { return g.name; }).join(', ') }));
      }

      roomList.appendChild(label);
    });

    Tribunator.Utils.showModal({
      title: group ? t('space.editGroup') : t('space.addGroup'),
      body: Tribunator.Utils.el('div', {}, [
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }),
          nameInput
        ]),
        Tribunator.Utils.el('label', { className: 'form-label', textContent: t('space.selectRooms') }),
        roomList
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.save'),
          className: 'btn-primary',
          action: function() {
            var name = nameInput.value.trim();
            if (name && selectedIds.length > 0) {
              onSave(name, selectedIds);
            }
          }
        }
      ]
    });
    setTimeout(function() { nameInput.focus(); }, 100);
  },

  // --- NAVIGATION ---
  selectCampus: function(id) {
    this.currentCampusId = id;
    var campus = Tribunator.Store.getCampus(id);
    if (campus && campus.floors.length > 0) {
      this.currentFloorId = campus.floors[0].id;
    } else {
      this.currentFloorId = null;
    }
    this.editingRoomId = null;
    this.selectedCells = [];
    this.renderSidebar();
    this.renderMain();
  },

  selectFloor: function(campusId, floorId) {
    this.currentCampusId = campusId;
    this.currentFloorId = floorId;
    this.editingRoomId = null;
    this.selectedCells = [];
    this.renderSidebar();
    this.renderMain();
  },

  setView: function(view) {
    this.currentView = view;
    this.renderMain();
  },

  highlightGroup: function(groupId) {
    this.highlightGroupId = groupId;
    var cells = document.querySelectorAll('.grid-cell.room-cell');
    if (!groupId) {
      cells.forEach(function(c) { c.classList.remove('highlight-group'); });
      return;
    }
    var group = Tribunator.Store.getGroup(groupId);
    if (!group) return;
    var floor = Tribunator.Store.getFloor(this.currentCampusId, this.currentFloorId);
    if (!floor) return;

    var groupRoomIds = {};
    group.roomIds.forEach(function(id) { groupRoomIds[id] = true; });

    var roomCellMap = {};
    floor.rooms.forEach(function(r) {
      if (groupRoomIds[r.id]) {
        r.cells.forEach(function(c) { roomCellMap[c.col + ',' + c.row] = true; });
      }
    });

    cells.forEach(function(cell) {
      var key = cell.dataset.col + ',' + cell.dataset.row;
      if (roomCellMap[key]) {
        cell.classList.add('highlight-group');
      } else {
        cell.classList.remove('highlight-group');
      }
    });
  },

  // --- EXPORT/IMPORT ---
  exportSpaces: function() {
    var data = Tribunator.Store.exportSpaces();
    Tribunator.Utils.downloadFile(data, 'tribunator-espacios.json');
    Tribunator.Utils.showToast(t('export.exportSuccess'));
  },

  exportAll: function() {
    var data = Tribunator.Store.exportAll();
    Tribunator.Utils.downloadFile(data, 'tribunator-completo.json');
    Tribunator.Utils.showToast(t('export.exportSuccess'));
  },

  handleImport: function(e) {
    var self = this;
    var file = e.target.files[0];
    if (!file) return;

    Tribunator.Utils.readFile(file, function(err, content) {
      if (err) {
        Tribunator.Utils.showToast(err, 'error');
        return;
      }

      if (Tribunator.Store.hasData()) {
        Tribunator.Utils.showImportDialog(
          function() {
            var result = Tribunator.Store.importData(content, 'replace');
            if (result.success) {
              Tribunator.Utils.showToast(t('export.importSuccess'));
              self.currentCampusId = null;
              self.currentFloorId = null;
              self.render();
            } else {
              Tribunator.Utils.showToast(t('export.' + result.error), 'error');
            }
          },
          function() {
            var result = Tribunator.Store.importData(content, 'merge');
            if (result.success) {
              Tribunator.Utils.showToast(t('export.importSuccess'));
              self.render();
            } else {
              Tribunator.Utils.showToast(t('export.' + result.error), 'error');
            }
          }
        );
      } else {
        var result = Tribunator.Store.importData(content, 'replace');
        if (result.success) {
          Tribunator.Utils.showToast(t('export.importSuccess'));
          self.currentCampusId = null;
          self.currentFloorId = null;
          self.render();
        } else {
          Tribunator.Utils.showToast(t('export.' + result.error), 'error');
        }
      }
    });
    e.target.value = '';
  },

  _escapeHtml: function(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

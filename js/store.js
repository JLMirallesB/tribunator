window.Tribunator = window.Tribunator || {};

Tribunator.Store = {
  STORAGE_KEY: 'tribunator_data',
  VERSION: '1.2.3',

  defaultData: function() {
    return {
      version: this.VERSION,
      settings: {
        language: 'es',
        defaultMembersPerTribunal: 3
      },
      campuses: [],
      customFieldDefs: [],
      groups: [],
      days: [],
      candidates: [],
      roleDefs: [
        { name: 'Presidente/a', counts: true, requireOne: true },
        { name: 'Vocal', counts: true, requireOne: true },
        { name: 'Secretario/a', counts: true, requireOne: true },
        { name: 'Suplente', counts: false, requireOne: true },
        { name: 'Asesor/a', counts: false },
        { name: 'Ayudante', counts: false }
      ],
      activityTemplates: null,
      solutions: []
    };
  },

  defaultActivityTemplates: function() {
    return [
      { id: 'eem1_mus', label: '1 EEM', enabled: true, levels: ['1 EEM'], requiredParts: ['Prueba de aptitud'], children: [
        { label: 'Prueba de aptitud', children: [
          { label: 'Capacidad rítmica' },
          { label: 'Capacidad auditiva' },
          { label: 'Capacidad melódica y vocal' }
        ]}
      ]},
      { id: 'eem24_mus', label: '2-4 EEM', enabled: true, levels: ['2 EEM','3 EEM','4 EEM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Lenguaje Musical' }
        ]}
      ]},
      { id: 'epm1_mus', label: '1 EPM', enabled: true, levels: ['1 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista', excludeFor: ['Canto','Guitarra eléctrica','Bajo eléctrico'] }
        ]},
        { label: 'Parte B', children: [
          { label: 'Lenguaje Musical' }
        ]}
      ]},
      { id: 'epm2_mus', label: '2 EPM', enabled: true, levels: ['2 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Lenguaje Musical' },
          { label: 'Idiomas Aplicados al Canto', onlyFor: ['Canto'] },
          { label: 'Fundamentos del Cant Valencià', onlyFor: ['Canto valenciano'] },
          { label: 'Tabalet', onlyFor: ['Dulzaina'] }
        ]}
      ]},
      { id: 'epm3_mus', label: '3 EPM', enabled: true, levels: ['3 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Lenguaje Musical' },
          { label: 'Piano/Clave/Guitarra Complementario/a', excludeFor: ['Piano','Clavecín','Arpa','Órgano'] },
          { label: 'Idiomas Aplicados al Canto', onlyFor: ['Canto'] },
          { label: 'Fundamentos del Cant Valencià', onlyFor: ['Canto valenciano'] },
          { label: 'Tabalet', onlyFor: ['Dulzaina'] }
        ]}
      ]},
      { id: 'epm4_mus', label: '4 EPM', enabled: true, levels: ['4 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Armonía' },
          { label: 'Piano/Clave/Guitarra Complementario/a', excludeFor: ['Piano','Clavecín','Arpa','Órgano'] },
          { label: 'Idiomas Aplicados al Canto', onlyFor: ['Canto'] },
          { label: 'Fundamentos del Cant Valencià', onlyFor: ['Canto valenciano'] },
          { label: 'Tabalet', onlyFor: ['Dulzaina'] }
        ]}
      ]},
      { id: 'epm5_mus', label: '5 EPM', enabled: true, levels: ['5 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Armonía' },
          { label: 'Piano/Clave/Guitarra Complementario/a', excludeFor: ['Piano','Clavecín','Arpa','Órgano'] },
          { label: 'Idiomas Aplicados al Canto', onlyFor: ['Canto'] },
          { label: 'Fundamentos del Cant Valencià', onlyFor: ['Canto valenciano'] },
          { label: 'Tabalet', onlyFor: ['Dulzaina'] }
        ]}
      ]},
      { id: 'epm6_mus', label: '6 EPM', enabled: true, levels: ['6 EPM'], requiredParts: ['Parte A', 'Parte B'], children: [
        { label: 'Parte A', children: [
          { label: 'Interpretación' },
          { label: 'Lectura a primera vista' }
        ]},
        { label: 'Parte B', children: [
          { label: 'Análisis' },
          { label: 'Historia de la Música' },
          { label: 'Piano/Clave/Guitarra Complementario/a', excludeFor: ['Piano','Clavecín','Arpa','Órgano'] },
          { label: 'Idiomas Aplicados al Canto', onlyFor: ['Canto'] },
          { label: 'Fundamentos del Cant Valencià', onlyFor: ['Canto valenciano'] },
          { label: 'Acompañamiento', onlyFor: ['Piano','Clavecín','Órgano','Guitarra','Guitarra eléctrica','Bajo eléctrico'] },
          { label: 'Introducción a la Etnomusicología', onlyFor: ['Canto valenciano'] },
          { label: 'Tabalet', onlyFor: ['Dulzaina'] }
        ]}
      ]}
    ];
  },

  getActivityTemplates: function() {
    if (!this.data.activityTemplates) {
      this.data.activityTemplates = this.defaultActivityTemplates();
      this.save();
    }
    return this.data.activityTemplates;
  },

  getEnabledTemplates: function() {
    return this.getActivityTemplates().filter(function(t) { return t.enabled; });
  },

  toggleTemplate: function(id) {
    var templates = this.getActivityTemplates();
    var tmpl = templates.find(function(t) { return t.id === id; });
    if (tmpl) { tmpl.enabled = !tmpl.enabled; this.save(); }
  },

  setActivityTemplates: function(templates) {
    this.data.activityTemplates = templates;
    this.save();
  },

  findTemplateForTribunal: function(tribunalName) {
    var templates = this.getEnabledTemplates();
    for (var i = 0; i < templates.length; i++) {
      var tmpl = templates[i];
      if (!tmpl.levels) continue;
      for (var j = 0; j < tmpl.levels.length; j++) {
        if (tribunalName.indexOf(tmpl.levels[j]) !== -1) return tmpl;
      }
    }
    return null;
  },

  filterTemplateForSpecialty: function(template, specialty) {
    if (!template || !specialty) return template;
    var specLower = specialty.toLowerCase();
    var filterChildren = function(children) {
      if (!children) return children;
      return children.filter(function(child) {
        if (child.onlyFor) {
          var match = child.onlyFor.some(function(s) { return s.toLowerCase() === specLower; });
          if (!match) return false;
        }
        if (child.excludeFor) {
          var excluded = child.excludeFor.some(function(s) { return s.toLowerCase() === specLower; });
          if (excluded) return false;
        }
        return true;
      }).map(function(child) {
        if (child.children) return { label: child.label, children: filterChildren(child.children), onlyFor: child.onlyFor, excludeFor: child.excludeFor };
        return child;
      });
    };
    return {
      id: template.id, label: template.label, enabled: template.enabled, levels: template.levels,
      requiredParts: template.requiredParts,
      children: filterChildren(template.children)
    };
  },

  resetActivityTemplates: function() {
    this.data.activityTemplates = this.defaultActivityTemplates();
    this.save();
  },

  // Build text from tree path: "EPM 3r — Parte B: Armonía"
  buildActivityText: function(templateLabel, path) {
    var parts = [templateLabel];
    path.forEach(function(p, i) {
      if (i === 0) parts.push(p);
      else parts[parts.length - 1] += ': ' + p;
    });
    return parts.join(' — ');
  },

  // Check activity coverage at 3 levels
  checkActivityCoverage: function(solutionId, tribunalId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return [];
    var self = this;
    var allActivities = [];
    (trib.schedule || []).forEach(function(sched) {
      (sched.slots || []).forEach(function(slot) {
        if (slot.activity) allActivities.push(slot.activity);
      });
    });
    if (allActivities.length === 0) return [];

    // Find which template this tribunal uses
    var matchedTemplate = this.findTemplateForTribunal(trib.name);
    if (!matchedTemplate) return [];

    var prefix = matchedTemplate.label;
    var matchingActivities = allActivities.filter(function(a) { return a.indexOf(prefix) === 0; });
    if (matchingActivities.length === 0) return [];

    // Detect specialty from tribunal name
    var specialty = null;
    if (typeof Tribunator !== 'undefined' && Tribunator.Tribunals && Tribunator.Tribunals._specialties) {
      Tribunator.Tribunals._specialties.forEach(function(s) { if (trib.name.indexOf(s) !== -1) specialty = s; });
    }

    // Filter template for specialty
    var filtered = specialty ? this.filterTemplateForSpecialty(matchedTemplate, specialty) : matchedTemplate;

    var issues = [];

    // Level 1: Required parts (Parte A, Parte B, etc.)
    if (filtered.requiredParts) {
      filtered.requiredParts.forEach(function(req) {
        var covered = matchingActivities.some(function(a) { return a.indexOf(req) !== -1; });
        if (!covered) {
          issues.push({ template: prefix, missingPart: req, level: 'part' });
        }
      });
    }

    // Level 2: If user used sub-level for a part, check all subs are covered
    if (filtered.children) {
      filtered.children.forEach(function(part) {
        if (!part.children || part.children.length === 0) return;
        // Check if user used sub-level notation for this part (e.g. "Parte A: Interpretación")
        var subPrefix = prefix + ' — ' + part.label + ': ';
        var usedSubs = matchingActivities.filter(function(a) { return a.indexOf(subPrefix) === 0; });
        if (usedSubs.length === 0) return; // User put "Parte A" generic or didn't use it — skip sub-check

        // User descended to sub-level: check each sub-item is covered
        part.children.forEach(function(sub) {
          var subText = subPrefix + sub.label;
          var subCovered = matchingActivities.some(function(a) { return a.indexOf(sub.label) !== -1 && a.indexOf(part.label) !== -1; });
          if (!subCovered) {
            issues.push({ template: prefix, missingPart: part.label + ': ' + sub.label, level: 'sub' });
          }
        });
      });
    }

    // Level 3: Specialty-specific required subs (onlyFor items that should be present)
    if (specialty && matchedTemplate.children) {
      matchedTemplate.children.forEach(function(part) {
        if (!part.children) return;
        part.children.forEach(function(sub) {
          if (!sub.onlyFor) return;
          var applies = sub.onlyFor.some(function(s) { return s.toLowerCase() === specialty.toLowerCase(); });
          if (!applies) return;
          // This sub is required for this specialty — check if covered
          var covered = matchingActivities.some(function(a) { return a.indexOf(sub.label) !== -1; });
          if (!covered) {
            issues.push({ template: prefix, missingPart: part.label + ': ' + sub.label + ' (' + specialty + ')', level: 'specialty' });
          }
        });
      });
    }

    return issues;
  },

  data: null,
  _undoStack: [],
  _redoStack: [],
  _maxUndo: 40,
  _skipSnapshot: false,

  init: function() {
    var saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        if (!this.data.days) this.data.days = [];
        if (!this.data.candidates) this.data.candidates = [];
        if (!this.data.roleDefs || this.data.roleDefs.length === 0) this.data.roleDefs = this.defaultData().roleDefs;
        if (!this.data.solutions) this.data.solutions = [];
        if (!this.data.customFieldDefs) this.data.customFieldDefs = [];
        if (!this.data.groups) this.data.groups = [];
        if (!this.data.settings) this.data.settings = { language: 'es', defaultMembersPerTribunal: 3 };
        if (!this.data.activityTemplates) this.data.activityTemplates = this.defaultActivityTemplates();
      } catch (e) {
        console.error('Error loading saved data:', e);
        this.data = this.defaultData();
      }
    } else {
      this.data = this.defaultData();
    }
  },

  save: function() {
    if (!this._skipSnapshot) {
      this._pushUndo();
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  },

  _pushUndo: function() {
    var snapshot = JSON.stringify(this.data);
    if (this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1] === snapshot) return;
    this._undoStack.push(snapshot);
    if (this._undoStack.length > this._maxUndo) this._undoStack.shift();
    this._redoStack = [];
  },

  undo: function() {
    if (this._undoStack.length === 0) return false;
    this._redoStack.push(JSON.stringify(this.data));
    this.data = JSON.parse(this._undoStack.pop());
    this._skipSnapshot = true;
    this.save();
    this._skipSnapshot = false;
    return true;
  },

  redo: function() {
    if (this._redoStack.length === 0) return false;
    this._undoStack.push(JSON.stringify(this.data));
    this.data = JSON.parse(this._redoStack.pop());
    this._skipSnapshot = true;
    this.save();
    this._skipSnapshot = false;
    return true;
  },

  canUndo: function() { return this._undoStack.length > 0; },
  canRedo: function() { return this._redoStack.length > 0; },

  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // --- Campus CRUD ---
  getCampuses: function() {
    return this.data.campuses;
  },

  getCampus: function(id) {
    return this.data.campuses.find(function(c) { return c.id === id; });
  },

  addCampus: function(name) {
    var campus = {
      id: this.generateId(),
      name: name,
      floors: []
    };
    this.data.campuses.push(campus);
    this.save();
    return campus;
  },

  updateCampus: function(id, name) {
    var campus = this.getCampus(id);
    if (campus) {
      campus.name = name;
      this.save();
    }
    return campus;
  },

  deleteCampus: function(id) {
    var campus = this.getCampus(id);
    if (campus) {
      var roomIds = [];
      campus.floors.forEach(function(f) {
        f.rooms.forEach(function(r) { roomIds.push(r.id); });
      });
      this._removeRoomsFromGroups(roomIds);
    }
    this.data.campuses = this.data.campuses.filter(function(c) { return c.id !== id; });
    this.save();
  },

  // --- Floor CRUD ---
  getFloor: function(campusId, floorId) {
    var campus = this.getCampus(campusId);
    if (!campus) return null;
    return campus.floors.find(function(f) { return f.id === floorId; });
  },

  addFloor: function(campusId, name) {
    var campus = this.getCampus(campusId);
    if (!campus) return null;
    var floor = {
      id: this.generateId(),
      name: name,
      gridCols: 15,
      gridRows: 10,
      rooms: []
    };
    campus.floors.push(floor);
    this.save();
    return floor;
  },

  updateFloor: function(campusId, floorId, name) {
    var floor = this.getFloor(campusId, floorId);
    if (floor) {
      floor.name = name;
      this.save();
    }
    return floor;
  },

  deleteFloor: function(campusId, floorId) {
    var campus = this.getCampus(campusId);
    if (!campus) return;
    var floor = this.getFloor(campusId, floorId);
    if (floor) {
      var roomIds = floor.rooms.map(function(r) { return r.id; });
      this._removeRoomsFromGroups(roomIds);
    }
    campus.floors = campus.floors.filter(function(f) { return f.id !== floorId; });
    this.save();
  },

  moveFloor: function(campusId, floorId, direction) {
    var campus = this.getCampus(campusId);
    if (!campus) return;
    var idx = -1;
    campus.floors.forEach(function(f, i) { if (f.id === floorId) idx = i; });
    if (idx === -1) return;
    var newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= campus.floors.length) return;
    var temp = campus.floors[idx];
    campus.floors[idx] = campus.floors[newIdx];
    campus.floors[newIdx] = temp;
    this.save();
  },

  duplicateFloor: function(campusId, floorId) {
    var campus = this.getCampus(campusId);
    var floor = this.getFloor(campusId, floorId);
    if (!campus || !floor) return null;
    var idMap = {};
    var newFloor = {
      id: this.generateId(),
      name: floor.name + ' (copia)',
      gridCols: floor.gridCols,
      gridRows: floor.gridRows,
      rooms: floor.rooms.map(function(r) {
        var newId = Tribunator.Store.generateId();
        idMap[r.id] = newId;
        return {
          id: newId,
          name: r.name,
          cells: r.cells.map(function(c) { return { col: c.col, row: c.row }; }),
          color: r.color,
          notes: r.notes || '',
          customFields: Object.assign({}, r.customFields || {})
        };
      })
    };
    campus.floors.push(newFloor);
    this.save();
    return newFloor;
  },

  resizeGrid: function(campusId, floorId, direction) {
    var floor = this.getFloor(campusId, floorId);
    if (!floor) return;
    switch (direction) {
      case 'right': floor.gridCols++; break;
      case 'down': floor.gridRows++; break;
      case 'left':
        floor.gridCols++;
        floor.rooms.forEach(function(r) {
          r.cells.forEach(function(c) { c.col++; });
        });
        break;
      case 'up':
        floor.gridRows++;
        floor.rooms.forEach(function(r) {
          r.cells.forEach(function(c) { c.row++; });
        });
        break;
    }
    this.save();
  },

  checkShrinkGrid: function(campusId, floorId, direction) {
    var floor = this.getFloor(campusId, floorId);
    if (!floor) return { can: false, rooms: [] };
    var isCol = (direction === 'right' || direction === 'left');
    if (isCol && floor.gridCols <= 1) return { can: false, rooms: [], tooSmall: true };
    if (!isCol && floor.gridRows <= 1) return { can: false, rooms: [], tooSmall: true };

    var edge;
    if (direction === 'right') edge = floor.gridCols - 1;
    else if (direction === 'left') edge = 0;
    else if (direction === 'down') edge = floor.gridRows - 1;
    else edge = 0;

    var affected = [];
    floor.rooms.forEach(function(room) {
      var hit = room.cells.some(function(c) {
        if (isCol) return c.col === edge;
        return c.row === edge;
      });
      if (hit) affected.push(room);
    });
    return { can: affected.length === 0, rooms: affected };
  },

  shrinkGrid: function(campusId, floorId, direction, force) {
    var check = this.checkShrinkGrid(campusId, floorId, direction);
    if (!check.can && !force) return false;
    var floor = this.getFloor(campusId, floorId);
    if (!floor) return false;
    var self = this;

    if (force && check.rooms.length > 0) {
      check.rooms.forEach(function(room) {
        var isCol = (direction === 'right' || direction === 'left');
        var edge = direction === 'right' ? floor.gridCols - 1 :
                   direction === 'left' ? 0 :
                   direction === 'down' ? floor.gridRows - 1 : 0;
        room.cells = room.cells.filter(function(c) {
          return isCol ? c.col !== edge : c.row !== edge;
        });
        if (room.cells.length === 0) {
          self.deleteRoom(room.id);
        }
      });
    }

    switch (direction) {
      case 'right': floor.gridCols--; break;
      case 'down': floor.gridRows--; break;
      case 'left':
        floor.gridCols--;
        floor.rooms.forEach(function(r) {
          r.cells.forEach(function(c) { c.col--; });
        });
        break;
      case 'up':
        floor.gridRows--;
        floor.rooms.forEach(function(r) {
          r.cells.forEach(function(c) { c.row--; });
        });
        break;
    }
    this.save();
    return true;
  },

  // --- Room CRUD ---
  getRoom: function(roomId) {
    var result = null;
    this.data.campuses.forEach(function(campus) {
      campus.floors.forEach(function(floor) {
        floor.rooms.forEach(function(room) {
          if (room.id === roomId) {
            result = { room: room, floor: floor, campus: campus };
          }
        });
      });
    });
    return result;
  },

  getAllRooms: function() {
    var rooms = [];
    this.data.campuses.forEach(function(campus) {
      campus.floors.forEach(function(floor) {
        floor.rooms.forEach(function(room) {
          rooms.push({
            room: room,
            floor: floor,
            campus: campus
          });
        });
      });
    });
    return rooms;
  },

  addRoom: function(campusId, floorId, room) {
    var floor = this.getFloor(campusId, floorId);
    if (!floor) return null;
    var newRoom = {
      id: this.generateId(),
      name: room.name,
      cells: room.cells,
      color: room.color || this._generateRoomColor(),
      notes: room.notes || '',
      customFields: room.customFields || {}
    };
    floor.rooms.push(newRoom);
    this.save();
    return newRoom;
  },

  updateRoom: function(roomId, updates) {
    var found = this.getRoom(roomId);
    if (!found) return null;
    Object.assign(found.room, updates);
    this.save();
    return found.room;
  },

  getRoomReferences: function(roomId) {
    var refs = [];
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        (trib.schedule || []).forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            if (slot.roomId === roomId) refs.push({ solution: sol.name, tribunal: trib.name, slotTime: slot.startTime + '–' + slot.endTime });
          });
        });
      });
    });
    return refs;
  },

  deleteRoom: function(roomId) {
    this._removeRoomsFromGroups([roomId]);
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        (trib.schedule || []).forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            if (slot.roomId === roomId) slot.roomId = null;
          });
        });
      });
    });
    this.data.campuses.forEach(function(campus) {
      campus.floors.forEach(function(floor) {
        floor.rooms = floor.rooms.filter(function(r) { return r.id !== roomId; });
      });
    });
    this.save();
  },

  _roomColorIndex: 0,
  _roomColors: [
    '#4A90D9', '#D94A4A', '#4AD97A', '#D9A84A', '#9B4AD9',
    '#4AD9D9', '#D94A9B', '#7AD94A', '#D9D94A', '#4A5CD9',
    '#D96A4A', '#4AD9A8', '#A84AD9', '#D9D94A', '#4A9BD9',
    '#D94A6A'
  ],

  _generateRoomColor: function() {
    var color = this._roomColors[this._roomColorIndex % this._roomColors.length];
    this._roomColorIndex++;
    return color;
  },

  // --- Custom Field Definitions ---
  getCustomFieldDefs: function() {
    return this.data.customFieldDefs;
  },

  addCustomFieldDef: function(def) {
    var field = {
      id: this.generateId(),
      name: def.name,
      type: def.type,
      options: def.options || []
    };
    this.data.customFieldDefs.push(field);
    this.save();
    return field;
  },

  updateCustomFieldDef: function(id, updates) {
    var field = this.data.customFieldDefs.find(function(f) { return f.id === id; });
    if (field) {
      Object.assign(field, updates);
      this.save();
    }
    return field;
  },

  deleteCustomFieldDef: function(id) {
    this.data.customFieldDefs = this.data.customFieldDefs.filter(function(f) { return f.id !== id; });
    this.data.campuses.forEach(function(campus) {
      campus.floors.forEach(function(floor) {
        floor.rooms.forEach(function(room) {
          if (room.customFields) {
            delete room.customFields[id];
          }
        });
      });
    });
    this.save();
  },

  // --- Groups ---
  getGroups: function() {
    return this.data.groups;
  },

  getGroup: function(id) {
    return this.data.groups.find(function(g) { return g.id === id; });
  },

  addGroup: function(name, roomIds) {
    var group = {
      id: this.generateId(),
      name: name,
      roomIds: roomIds || []
    };
    this.data.groups.push(group);
    this.save();
    return group;
  },

  updateGroup: function(id, updates) {
    var group = this.getGroup(id);
    if (group) {
      Object.assign(group, updates);
      this.save();
    }
    return group;
  },

  deleteGroup: function(id) {
    this.data.groups = this.data.groups.filter(function(g) { return g.id !== id; });
    this.save();
  },

  getRoomGroups: function(roomId) {
    return this.data.groups.filter(function(g) {
      return g.roomIds.indexOf(roomId) !== -1;
    });
  },

  getGroupWarnings: function(groupId) {
    var group = this.getGroup(groupId);
    if (!group) return [];
    var warnings = [];
    var campusIds = {};
    var floorIds = {};
    var self = this;
    group.roomIds.forEach(function(roomId) {
      var found = self.getRoom(roomId);
      if (found) {
        campusIds[found.campus.id] = found.campus.name;
        floorIds[found.floor.id] = found.floor.name;
      }
    });
    if (Object.keys(campusIds).length > 1) {
      warnings.push({ type: 'crossCampus', message: t('space.groupCrossCampusWarning') });
    }
    if (Object.keys(floorIds).length > 1) {
      warnings.push({ type: 'crossFloor', message: t('space.groupCrossFloorWarning') });
    }
    return warnings;
  },

  _removeRoomsFromGroups: function(roomIds) {
    this.data.groups.forEach(function(group) {
      group.roomIds = group.roomIds.filter(function(id) {
        return roomIds.indexOf(id) === -1;
      });
    });
  },

  // --- Days ---
  getDays: function() {
    if (!this.data.days) this.data.days = [];
    return this.data.days.sort(function(a, b) { return a.date.localeCompare(b.date); });
  },

  getDay: function(id) {
    return (this.data.days || []).find(function(d) { return d.id === id; });
  },

  addDay: function(day) {
    if (!this.data.days) this.data.days = [];
    var newDay = {
      id: this.generateId(),
      date: day.date,
      startTime: day.startTime || '08:00',
      endTime: day.endTime || '21:00'
    };
    this.data.days.push(newDay);
    this.save();
    return newDay;
  },

  updateDay: function(id, updates) {
    var day = this.getDay(id);
    if (day) {
      Object.assign(day, updates);
      this.save();
    }
    return day;
  },

  getDayReferences: function(dayId) {
    var refs = [];
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        var sched = (trib.schedule || []).find(function(s) { return s.dayId === dayId; });
        if (sched) refs.push({ solution: sol.name, tribunal: trib.name, slots: (sched.slots || []).length });
      });
    });
    return refs;
  },

  deleteDay: function(id) {
    this.data.days = (this.data.days || []).filter(function(d) { return d.id !== id; });
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        if (trib.schedule) {
          trib.schedule = trib.schedule.filter(function(s) { return s.dayId !== id; });
        }
      });
    });
    this.save();
  },

  // --- Candidates ---
  getCandidates: function() {
    if (!this.data.candidates) this.data.candidates = [];
    return this.data.candidates;
  },

  getCandidate: function(id) {
    return (this.data.candidates || []).find(function(c) { return c.id === id; });
  },

  addCandidate: function(candidate) {
    if (!this.data.candidates) this.data.candidates = [];
    var c = {
      id: this.generateId(),
      name: candidate.name || '',
      surnames: candidate.surnames || '',
      specialty: candidate.specialty || '',
      titularName: candidate.titularName || '',
      titularSurnames: candidate.titularSurnames || '',
      useTitular: false
    };
    this.data.candidates.push(c);
    this.save();
    return c;
  },

  isSubstitute: function(candidateId) {
    var c = this.getCandidate(candidateId);
    return c && c.titularSurnames && c.titularSurnames.trim() !== '';
  },

  toggleTitular: function(candidateId) {
    var c = this.getCandidate(candidateId);
    if (c && this.isSubstitute(candidateId)) {
      c.useTitular = !c.useTitular;
      this.save();
    }
    return c;
  },

  getCandidateDisplayName: function(candidateId) {
    var c = this.getCandidate(candidateId);
    if (!c) return '?';
    if (c.useTitular && c.titularSurnames) {
      return c.titularSurnames + ', ' + c.titularName;
    }
    return c.surnames + ', ' + c.name;
  },

  updateCandidate: function(id, updates) {
    var c = this.getCandidate(id);
    if (c) { Object.assign(c, updates); this.save(); }
    return c;
  },

  getCandidateReferences: function(candidateId) {
    var refs = [];
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        var isMember = trib.members.some(function(m) { return m.candidateId === candidateId; });
        if (isMember) refs.push({ solution: sol.name, tribunal: trib.name });
      });
    });
    return refs;
  },

  deleteCandidate: function(id) {
    this.data.candidates = (this.data.candidates || []).filter(function(c) { return c.id !== id; });
    (this.data.solutions || []).forEach(function(sol) {
      (sol.tribunals || []).forEach(function(trib) {
        trib.members = trib.members.filter(function(m) { return m.candidateId !== id; });
        (trib.variations || []).forEach(function(v) {
          v.members = v.members.filter(function(m) { return m.candidateId !== id; });
        });
      });
    });
    this.save();
  },

  importCandidates: function(list) {
    if (!this.data.candidates) this.data.candidates = [];
    var self = this;
    var added = 0;
    list.forEach(function(item) {
      var exists = self.data.candidates.some(function(c) {
        return c.name === item.name && c.surnames === item.surnames;
      });
      if (!exists) {
        self.data.candidates.push({
          id: self.generateId(),
          name: item.name || '',
          surnames: item.surnames || '',
          specialty: item.specialty || '',
          titularName: item.titularName || '',
          titularSurnames: item.titularSurnames || '',
          useTitular: false
        });
        added++;
      }
    });
    this.save();
    return added;
  },

  // --- Role definitions ---
  _migrateRoleDefs: function() {
    if (!this.data.roleDefs) { this.data.roleDefs = []; return; }
    if (this.data.roleDefs.length > 0 && typeof this.data.roleDefs[0] === 'string') {
      this.data.roleDefs = this.data.roleDefs.map(function(name) {
        return { name: name, counts: true };
      });
      this.save();
    }
  },

  getRoleDefs: function() {
    this._migrateRoleDefs();
    return this.data.roleDefs;
  },

  getRoleDefByName: function(name) {
    this._migrateRoleDefs();
    return this.data.roleDefs.find(function(r) { return r.name === name; });
  },

  addRoleDef: function(name, counts, requireOne) {
    this._migrateRoleDefs();
    var existing = this.data.roleDefs.find(function(r) { return r.name === name; });
    if (!existing) {
      var role = { name: name, counts: counts !== false };
      if (requireOne) role.requireOne = true;
      this.data.roleDefs.push(role);
      this.save();
    }
  },

  updateRoleDef: function(oldName, newName, counts, requireOne) {
    this._migrateRoleDefs();
    var role = this.data.roleDefs.find(function(r) { return r.name === oldName; });
    if (role) {
      role.name = newName;
      role.counts = counts !== false;
      if (requireOne) role.requireOne = true;
      else delete role.requireOne;
      this.save();
    }
  },

  deleteRoleDef: function(name) {
    this._migrateRoleDefs();
    this.data.roleDefs = this.data.roleDefs.filter(function(r) { return r.name !== name; });
    this.save();
  },

  roleCountsForQuorum: function(roleName) {
    var role = this.getRoleDefByName(roleName);
    if (!role) return true;
    return role.counts;
  },

  countTribunalMembers: function(solutionId, tribunalId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return 0;
    var self = this;
    return trib.members.filter(function(m) {
      return self.roleCountsForQuorum(m.role);
    }).length;
  },

  getTribunalWarnings: function(solutionId, tribunalId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return [];
    var warnings = [];
    var self = this;
    var requiredRoles = this.getRoleDefs().filter(function(r) { return r.requireOne; });
    requiredRoles.forEach(function(roleDef) {
      var has = trib.members.some(function(m) { return m.role === roleDef.name; });
      if (!has) {
        warnings.push({ type: 'missingRole', role: roleDef.name });
      }
    });
    return warnings;
  },

  // --- Solutions ---
  getSolutions: function() {
    if (!this.data.solutions) this.data.solutions = [];
    return this.data.solutions;
  },

  getSolution: function(id) {
    return (this.data.solutions || []).find(function(s) { return s.id === id; });
  },

  getActiveSolution: function() {
    return (this.data.solutions || []).find(function(s) { return s.active; });
  },

  addSolution: function(name) {
    if (!this.data.solutions) this.data.solutions = [];
    var isFirst = this.data.solutions.length === 0;
    var sol = {
      id: this.generateId(),
      name: name,
      active: isFirst,
      publishText: '',
      tribunals: []
    };
    this.data.solutions.push(sol);
    this.save();
    return sol;
  },

  setActiveSolution: function(id) {
    (this.data.solutions || []).forEach(function(s) { s.active = s.id === id; });
    this.save();
  },

  updateSolution: function(id, updates) {
    var sol = this.getSolution(id);
    if (sol) { Object.assign(sol, updates); this.save(); }
    return sol;
  },

  deleteSolution: function(id) {
    this.data.solutions = (this.data.solutions || []).filter(function(s) { return s.id !== id; });
    if (this.data.solutions.length > 0 && !this.data.solutions.some(function(s) { return s.active; })) {
      this.data.solutions[0].active = true;
    }
    this.save();
  },

  // --- Tribunals (within active solution) ---
  getTribunals: function(solutionId) {
    var sol = this.getSolution(solutionId);
    return sol ? sol.tribunals : [];
  },

  getTribunal: function(solutionId, tribunalId) {
    var tribunals = this.getTribunals(solutionId);
    return tribunals.find(function(t) { return t.id === tribunalId; });
  },

  addTribunal: function(solutionId, name) {
    var sol = this.getSolution(solutionId);
    if (!sol) return null;
    var tribunal = {
      id: this.generateId(),
      name: name,
      publishNotes: '',
      members: [],
      variations: [],
      schedule: []
    };
    sol.tribunals.push(tribunal);
    this.save();
    return tribunal;
  },

  duplicateTribunal: function(solutionId, tribunalId) {
    var sol = this.getSolution(solutionId);
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!sol || !trib) return null;
    var self = this;
    var copy = JSON.parse(JSON.stringify(trib));
    copy.id = this.generateId();
    copy.name = trib.name + ' (copia)';
    copy.members.forEach(function(m) { m.id = self.generateId(); });
    (copy.variations || []).forEach(function(v) { v.id = self.generateId(); v.members.forEach(function(m) { m.id = self.generateId(); }); });
    (copy.schedule || []).forEach(function(s) { (s.slots || []).forEach(function(sl) { sl.id = self.generateId(); }); });
    sol.tribunals.push(copy);
    this.save();
    return copy;
  },

  updateTribunal: function(solutionId, tribunalId, updates) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (trib) { Object.assign(trib, updates); this.save(); }
    return trib;
  },

  deleteTribunal: function(solutionId, tribunalId) {
    var sol = this.getSolution(solutionId);
    if (sol) {
      sol.tribunals = sol.tribunals.filter(function(t) { return t.id !== tribunalId; });
      this.save();
    }
  },

  moveTribunal: function(solutionId, tribunalId, direction) {
    var sol = this.getSolution(solutionId);
    if (!sol) return;
    var idx = -1;
    sol.tribunals.forEach(function(t, i) { if (t.id === tribunalId) idx = i; });
    if (idx === -1) return;
    var newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sol.tribunals.length) return;
    var temp = sol.tribunals[idx];
    sol.tribunals[idx] = sol.tribunals[newIdx];
    sol.tribunals[newIdx] = temp;
    this.save();
  },

  sortTribunals: function(solutionId) {
    var sol = this.getSolution(solutionId);
    if (!sol) return;
    sol.tribunals.sort(function(a, b) { return a.name.localeCompare(b.name); });
    this.save();
  },

  addTribunalMember: function(solutionId, tribunalId, candidateId, role) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return null;
    var member = { id: this.generateId(), candidateId: candidateId, role: role || '' };
    trib.members.push(member);
    this.save();
    return member;
  },

  removeTribunalMember: function(solutionId, tribunalId, memberId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (trib) {
      trib.members = trib.members.filter(function(m) { return m.id !== memberId; });
      this.save();
    }
  },

  updateTribunalMember: function(solutionId, tribunalId, memberId, updates) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    var member = trib.members.find(function(m) { return m.id === memberId; });
    if (member) { Object.assign(member, updates); this.save(); }
  },

  moveTribunalMember: function(solutionId, tribunalId, memberId, direction) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    var idx = -1;
    trib.members.forEach(function(m, i) { if (m.id === memberId) idx = i; });
    if (idx === -1) return;
    var newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= trib.members.length) return;
    var temp = trib.members[idx];
    trib.members[idx] = trib.members[newIdx];
    trib.members[newIdx] = temp;
    this.save();
  },

  moveVariationMember: function(solutionId, tribunalId, variationId, memberId, direction) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureVariations(trib);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (!v) return;
    var idx = -1;
    v.members.forEach(function(m, i) { if (m.id === memberId) idx = i; });
    if (idx === -1) return;
    var newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= v.members.length) return;
    var temp = v.members[idx];
    v.members[idx] = v.members[newIdx];
    v.members[newIdx] = temp;
    this.save();
  },

  updateVariationMember: function(solutionId, tribunalId, variationId, memberId, updates) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureVariations(trib);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (!v) return;
    var member = v.members.find(function(m) { return m.id === memberId; });
    if (member) { Object.assign(member, updates); this.save(); }
  },

  // --- Schedule ---
  _ensureSchedule: function(trib) {
    if (!trib.schedule) trib.schedule = [];
  },

  getDaySchedule: function(solutionId, tribunalId, dayId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return null;
    this._ensureSchedule(trib);
    return trib.schedule.find(function(s) { return s.dayId === dayId; });
  },

  setDaySchedule: function(solutionId, tribunalId, dayId, data) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureSchedule(trib);
    var existing = trib.schedule.find(function(s) { return s.dayId === dayId; });
    if (existing) {
      Object.assign(existing, data);
    } else {
      trib.schedule.push({
        dayId: dayId,
        primaryRoomId: data.primaryRoomId || null,
        supportRooms: data.supportRooms || [],
        activity: data.activity || '',
        slots: data.slots || []
      });
    }
    this.save();
  },

  removeDaySchedule: function(solutionId, tribunalId, dayId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureSchedule(trib);
    trib.schedule = trib.schedule.filter(function(s) { return s.dayId !== dayId; });
    this.save();
  },

  addSupportRoom: function(solutionId, tribunalId, dayId, roomId, purpose) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched) {
      this.setDaySchedule(solutionId, tribunalId, dayId, { supportRooms: [{ roomId: roomId, purpose: purpose || '' }] });
      return;
    }
    if (!sched.supportRooms) sched.supportRooms = [];
    sched.supportRooms.push({ roomId: roomId, purpose: purpose || '' });
    this.save();
  },

  removeSupportRoom: function(solutionId, tribunalId, dayId, roomId) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched || !sched.supportRooms) return;
    sched.supportRooms = sched.supportRooms.filter(function(sr) { return sr.roomId !== roomId; });
    this.save();
  },

  checkSlotConflict: function(solutionId, tribunalId, dayId, startTime, endTime, roomId, excludeSlotId) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched || !sched.slots) return null;
    var self = this;
    for (var i = 0; i < sched.slots.length; i++) {
      var s = sched.slots[i];
      if (excludeSlotId && s.id === excludeSlotId) continue;
      if (s.roomId === roomId && self._timesOverlap(startTime, endTime, s.startTime, s.endTime)) {
        return s;
      }
    }
    return null;
  },

  addTimeSlot: function(solutionId, tribunalId, dayId, slot) {
    var conflict = this.checkSlotConflict(solutionId, tribunalId, dayId, slot.startTime, slot.endTime, slot.roomId);
    if (conflict) return { error: 'selfConflict', slot: conflict };

    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched) {
      this.setDaySchedule(solutionId, tribunalId, dayId, { slots: [{ id: this.generateId(), startTime: slot.startTime, endTime: slot.endTime, roomId: slot.roomId || null, activity: slot.activity || '' }] });
      return { success: true };
    }
    if (!sched.slots) sched.slots = [];
    sched.slots.push({ id: this.generateId(), startTime: slot.startTime, endTime: slot.endTime, roomId: slot.roomId || null, activity: slot.activity || '' });
    this.save();
    return { success: true };
  },

  updateTimeSlot: function(solutionId, tribunalId, dayId, slotId, updates) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched || !sched.slots) return;
    var slot = sched.slots.find(function(s) { return s.id === slotId; });
    if (slot) { Object.assign(slot, updates); this.save(); }
  },

  removeTimeSlot: function(solutionId, tribunalId, dayId, slotId) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched || !sched.slots) return;
    sched.slots = sched.slots.filter(function(s) { return s.id !== slotId; });
    this.save();
  },

  // --- Variations ---
  _ensureVariations: function(trib) {
    if (!trib.variations) trib.variations = [];
  },

  addVariation: function(solutionId, tribunalId, name) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return null;
    this._ensureVariations(trib);
    var v = { id: this.generateId(), name: name, members: [] };
    trib.variations.push(v);
    this.save();
    return v;
  },

  updateVariation: function(solutionId, tribunalId, variationId, updates) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureVariations(trib);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (v) { Object.assign(v, updates); this.save(); }
  },

  deleteVariation: function(solutionId, tribunalId, variationId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureVariations(trib);
    trib.variations = trib.variations.filter(function(x) { return x.id !== variationId; });
    this.save();
  },

  addVariationMember: function(solutionId, tribunalId, variationId, candidateId, role) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return null;
    this._ensureVariations(trib);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (!v) return null;
    var m = { id: this.generateId(), candidateId: candidateId, role: role || '' };
    v.members.push(m);
    this.save();
    return m;
  },

  removeVariationMember: function(solutionId, tribunalId, variationId, memberId) {
    var trib = this.getTribunal(solutionId, tribunalId);
    if (!trib) return;
    this._ensureVariations(trib);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (v) { v.members = v.members.filter(function(m) { return m.id !== memberId; }); this.save(); }
  },

  moveSlotToDay: function(solutionId, tribunalId, fromDayId, slotId, toDayId) {
    var fromSched = this.getDaySchedule(solutionId, tribunalId, fromDayId);
    if (!fromSched || !fromSched.slots) return;
    var slotIdx = -1;
    fromSched.slots.forEach(function(s, i) { if (s.id === slotId) slotIdx = i; });
    if (slotIdx === -1) return;
    var slot = fromSched.slots.splice(slotIdx, 1)[0];
    var toSched = this.getDaySchedule(solutionId, tribunalId, toDayId);
    if (!toSched) {
      this.setDaySchedule(solutionId, tribunalId, toDayId, { slots: [slot] });
    } else {
      if (!toSched.slots) toSched.slots = [];
      toSched.slots.push(slot);
    }
    this.save();
  },

  moveAllSlotsToDay: function(solutionId, tribunalId, fromDayId, toDayId) {
    var fromSched = this.getDaySchedule(solutionId, tribunalId, fromDayId);
    if (!fromSched || !fromSched.slots || fromSched.slots.length === 0) return;
    var toSched = this.getDaySchedule(solutionId, tribunalId, toDayId);
    if (!toSched) {
      this.setDaySchedule(solutionId, tribunalId, toDayId, { slots: fromSched.slots.slice() });
    } else {
      if (!toSched.slots) toSched.slots = [];
      fromSched.slots.forEach(function(s) { toSched.slots.push(s); });
    }
    fromSched.slots = [];
    this.save();
  },

  sortDaySlots: function(solutionId, tribunalId, dayId) {
    var sched = this.getDaySchedule(solutionId, tribunalId, dayId);
    if (!sched || !sched.slots || sched.slots.length <= 1) return;
    var self = this;
    sched.slots.sort(function(a, b) {
      var timeA = self._timeToMin(a.startTime), timeB = self._timeToMin(b.startTime);
      if (timeA !== timeB) return timeA - timeB;
      // Same start time: exam activities first, non-blocking last
      var aNb = self.isNonBlockingSlot(a) ? 1 : 0;
      var bNb = self.isNonBlockingSlot(b) ? 1 : 0;
      return aNb - bNb;
    });
    this._skipSnapshot = true;
    this.save();
    this._skipSnapshot = false;
  },

  // --- Conflict detection ---
  _nonBlockingActivities: ['Llamamiento de Aspirantes', 'Constitución del Tribunal'],

  isNonBlockingSlot: function(slot) {
    if (!slot || !slot.activity) return false;
    return this._nonBlockingActivities.some(function(a) { return slot.activity.indexOf(a) !== -1; });
  },

  _timeToMin: function(t) {
    var p = t.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]);
  },

  _timesOverlap: function(s1, e1, s2, e2) {
    var a = this._timeToMin(s1), b = this._timeToMin(e1);
    var c = this._timeToMin(s2), d = this._timeToMin(e2);
    return a < d && c < b;
  },

  getRoomConflicts: function(solutionId, roomId, dayId, startTime, endTime, excludeTribunalId, currentActivity) {
    var sol = this.getSolution(solutionId);
    if (!sol) return [];
    var self = this;
    var conflicts = [];
    sol.tribunals.forEach(function(trib) {
      if (trib.id === excludeTribunalId) return;
      var sched = (trib.schedule || []).find(function(s) { return s.dayId === dayId; });
      if (!sched) return;
      if (sched.primaryRoomId === roomId) {
        conflicts.push({ tribunal: trib, type: 'primary' });
      }
      (sched.supportRooms || []).forEach(function(sr) {
        if (sr.roomId === roomId) conflicts.push({ tribunal: trib, type: 'support' });
      });
      (sched.slots || []).forEach(function(slot) {
        if (slot.roomId === roomId && self._timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
          var nonBlocking = self.isNonBlockingSlot(slot) || self.isNonBlockingSlot({ activity: currentActivity });
          conflicts.push({ tribunal: trib, type: 'slot', slot: slot, nonBlocking: nonBlocking });
        }
      });
    });
    return conflicts;
  },

  getMemberConflicts: function(solutionId, candidateId, dayId, excludeTribunalId, startTime, endTime) {
    var sol = this.getSolution(solutionId);
    if (!sol) return [];
    var self = this;
    var conflicts = [];
    sol.tribunals.forEach(function(trib) {
      if (trib.id === excludeTribunalId) return;
      var hasMember = trib.members.some(function(m) { return m.candidateId === candidateId; });
      if (!hasMember) {
        hasMember = (trib.variations || []).some(function(v) { return v.members.some(function(m) { return m.candidateId === candidateId; }); });
      }
      if (!hasMember) return;
      var sched = (trib.schedule || []).find(function(s) { return s.dayId === dayId; });
      if (!sched) return;
      // If start/end times provided, check slot-level overlap
      if (startTime && endTime && sched.slots && sched.slots.length > 0) {
        var hasOverlap = sched.slots.some(function(slot) {
          return self._timesOverlap(startTime, endTime, slot.startTime, slot.endTime);
        });
        if (hasOverlap) {
          conflicts.push({ tribunal: trib, schedule: sched });
        }
      } else {
        // No times specified — any presence on that day is a conflict
        conflicts.push({ tribunal: trib, schedule: sched });
      }
    });
    return conflicts;
  },

  getRoomOccupation: function(solutionId, dayId) {
    var sol = this.getSolution(solutionId);
    if (!sol) return {};
    var occupation = {};
    sol.tribunals.forEach(function(trib) {
      var sched = (trib.schedule || []).find(function(s) { return s.dayId === dayId; });
      if (!sched) return;
      if (sched.primaryRoomId) {
        if (!occupation[sched.primaryRoomId]) occupation[sched.primaryRoomId] = [];
        occupation[sched.primaryRoomId].push({ tribunal: trib, type: 'primary' });
      }
      (sched.supportRooms || []).forEach(function(sr) {
        if (!occupation[sr.roomId]) occupation[sr.roomId] = [];
        occupation[sr.roomId].push({ tribunal: trib, type: 'support', purpose: sr.purpose });
      });
      (sched.slots || []).forEach(function(slot) {
        if (slot.roomId && slot.roomId !== sched.primaryRoomId) {
          if (!occupation[slot.roomId]) occupation[slot.roomId] = [];
          occupation[slot.roomId].push({ tribunal: trib, type: 'slot', slot: slot });
        }
      });
    });
    return occupation;
  },

  findFreeRooms: function(solutionId, dayId, startTime, endTime) {
    var allRooms = this.getAllRooms();
    var occupation = this.getRoomOccupation(solutionId, dayId);
    var self = this;
    return allRooms.filter(function(item) {
      var occ = occupation[item.room.id];
      if (!occ) return true;
      return !occ.some(function(o) {
        if (o.type === 'primary' || o.type === 'support') return true;
        if (o.type === 'slot' && self._timesOverlap(startTime, endTime, o.slot.startTime, o.slot.endTime)) return true;
        return false;
      });
    });
  },

  generateTimeSlots: function(startTime, endTime) {
    var slots = [];
    var start = this._timeToMin(startTime);
    var end = this._timeToMin(endTime);
    for (var m = start; m <= end; m += 30) {
      var h = Math.floor(m / 60); var mi = m % 60;
      slots.push((h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi);
    }
    return slots;
  },

  // --- Export/Import ---
  exportAll: function() {
    return JSON.stringify(this.data, null, 2);
  },

  exportSpaces: function() {
    var exportData = {
      version: this.VERSION,
      type: 'spaces',
      campuses: this.data.campuses,
      customFieldDefs: this.data.customFieldDefs,
      groups: this.data.groups
    };
    return JSON.stringify(exportData, null, 2);
  },

  exportTime: function() {
    var exportData = {
      version: this.VERSION,
      type: 'time',
      days: this.data.days || []
    };
    return JSON.stringify(exportData, null, 2);
  },

  exportSolution: function(solutionId) {
    var sol = this.getSolution(solutionId);
    if (!sol) return null;
    var exportData = {
      version: this.VERSION,
      type: 'solution',
      solution: sol,
      days: this.data.days,
      candidates: this.data.candidates,
      roleDefs: this.data.roleDefs
    };
    return JSON.stringify(exportData, null, 2);
  },

  importData: function(jsonStr, mode) {
    try {
      var imported = JSON.parse(jsonStr);
      if (!imported.version) {
        return { success: false, error: 'formatError' };
      }

      if (mode === 'replace') {
        if (imported.type === 'spaces') {
          this.data.campuses = imported.campuses || [];
          this.data.customFieldDefs = imported.customFieldDefs || [];
          this.data.groups = imported.groups || [];
        } else if (imported.type === 'time') {
          this.data.days = imported.days || [];
        } else if (imported.type === 'solution') {
          this.data.days = imported.days || this.data.days || [];
          this.data.candidates = imported.candidates || this.data.candidates || [];
          this.data.roleDefs = imported.roleDefs || this.data.roleDefs || [];
          var sol = imported.solution;
          sol.active = true;
          this.data.solutions = [sol];
        } else {
          this.data = imported;
          if (!this.data.days) this.data.days = [];
          if (!this.data.candidates) this.data.candidates = [];
          if (!this.data.roleDefs || this.data.roleDefs.length === 0) this.data.roleDefs = this.defaultData().roleDefs;
          if (!this.data.solutions) this.data.solutions = [];
          if (!this.data.activityTemplates) this.data.activityTemplates = this.defaultActivityTemplates();
          if (!this.data.customFieldDefs) this.data.customFieldDefs = [];
          if (!this.data.groups) this.data.groups = [];
          if (!this.data.settings) this.data.settings = { language: 'es', defaultMembersPerTribunal: 3 };
        }
      } else if (mode === 'merge') {
        if (imported.campuses) {
          imported.campuses.forEach(function(c) { Tribunator.Store.data.campuses.push(c); });
        }
        if (imported.customFieldDefs) {
          imported.customFieldDefs.forEach(function(f) {
            var exists = Tribunator.Store.data.customFieldDefs.find(function(ef) { return ef.name === f.name; });
            if (!exists) Tribunator.Store.data.customFieldDefs.push(f);
          });
        }
        if (imported.groups) {
          imported.groups.forEach(function(g) { Tribunator.Store.data.groups.push(g); });
        }
        if (imported.days) {
          imported.days.forEach(function(d) {
            var exists = (Tribunator.Store.data.days || []).find(function(ed) { return ed.date === d.date; });
            if (!exists) {
              if (!Tribunator.Store.data.days) Tribunator.Store.data.days = [];
              Tribunator.Store.data.days.push(d);
            }
          });
        }
        if (imported.candidates) {
          Tribunator.Store.importCandidates(imported.candidates);
        }
        if (imported.solutions) {
          imported.solutions.forEach(function(s) { s.active = false; Tribunator.Store.data.solutions.push(s); });
        }
        if (imported.solution) {
          imported.solution.active = false;
          if (!Tribunator.Store.data.solutions) Tribunator.Store.data.solutions = [];
          Tribunator.Store.data.solutions.push(imported.solution);
        }
        if (imported.roleDefs) {
          imported.roleDefs.forEach(function(r) {
            var name = typeof r === 'string' ? r : r.name;
            var exists = Tribunator.Store.data.roleDefs.find(function(er) { return (typeof er === 'string' ? er : er.name) === name; });
            if (!exists) Tribunator.Store.data.roleDefs.push(r);
          });
        }
        if (imported.activityTemplates) {
          if (!Tribunator.Store.data.activityTemplates) Tribunator.Store.data.activityTemplates = [];
          imported.activityTemplates.forEach(function(tmpl) {
            var exists = Tribunator.Store.data.activityTemplates.find(function(et) { return et.id === tmpl.id || et.label === tmpl.label; });
            if (!exists) Tribunator.Store.data.activityTemplates.push(tmpl);
          });
        }
      }

      this.save();
      return { success: true };
    } catch (e) {
      return { success: false, error: 'formatError' };
    }
  },

  hasData: function() {
    return this.data.campuses.length > 0 || (this.data.solutions || []).length > 0 || (this.data.days || []).length > 0;
  },

  clearAll: function() {
    this.data = this.defaultData();
    this.save();
  }
};

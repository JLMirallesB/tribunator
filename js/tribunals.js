window.Tribunator = window.Tribunator || {};

Tribunator.Tribunals = {
  currentSolutionId: null,
  currentTribunalId: null,
  activeTab: 'tribunals',
  tribunalTab: 'schedule',

  init: function() {
    var active = Tribunator.Store.getActiveSolution();
    if (active) this.currentSolutionId = active.id;
  },

  render: function() {
    var container = document.getElementById('phase-tribunals');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'flex';

    var sidebar = Tribunator.Utils.el('div', { className: 'sidebar', id: 'tribunals-sidebar' });
    var main = Tribunator.Utils.el('div', { className: 'main-area', id: 'tribunals-main' });
    container.appendChild(sidebar);
    container.appendChild(main);
    this.renderSidebar();
    this.renderMain();
  },

  renderSidebar: function() {
    var sidebar = document.getElementById('tribunals-sidebar');
    Tribunator.Utils.clearElement(sidebar);
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;

    // Solutions
    var solSection = el('div', { className: 'sidebar-section' });
    solSection.appendChild(el('div', { className: 'sidebar-header' }, [
      t('tribunals.solutions'),
      el('button', { className: 'btn-icon', textContent: '+', title: t('tribunals.addSolution'), onClick: function() { self.promptAddSolution(); } })
    ]));
    var solutions = store.getSolutions();
    if (solutions.length === 0) {
      solSection.appendChild(el('div', { className: 'sidebar-empty', textContent: t('tribunals.noSolutions') }));
    } else {
      solutions.forEach(function(sol) {
        var isActive = sol.id === self.currentSolutionId;
        solSection.appendChild(el('div', {
          className: 'sidebar-item' + (isActive ? ' active' : ''),
          onClick: function(e) { if (!e.target.closest('.sidebar-item-actions')) self.selectSolution(sol.id); }
        }, [
          el('span', { className: 'sidebar-item-name', textContent: sol.name + (sol.active ? ' ●' : '') }),
          el('div', { className: 'sidebar-item-actions' }, [
            !sol.active ? el('button', { className: 'btn-icon btn-sm', textContent: '✓', title: t('tribunals.setActive'), onClick: function() { store.setActiveSolution(sol.id); self.renderSidebar(); } }) : null,
            el('button', { className: 'btn-icon btn-sm', textContent: '✎', onClick: function() { self.promptEditSolution(sol.id); } }),
            el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { self.promptDeleteSolution(sol.id); } })
          ].filter(Boolean))
        ]));

        if (isActive) {
          // Publish text for this solution
          var ptInput = el('textarea', {
            className: 'form-textarea',
            value: sol.publishText || '',
            placeholder: t('tribunals.solutionPublishText'),
            style: { margin: '8px 16px', width: 'calc(100% - 32px)', minHeight: '50px', fontSize: '11px' },
            onChange: function() { store.updateSolution(sol.id, { publishText: ptInput.value }); }
          });
          ptInput.value = sol.publishText || '';
          solSection.appendChild(el('div', {}, [
            el('label', { className: 'form-label', style: { padding: '4px 16px 0', fontSize: '10px' }, textContent: t('tribunals.solutionPublishText') }),
            ptInput
          ]));

          var tribunals = store.getTribunals(sol.id);
          solSection.appendChild(Tribunator.Utils.collapsibleSection('tribunals_list',
            t('tribunals.tribunals') + ' (' + tribunals.length + ')',
            el('div', { style: { display: 'flex', gap: '2px' } }, [
              el('button', { className: 'btn-icon', style: { color: 'inherit', fontSize: '10px' }, textContent: 'A↓', title: t('tribunals.sortAlpha'), onClick: function(e) { e.stopPropagation(); store.sortTribunals(sol.id); self.renderSidebar(); } }),
              el('button', { className: 'btn-icon', style: { color: 'inherit' }, textContent: '+', onClick: function(e) { e.stopPropagation(); self.promptAddTribunal(); } })
            ]),
            function(body) {
              if (tribunals.length === 0) {
                body.appendChild(el('div', { className: 'sidebar-empty', textContent: t('tribunals.noTribunals') }));
              } else {
                var def = store.data.settings.defaultMembersPerTribunal;
                tribunals.forEach(function(trib) {
                  var mc = store.countTribunalMembers(sol.id, trib.id);
                  var tribWarnings = store.getTribunalWarnings(sol.id, trib.id);
                  var hasIssue = mc !== def || tribWarnings.length > 0 || (trib.schedule || []).length === 0;
                  var badge = hasIssue ? ' ⚠' : '';
                  (function(tribRef, solRef) {
                    var menuBtn = el('button', { className: 'btn-icon btn-sm sidebar-context-btn', textContent: '⋯', onClick: function(e) {
                      e.stopPropagation();
                      // Remove any existing context menu
                      var old = document.querySelector('.sidebar-context-menu');
                      if (old) old.remove();
                      var menu = el('div', { className: 'sidebar-context-menu' }, [
                        el('div', { className: 'sidebar-context-item', textContent: t('common.moveUp'), onClick: function() { store.moveTribunal(solRef.id, tribRef.id, 'up'); menu.remove(); self.renderSidebar(); } }),
                        el('div', { className: 'sidebar-context-item', textContent: t('common.moveDown'), onClick: function() { store.moveTribunal(solRef.id, tribRef.id, 'down'); menu.remove(); self.renderSidebar(); } }),
                        el('div', { className: 'sidebar-context-item', textContent: t('common.duplicate'), onClick: function() { var c = store.duplicateTribunal(solRef.id, tribRef.id); menu.remove(); if (c) { self.currentTribunalId = c.id; self.renderSidebar(); self.renderMain(); } } }),
                        el('div', { className: 'sidebar-context-item', textContent: t('common.edit'), onClick: function() { menu.remove(); self.promptEditTribunal(tribRef.id); } }),
                        el('div', { className: 'sidebar-context-item sidebar-context-danger', textContent: t('common.delete'), onClick: function() { menu.remove(); self.promptDeleteTribunal(tribRef.id); } })
                      ]);
                      document.body.appendChild(menu);
                      var rect = menuBtn.getBoundingClientRect();
                      var menuH = 160;
                      if (rect.bottom + menuH > window.innerHeight) {
                        menu.style.top = (rect.top - menuH) + 'px';
                      } else {
                        menu.style.top = rect.bottom + 'px';
                      }
                      menu.style.left = Math.min(rect.right - 140, window.innerWidth - 150) + 'px';
                      var close = function(ev) { if (!menu.contains(ev.target) && ev.target !== menuBtn) { menu.remove(); document.removeEventListener('click', close); } };
                      setTimeout(function() { document.addEventListener('click', close); }, 0);
                    }});
                    body.appendChild(el('div', {
                      className: 'sidebar-item' + (tribRef.id === self.currentTribunalId ? ' active' : ''),
                      onClick: function(e) { if (e.target.closest('.sidebar-context-btn') || e.target.closest('.sidebar-context-menu')) return; self.currentTribunalId = tribRef.id; self.activeTab = 'tribunals'; self.renderSidebar(); self.renderMain(); }
                    }, [
                      el('span', { className: 'sidebar-item-name', textContent: tribRef.name + badge }),
                      el('div', { className: 'sidebar-item-actions', style: { position: 'relative' } }, [menuBtn])
                    ]));
                  })(trib, sol);
                });
              }
            }
          ));
        }
      });
    }
    sidebar.appendChild(solSection);

    // Candidates
    var candSection = el('div', { className: 'sidebar-section' });
    candSection.appendChild(el('div', { className: 'sidebar-header' }, [
      t('tribunals.candidates') + ' (' + store.getCandidates().length + ')',
      el('button', { className: 'btn-icon', textContent: '+', onClick: function() { self.promptAddCandidate(); } })
    ]));
    candSection.appendChild(el('div', { style: { padding: '4px 16px 8px', display: 'flex', gap: '4px' } }, [
      el('button', { className: 'btn btn-sm', textContent: t('tribunals.uploadCandidates'), style: { flex: '1' }, onClick: function() { self.promptUploadCandidates(); } }),
      store.getCandidates().length > 0 ? el('button', { className: 'btn btn-sm', textContent: '→', title: t('tribunals.candidates'), onClick: function() { self.activeTab = 'candidates'; self.currentTribunalId = null; self.renderMain(); self.renderSidebar(); } }) : null
    ].filter(Boolean)));
    sidebar.appendChild(candSection);

    // Roles (collapsible)
    sidebar.appendChild(Tribunator.Utils.collapsibleSection('roles', t('tribunals.roles') + ' (' + store.getRoleDefs().length + ')',
      el('button', { className: 'btn-icon', style: { color: 'inherit' }, textContent: '+', onClick: function(e) { e.stopPropagation(); self.promptAddRole(); } }),
      function(body) {
        store.getRoleDefs().forEach(function(role) {
          var suffix = (role.counts ? '' : ' *') + (role.requireOne ? ' !' : '');
          var labelStyle = role.counts ? {} : { fontStyle: 'italic', color: 'var(--text-muted)' };
          body.appendChild(el('div', { className: 'sidebar-item' }, [
            el('span', { className: 'sidebar-item-name', style: labelStyle, textContent: role.name + suffix }),
            el('div', { className: 'sidebar-item-actions' }, [
              el('button', { className: 'btn-icon btn-sm', textContent: '✎', onClick: function() { self.promptEditRole(role.name); } }),
              el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { store.deleteRoleDef(role.name); self.renderSidebar(); } })
            ])
          ]));
        });
        // Default members inline
        body.appendChild(el('div', { style: { padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' } }, [
          document.createTextNode(t('tribunals.defaultMembers') + ':'),
          el('input', { className: 'form-input', type: 'number', min: '1', value: store.data.settings.defaultMembersPerTribunal, style: { width: '50px', padding: '2px 4px', fontSize: '11px' }, onChange: function(e) { store.data.settings.defaultMembersPerTribunal = parseInt(e.target.value) || 3; store.save(); self.renderSidebar(); } })
        ]));
      }
    ));

    // PDF export
    var pdfSection = el('div', { className: 'sidebar-section' });
    pdfSection.appendChild(el('div', { style: { padding: '8px 16px' } }, [
      el('button', { className: 'btn btn-sm btn-primary', textContent: t('tribunals.pdf'), style: { width: '100%' }, onClick: function() { Tribunator.PDF.showExportDialog(); } })
    ]));
    sidebar.appendChild(pdfSection);
  },

  renderMain: function() {
    var main = document.getElementById('tribunals-main');
    Tribunator.Utils.clearElement(main);

    if (this.activeTab === 'candidates') { this.renderCandidatesList(main); return; }
    if (!this.currentSolutionId) { this._emptyState(main, t('tribunals.noSolutions'), function() { Tribunator.Tribunals.promptAddSolution(); }); return; }
    if (!this.currentTribunalId) { this._emptyState(main, t('tribunals.noTribunals'), function() { Tribunator.Tribunals.promptAddTribunal(); }); return; }

    this.renderTribunalDetail(main);
  },

  _emptyState: function(container, msg, action) {
    container.appendChild(Tribunator.Utils.el('div', { className: 'empty-state' }, [
      Tribunator.Utils.el('div', { className: 'empty-state-icon', textContent: '⚖' }),
      Tribunator.Utils.el('div', { className: 'empty-state-text', textContent: msg }),
      action ? Tribunator.Utils.el('button', { className: 'btn btn-primary', textContent: t('common.create'), onClick: action }) : null
    ].filter(Boolean)));
  },

  // --- TRIBUNAL DETAIL WITH TABS ---
  renderTribunalDetail: function(main) {
    var self = this;
    var store = Tribunator.Store;
    var trib = store.getTribunal(this.currentSolutionId, this.currentTribunalId);
    if (!trib) return;
    var el = Tribunator.Utils.el;

    // Header
    main.appendChild(el('div', { className: 'main-area-header' }, [
      el('div', { className: 'main-area-title', textContent: trib.name })
    ]));

    // Publish notes
    var notesInput = el('textarea', {
      className: 'form-textarea',
      value: trib.publishNotes || '',
      placeholder: t('tribunals.publishNotes'),
      style: { minHeight: '40px', marginBottom: '12px', fontSize: '12px' },
      onChange: function() {
        store.updateTribunal(self.currentSolutionId, self.currentTribunalId, { publishNotes: notesInput.value });
      }
    });
    notesInput.value = trib.publishNotes || '';
    main.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label', textContent: t('tribunals.publishNotes') }),
      notesInput
    ]));

    // Tabs
    var tabs = el('div', { className: 'tabs' });
    ['schedule', 'members', 'variations'].forEach(function(tab) {
      var labels = { members: t('tribunals.members'), schedule: t('tribunals.schedule'), variations: t('tribunals.variations') };
      tabs.appendChild(el('button', {
        className: 'tab' + (self.tribunalTab === tab ? ' active' : ''),
        textContent: labels[tab] + (tab === 'members' ? ' (' + trib.members.length + ')' : tab === 'schedule' ? ' (' + (trib.schedule || []).length + ')' : tab === 'variations' ? ' (' + (trib.variations || []).length + ')' : ''),
        onClick: function() { self.tribunalTab = tab; self.renderMain(); }
      }));
    });
    main.appendChild(tabs);

    if (this.tribunalTab === 'members') this.renderMembersTab(main, trib);
    else if (this.tribunalTab === 'schedule') this.renderScheduleTab(main, trib);
    else if (this.tribunalTab === 'variations') this.renderVariationsTab(main, trib);
  },

  // --- MEMBERS TAB ---
  renderMembersTab: function(main, trib) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var def = store.data.settings.defaultMembersPerTribunal;
    var mc = store.countTribunalMembers(this.currentSolutionId, this.currentTribunalId);
    var totalMembers = trib.members.length;
    var extras = totalMembers - mc;

    if (mc !== def) {
      var warnMsg = mc < def ? t('tribunals.memberWarningLow') : t('tribunals.memberWarningHigh');
      main.appendChild(el('div', { className: 'warning-badge', style: { marginBottom: '8px', display: 'inline-flex' }, textContent: '⚠ ' + warnMsg + ' (' + mc + '/' + def + (extras > 0 ? ' +' + extras + ' ' + t('tribunals.nonCounting') : '') + ')' }));
    }

    var tribWarnings = store.getTribunalWarnings(this.currentSolutionId, this.currentTribunalId);
    tribWarnings.forEach(function(w) {
      if (w.type === 'missingRole') {
        main.appendChild(el('div', { className: 'warning-badge', style: { marginBottom: '8px', display: 'inline-flex', marginLeft: '8px' }, textContent: '⚠ ' + t('tribunals.missingRole') + ': ' + w.role }));
      }
    });

    main.appendChild(el('div', { style: { marginBottom: '12px' } }, [
      el('button', { className: 'btn btn-primary', textContent: t('tribunals.addMember'), onClick: function() { self.promptAddMember(); } })
    ]));

    if (trib.members.length === 0) return;

    var table = el('table', { className: 'room-list-table' });
    var thead = el('thead');
    var hr = el('tr');
    [t('tribunals.candidateSurnames'), t('tribunals.candidateName'), t('tribunals.candidateSpecialty'), t('tribunals.role'), ''].forEach(function(h) { hr.appendChild(el('th', { textContent: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    trib.members.forEach(function(member) {
      var c = store.getCandidate(member.candidateId);
      var isSub = store.isSubstitute(member.candidateId);
      var isMutated = c && c.useTitular;
      var rowStyle = isMutated ? { background: 'var(--warning-light)' } : isSub ? { background: '#eef6ff' } : {};
      var tr = el('tr', { style: rowStyle });
      var displayName = c ? (c.useTitular ? c.titularSurnames : c.surnames) : '—';
      var displayFirst = c ? (c.useTitular ? c.titularName : c.name) : '—';
      var nameStyle = { fontWeight: '500' };
      if (isSub) nameStyle.fontStyle = 'italic';
      tr.appendChild(el('td', { style: nameStyle, textContent: displayName }));
      tr.appendChild(el('td', { style: isSub ? { fontStyle: 'italic' } : {}, textContent: displayFirst }));
      tr.appendChild(el('td', { textContent: c ? c.specialty : '' }));
      var roleCell = el('td');
      var roleInput = el('input', { className: 'form-input', type: 'text', value: member.role || '', list: 'role-dl', style: { width: '140px', padding: '4px 6px', fontSize: '12px' }, onChange: function() { store.updateTribunalMember(self.currentSolutionId, self.currentTribunalId, member.id, { role: roleInput.value }); } });
      roleCell.appendChild(roleInput);
      tr.appendChild(roleCell);
      (function(mId) {
        tr.appendChild(el('td', {}, [
          el('button', { className: 'btn-icon btn-sm', textContent: '↑', title: t('common.moveUp'), onClick: function() { store.moveTribunalMember(self.currentSolutionId, self.currentTribunalId, mId, 'up'); self.renderMain(); } }),
          el('button', { className: 'btn-icon btn-sm', textContent: '↓', title: t('common.moveDown'), onClick: function() { store.moveTribunalMember(self.currentSolutionId, self.currentTribunalId, mId, 'down'); self.renderMain(); } }),
          el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { store.removeTribunalMember(self.currentSolutionId, self.currentTribunalId, mId); self.renderMain(); self.renderSidebar(); } })
        ]));
      })(member.id);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    main.appendChild(table);

    var dl = el('datalist', { id: 'role-dl' });
    store.getRoleDefs().forEach(function(r) { dl.appendChild(el('option', { value: r.name })); });
    main.appendChild(dl);
  },

  // --- SCHEDULE TAB ---
  renderScheduleTab: function(main, trib) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var days = store.getDays();

    if (days.length === 0) {
      main.appendChild(el('div', { className: 'empty-state', style: { padding: '32px' } }, [
        el('div', { className: 'empty-state-text', textContent: t('time.noDays') }),
        el('button', { className: 'btn btn-primary', textContent: t('time.addDay'), onClick: function() { Tribunator.App.setPhase('time'); } })
      ]));
      return;
    }

    var allRooms = store.getAllRooms();

    days.forEach(function(day) {
      var sched = store.getDaySchedule(self.currentSolutionId, self.currentTribunalId, day.id);
      var isConfigured = !!sched;
      var panel = el('div', { className: 'panel', style: { marginBottom: '16px' } });

      // Day header
      var dayActions = [];
      if (isConfigured && (sched.slots || []).length > 0) {
        (function(fromDayId) {
          var moveSel = el('select', { className: 'form-select', style: { fontSize: '10px', padding: '2px 4px', width: 'auto' }, onChange: function() {
            if (moveSel.value) { store.moveAllSlotsToDay(self.currentSolutionId, self.currentTribunalId, fromDayId, moveSel.value); self.renderMain(); }
          }});
          moveSel.appendChild(el('option', { value: '', textContent: t('tribunals.moveAllTo') }));
          days.forEach(function(d) { if (d.id !== fromDayId) moveSel.appendChild(el('option', { value: d.id, textContent: Tribunator.Time.formatDate(d.date) })); });
          dayActions.push(moveSel);
        })(day.id);
      }
      if (isConfigured) {
        dayActions.push(el('button', { className: 'btn btn-sm', style: { color: 'var(--danger)' }, textContent: t('tribunals.removeDay'), onClick: function() { store.removeDaySchedule(self.currentSolutionId, self.currentTribunalId, day.id); self.renderMain(); } }));
      }
      var dayHeader = el('div', { className: 'panel-header' }, [
        el('span', { textContent: Tribunator.Time.formatDate(day.date) + '  (' + day.startTime + ' – ' + day.endTime + ')' }),
        isConfigured
          ? el('div', { style: { display: 'flex', gap: '4px', alignItems: 'center' } }, dayActions)
          : el('button', { className: 'btn btn-sm btn-primary', textContent: t('tribunals.assignDay'), onClick: function() { store.setDaySchedule(self.currentSolutionId, self.currentTribunalId, day.id, {}); self.renderMain(); } })
      ]);
      panel.appendChild(dayHeader);

      if (!isConfigured) { main.appendChild(panel); return; }

      var body = el('div', { className: 'panel-body' });
      var hasSlots = (sched.slots || []).length > 0;

      // 1. Time slots (always first)
      body.appendChild(el('label', { className: 'form-label', textContent: t('tribunals.timeSlots'), style: { marginBottom: '4px', display: 'block' } }));
      var timeOptions = store.generateTimeSlots(day.startTime, day.endTime);

      if ((sched.slots || []).length > 0) {
        store.sortDaySlots(self.currentSolutionId, self.currentTribunalId, day.id);
        var slotTable = el('table', { className: 'room-list-table', style: { marginBottom: '8px' } });
        var stHead = el('thead');
        var stHr = el('tr');
        [t('time.startTime'), t('time.endTime'), t('space.room'), t('tribunals.slotActivity'), ''].forEach(function(h) { stHr.appendChild(el('th', { textContent: h })); });
        stHead.appendChild(stHr);
        slotTable.appendChild(stHead);

        var stBody = el('tbody');
        sched.slots.forEach(function(slot) {
          var tr = el('tr');
          // Start time select
          var startSel = el('select', { className: 'form-select', style: { padding: '2px 4px', fontSize: '12px' }, onChange: function() { store.updateTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slot.id, { startTime: startSel.value }); var curRoom = slot.roomId; if (curRoom) { var selfConf = store.checkSlotConflict(self.currentSolutionId, self.currentTribunalId, day.id, startSel.value, slot.endTime, curRoom, slot.id); if (selfConf) Tribunator.Utils.showToast(t('tribunals.selfConflict'), 'warning'); var roomConfs = store.getRoomConflicts(self.currentSolutionId, curRoom, day.id, startSel.value, slot.endTime, self.currentTribunalId); if (roomConfs.length > 0) Tribunator.Utils.showToast(t('verify.roomConflict') + ': ' + roomConfs.map(function(c) { return c.tribunal.name; }).join(', '), 'warning'); } } });
          timeOptions.forEach(function(to) { var o = el('option', { value: to, textContent: to }); if (to === slot.startTime) o.selected = true; startSel.appendChild(o); });
          tr.appendChild(el('td', {}, [startSel]));

          // End time select
          var endSel = el('select', { className: 'form-select', style: { padding: '2px 4px', fontSize: '12px' }, onChange: function() { store.updateTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slot.id, { endTime: endSel.value }); var curRoom = slot.roomId; if (curRoom) { var selfConf = store.checkSlotConflict(self.currentSolutionId, self.currentTribunalId, day.id, slot.startTime, endSel.value, curRoom, slot.id); if (selfConf) Tribunator.Utils.showToast(t('tribunals.selfConflict'), 'warning'); var roomConfs = store.getRoomConflicts(self.currentSolutionId, curRoom, day.id, slot.startTime, endSel.value, self.currentTribunalId); if (roomConfs.length > 0) Tribunator.Utils.showToast(t('verify.roomConflict') + ': ' + roomConfs.map(function(c) { return c.tribunal.name; }).join(', '), 'warning'); } } });
          timeOptions.forEach(function(to) { var o = el('option', { value: to, textContent: to }); if (to === slot.endTime) o.selected = true; endSel.appendChild(o); });
          tr.appendChild(el('td', {}, [endSel]));

          // Room select
          var missingRoom = !slot.roomId;
          var roomSel = el('select', { className: 'form-select', style: { padding: '2px 4px', fontSize: '12px', borderColor: missingRoom ? 'var(--danger)' : '' }, onChange: function() { var newRoom = roomSel.value || null; store.updateTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slot.id, { roomId: newRoom }); if (newRoom) { var selfConf = store.checkSlotConflict(self.currentSolutionId, self.currentTribunalId, day.id, slot.startTime, slot.endTime, newRoom, slot.id); if (selfConf) Tribunator.Utils.showToast(t('tribunals.selfConflict'), 'warning'); var roomConfs = store.getRoomConflicts(self.currentSolutionId, newRoom, day.id, slot.startTime, slot.endTime, self.currentTribunalId); if (roomConfs.length > 0) Tribunator.Utils.showToast(t('verify.roomConflict') + ': ' + roomConfs.map(function(c) { return c.tribunal.name; }).join(', '), 'warning'); } self.renderMain(); } });
          roomSel.appendChild(el('option', { value: '', textContent: '— ' + t('space.room') + ' —' }));
          allRooms.forEach(function(item) { var o = el('option', { value: item.room.id, textContent: item.room.name }); if (item.room.id === slot.roomId) o.selected = true; roomSel.appendChild(o); });
          tr.appendChild(el('td', {}, [roomSel]));

          // Activity
          var missingAct = !slot.activity || !slot.activity.trim();
          var actIn = el('input', { className: 'form-input', type: 'text', value: slot.activity || '', placeholder: t('tribunals.slotActivity') + ' *', style: { padding: '2px 4px', fontSize: '12px', flex: '1', borderColor: missingAct ? 'var(--danger)' : '' }, onChange: function() { store.updateTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slot.id, { activity: actIn.value }); if (actIn.value.trim()) { actIn.style.borderColor = ''; } else { actIn.style.borderColor = 'var(--danger)'; } } });
          (function(input, slotRef) {
            var pickBtn = el('button', { className: 'btn-icon btn-sm', textContent: '☰', title: t('tribunals.pickActivityHint'), onClick: function() {
              self.promptPickActivity(function(text) { input.value = text; store.updateTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slotRef.id, { activity: text }); input.style.borderColor = ''; });
            }});
            tr.appendChild(el('td', {}, [el('div', { style: { display: 'flex', gap: '2px', alignItems: 'center' } }, [input, pickBtn])]));
          })(actIn, slot);

          // Conflict check - show inside same row
          var conflictMsg = null;
          if (slot.roomId) {
            var conflicts = store.getRoomConflicts(self.currentSolutionId, slot.roomId, day.id, slot.startTime, slot.endTime, self.currentTribunalId, slot.activity);
            if (conflicts.length > 0) {
              var isNb = conflicts.every(function(c) { return c.nonBlocking; });
              conflictMsg = (isNb ? 'ℹ ' : '⚠ ') + conflicts.map(function(c) { return c.tribunal.name + (c.slot ? ' ' + c.slot.startTime + '–' + c.slot.endTime : ''); }).join(', ');
              tr.style.background = isNb ? 'var(--primary-light)' : 'var(--danger-light)';
            }
          }

          var lastCell = el('td');
          lastCell.appendChild(el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { store.removeTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, slot.id); self.renderMain(); } }));
          tr.appendChild(lastCell);
          stBody.appendChild(tr);

          if (conflictMsg) {
            var colCount = tr.children.length;
            var conflictTr = el('tr', { style: { background: tr.style.background || '' } });
            var conflictTd = el('td', { colSpan: String(colCount), style: { paddingTop: '0', paddingBottom: '4px', borderTop: 'none' } });
            var isNbMsg = conflictMsg.indexOf('ℹ') === 0;
            conflictTd.appendChild(el('div', { style: { fontSize: '10px', color: isNbMsg ? 'var(--primary)' : 'var(--danger)', paddingLeft: '4px' }, textContent: conflictMsg }));
            conflictTr.appendChild(conflictTd);
            stBody.appendChild(conflictTr);
          }
        });
        slotTable.appendChild(stBody);
        body.appendChild(slotTable);
      }

      body.appendChild(el('button', { className: 'btn btn-sm', textContent: '+ ' + t('tribunals.addSlot'), onClick: function() { self.promptAddSlot(day); } }));
      body.appendChild(el('button', { className: 'btn btn-sm', style: { marginLeft: '8px' }, textContent: t('tribunals.findFreeRooms'), onClick: function() { self.showFreeRooms(day); } }));

      panel.appendChild(body);
      main.appendChild(panel);
    });

    // Coverage summary
    var coverage = store.checkActivityCoverage(self.currentSolutionId, self.currentTribunalId);
    if (coverage.length > 0) {
      var covDiv = el('div', { style: { marginTop: '16px', padding: '10px', background: 'var(--warning-light)', borderRadius: 'var(--radius)', fontSize: '12px' } });
      covDiv.appendChild(el('div', { style: { fontWeight: '600', marginBottom: '4px' }, textContent: '⚠ ' + t('verify.missingPart') }));
      coverage.forEach(function(c) {
        covDiv.appendChild(el('div', { textContent: c.template + ': ' + c.missingPart }));
      });
      main.appendChild(covDiv);
    }
  },

  // --- VARIATIONS TAB ---
  renderVariationsTab: function(main, trib) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    if (!trib.variations) trib.variations = [];

    main.appendChild(el('div', { style: { marginBottom: '12px' } }, [
      el('button', { className: 'btn btn-primary', textContent: t('tribunals.addVariation'), onClick: function() { self.promptAddVariation(); } })
    ]));

    if (trib.variations.length === 0) {
      main.appendChild(el('div', { style: { color: 'var(--text-muted)', fontSize: '13px' }, textContent: t('tribunals.noVariations') }));
      return;
    }

    trib.variations.forEach(function(variation) {
      var panel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      panel.appendChild(el('div', { className: 'panel-header' }, [
        el('span', { textContent: variation.name + ' (' + variation.members.length + ' ' + t('tribunals.memberCount') + ')' }),
        el('div', { style: { display: 'flex', gap: '4px' } }, [
          el('button', { className: 'btn btn-sm', textContent: t('tribunals.addMember'), onClick: function() { self.promptAddVariationMember(variation.id); } }),
          el('button', { className: 'btn-icon btn-sm', textContent: '✎', onClick: function() { self.promptEditVariation(variation.id); } }),
          el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { Tribunator.Utils.showConfirm(t('common.confirm'), function() { store.deleteVariation(self.currentSolutionId, self.currentTribunalId, variation.id); self.renderMain(); }); } })
        ])
      ]));

      if (variation.members.length > 0) {
        var body = el('div', { className: 'panel-body' });
        variation.members.forEach(function(m) {
          var c = store.getCandidate(m.candidateId);
          var roleIn = el('input', { className: 'form-input', type: 'text', value: m.role || '', list: 'var-role-dl-' + variation.id, placeholder: t('tribunals.role'), style: { width: '120px', padding: '3px 6px', fontSize: '11px' }, onChange: function() { store.updateVariationMember(self.currentSolutionId, self.currentTribunalId, variation.id, m.id, { role: roleIn.value }); } });
          (function(mId, vId) {
          body.appendChild(el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' } }, [
            el('span', { style: { flex: '1' }, textContent: (c ? c.surnames + ', ' + c.name : '—') }),
            roleIn,
            el('button', { className: 'btn-icon btn-sm', textContent: '↑', onClick: function() { store.moveVariationMember(self.currentSolutionId, self.currentTribunalId, vId, mId, 'up'); self.renderMain(); } }),
            el('button', { className: 'btn-icon btn-sm', textContent: '↓', onClick: function() { store.moveVariationMember(self.currentSolutionId, self.currentTribunalId, vId, mId, 'down'); self.renderMain(); } }),
            el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function() { store.removeVariationMember(self.currentSolutionId, self.currentTribunalId, vId, mId); self.renderMain(); } })
          ]));
          })(m.id, variation.id);
        });
        var dlId = 'var-role-dl-' + variation.id;
        var dl = el('datalist', { id: dlId });
        store.getRoleDefs().forEach(function(r) { dl.appendChild(el('option', { value: r.name })); });
        body.appendChild(dl);
        panel.appendChild(body);
      }
      main.appendChild(panel);
    });
  },

  // --- CANDIDATES LIST ---
  renderCandidatesList: function(main) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;

    main.appendChild(el('div', { className: 'main-area-header' }, [
      el('div', { className: 'main-area-title', textContent: t('tribunals.candidates') }),
      el('div', { className: 'main-area-actions' }, [
        el('button', { className: 'btn btn-primary', textContent: t('tribunals.addCandidate'), onClick: function() { self.promptAddCandidate(); } }),
        el('button', { className: 'btn', textContent: t('tribunals.uploadCandidates'), onClick: function() { self.promptUploadCandidates(); } }),
        el('button', { className: 'btn', textContent: t('common.back'), onClick: function() { self.activeTab = 'tribunals'; self.renderMain(); self.renderSidebar(); } })
      ])
    ]));

    var candidates = store.getCandidates();
    if (candidates.length === 0) { main.appendChild(el('div', { className: 'empty-state', textContent: t('tribunals.noCandidates') })); return; }

    var searchInput = el('input', { className: 'search-input', type: 'text', placeholder: t('common.search') + '...', style: { marginBottom: '16px' } });
    main.appendChild(searchInput);
    var tableC = el('div');
    main.appendChild(tableC);

    var render = function(filter) {
      Tribunator.Utils.clearElement(tableC);
      var filtered = !filter ? candidates : candidates.filter(function(c) { return (c.name + ' ' + c.surnames + ' ' + c.specialty).toLowerCase().indexOf(filter.toLowerCase()) !== -1; });
      var table = el('table', { className: 'room-list-table' });
      var thead = el('thead');
      var hr = el('tr');
      [t('tribunals.candidateSurnames'), t('tribunals.candidateName'), t('tribunals.candidateSpecialty'), t('tribunals.titular'), t('common.actions')].forEach(function(h) { hr.appendChild(el('th', { textContent: h })); });
      thead.appendChild(hr);
      table.appendChild(thead);
      var tbody = el('tbody');
      filtered.forEach(function(c) {
        var isSub = store.isSubstitute(c.id);
        var tr = el('tr', isSub ? { style: { background: c.useTitular ? 'var(--warning-light)' : '' } } : {});
        tr.appendChild(el('td', { style: { fontWeight: '500' }, textContent: c.useTitular ? c.titularSurnames : c.surnames }));
        tr.appendChild(el('td', { textContent: c.useTitular ? c.titularName : c.name }));
        tr.appendChild(el('td', { textContent: c.specialty }));
        // Titular column
        var titCell = el('td');
        if (isSub) {
          if (c.useTitular) {
            titCell.appendChild(el('span', { style: { fontSize: '11px' }, textContent: t('tribunals.showingTitular') }));
            titCell.appendChild(el('button', { className: 'btn btn-sm', style: { marginLeft: '4px', fontSize: '11px' }, textContent: t('tribunals.revertToSub'), onClick: function() { store.toggleTitular(c.id); render(filter); } }));
          } else {
            titCell.appendChild(el('span', { style: { fontSize: '11px', color: 'var(--text-muted)' }, textContent: c.titularSurnames + ', ' + c.titularName }));
            titCell.appendChild(el('button', { className: 'btn btn-sm', style: { marginLeft: '4px', fontSize: '11px' }, textContent: t('tribunals.mutateToTitular'), onClick: function() { store.toggleTitular(c.id); render(filter); } }));
          }
        } else {
          titCell.appendChild(el('span', { style: { fontSize: '11px', color: 'var(--text-muted)' }, textContent: '—' }));
        }
        tr.appendChild(titCell);
        tr.appendChild(el('td', {}, [
          el('button', { className: 'btn btn-sm', textContent: t('common.edit'), style: { marginRight: '4px' }, onClick: function() { self.promptEditCandidate(c.id); } }),
          el('button', { className: 'btn btn-sm', textContent: t('common.delete'), onClick: function() {
            var refs = store.getCandidateReferences(c.id);
            var msg = t('tribunals.confirmDeleteCandidate');
            if (refs.length > 0) msg += '\n\n⚠ ' + t('verify.candidateHasRefs') + ':\n' + refs.map(function(r) { return r.tribunal; }).join(', ');
            Tribunator.Utils.showConfirm(msg, function() { store.deleteCandidate(c.id); self.renderMain(); self.renderSidebar(); });
          } })
        ]));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableC.appendChild(table);
    };
    searchInput.addEventListener('input', Tribunator.Utils.debounce(function() { render(searchInput.value); }, 200));
    render('');
  },

  // --- ACTIVITY PICKER ---
  promptPickActivity: function(onSelect) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var allTemplates = store.getEnabledTemplates();

    // Find tribunal's template based on name
    var trib = store.getTribunal(this.currentSolutionId, this.currentTribunalId);
    var tribunalTemplate = trib ? store.findTemplateForTribunal(trib.name) : null;
    var tribunalSpecialty = null;
    if (trib) {
      self._specialties.forEach(function(s) { if (trib.name.indexOf(s) !== -1) tribunalSpecialty = s; });
    }
    if (tribunalTemplate && tribunalSpecialty) {
      tribunalTemplate = store.filterTemplateForSpecialty(tribunalTemplate, tribunalSpecialty);
    }

    var contentArea = el('div', { style: { maxHeight: '350px', overflowY: 'auto' } });
    var resultLabel = el('div', { style: { padding: '8px 0', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }, textContent: '— ' + t('tribunals.pickActivityHint') + ' —' });
    var warningLabel = el('div', { style: { fontSize: '11px', color: 'var(--warning)', display: 'none' } });
    var currentPath = [];
    var currentText = '';
    var isFromTribunalTemplate = true;

    var renderLevel = function(nodes, parentLabel) {
      Tribunator.Utils.clearElement(contentArea);
      if (parentLabel) {
        contentArea.appendChild(el('button', { className: 'btn btn-sm', style: { marginBottom: '8px' }, textContent: '← ' + t('common.back'), onClick: function() {
          currentPath.pop();
          if (currentPath.length === 0) renderRoot();
          else {
            var source = isFromTribunalTemplate && tribunalTemplate ? [tribunalTemplate] : allTemplates;
            var node = source.find(function(t) { return t.label === currentPath[0]; });
            for (var i = 1; i < currentPath.length && node; i++) {
              node = (node.children || []).find(function(c) { return c.label === currentPath[i]; });
            }
            if (node && node.children) renderLevel(node.children, currentPath[currentPath.length - 1]);
            else renderRoot();
          }
        }}));
      }
      nodes.forEach(function(node) {
        var hasChildren = node.children && node.children.length > 0;
        var itemEl = el('div', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px' },
          onClick: function() {
            currentPath.push(node.label);
            currentText = currentPath.join(' — ');
            resultLabel.textContent = currentText;
            resultLabel.style.color = 'var(--primary)';
            warningLabel.style.display = isFromTribunalTemplate ? 'none' : 'block';
            warningLabel.textContent = isFromTribunalTemplate ? '' : '⚠ ' + t('templates.notFromTemplate');
            if (hasChildren) renderLevel(node.children, node.label);
          }
        }, [
          el('span', { textContent: node.label }),
          hasChildren ? el('span', { style: { color: 'var(--text-muted)', fontSize: '11px' }, textContent: '▸' }) : null
        ].filter(Boolean));
        contentArea.appendChild(itemEl);
      });
    };

    var renderRoot = function() {
      currentPath = [];
      currentText = '';
      resultLabel.textContent = '— ' + t('tribunals.pickActivityHint') + ' —';
      resultLabel.style.color = 'var(--text-muted)';
      warningLabel.style.display = 'none';
      Tribunator.Utils.clearElement(contentArea);

      // General activities (outside templates)
      var generalActivities = ['Constitución del Tribunal', 'Llamamiento de Aspirantes'];
      contentArea.appendChild(el('div', { style: { fontSize: '10px', color: 'var(--text-muted)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }, textContent: t('tribunals.generalActivities') }));
      generalActivities.forEach(function(act) {
        contentArea.appendChild(el('div', {
          style: { display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px' },
          onClick: function() {
            currentPath = [act];
            currentText = act;
            resultLabel.textContent = currentText;
            resultLabel.style.color = 'var(--primary)';
            isFromTribunalTemplate = true;
            warningLabel.style.display = 'none';
          }
        }, [el('span', { textContent: act })]));
      });
      contentArea.appendChild(el('div', { style: { height: '8px' } }));

      // Show tribunal template first if available
      if (tribunalTemplate) {
        contentArea.appendChild(el('div', { style: { fontSize: '11px', color: 'var(--success)', fontWeight: '600', padding: '4px 12px', background: 'var(--success-light)', marginBottom: '4px', borderRadius: '4px' } }, [
          document.createTextNode(t('templates.appliesTo') + ': ' + tribunalTemplate.label + (tribunalSpecialty ? ' — ' + tribunalSpecialty : ''))
        ]));
        var tmplNode = { label: tribunalTemplate.label, children: tribunalTemplate.children };
        var tmplEl = el('div', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '2px solid var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: 'var(--primary-light)' },
          onClick: function() {
            isFromTribunalTemplate = true;
            currentPath.push(tmplNode.label);
            currentText = tmplNode.label;
            resultLabel.textContent = currentText;
            resultLabel.style.color = 'var(--primary)';
            if (tmplNode.children) renderLevel(tmplNode.children, tmplNode.label);
          }
        }, [
          el('span', { textContent: tribunalTemplate.label }),
          el('span', { style: { color: 'var(--primary)', fontSize: '11px' }, textContent: '▸' })
        ]);
        contentArea.appendChild(tmplEl);
        contentArea.appendChild(el('div', { style: { height: '8px' } }));
      }

      // Show all other enabled templates
      var otherTemplates = allTemplates.filter(function(t) { return !tribunalTemplate || t.id !== tribunalTemplate.id; });
      if (otherTemplates.length > 0) {
        if (tribunalTemplate) {
          contentArea.appendChild(el('div', { style: { fontSize: '10px', color: 'var(--text-muted)', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }, textContent: t('templates.title') }));
        }
        otherTemplates.forEach(function(tmpl) {
          contentArea.appendChild(el('div', {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', opacity: '0.7' },
            onClick: function() {
              isFromTribunalTemplate = false;
              currentPath.push(tmpl.label);
              currentText = tmpl.label;
              resultLabel.textContent = currentText;
              resultLabel.style.color = 'var(--primary)';
              warningLabel.textContent = '⚠ ' + t('templates.notFromTemplate');
              warningLabel.style.display = 'block';
              if (tmpl.children) renderLevel(tmpl.children, tmpl.label);
            }
          }, [
            el('span', { textContent: tmpl.label }),
            el('span', { style: { color: 'var(--text-muted)', fontSize: '11px' }, textContent: '▸' })
          ]));
        });
      }
    };

    renderRoot();

    var pickerOverlay = Tribunator.Utils.showModal({
      title: t('tribunals.slotActivity'),
      body: el('div', {}, [contentArea, resultLabel, warningLabel]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.confirm'), className: 'btn-primary', close: false, action: function() {
          if (!currentText) { resultLabel.textContent = '⚠ ' + t('tribunals.pickActivityHint'); resultLabel.style.color = 'var(--danger)'; return; }
          onSelect(currentText);
          pickerOverlay.remove();
        }}
      ]
    });
  },

  // --- SCHEDULE PROMPTS ---
  promptAddSupportRoom: function(dayId) {
    var self = this;
    var store = Tribunator.Store;
    var allRooms = store.getAllRooms();
    var el = Tribunator.Utils.el;
    var roomSel = el('select', { className: 'form-select' });
    roomSel.appendChild(el('option', { value: '', textContent: '—' }));
    allRooms.forEach(function(item) { roomSel.appendChild(el('option', { value: item.room.id, textContent: item.room.name + ' (' + item.campus.name + ')' })); });
    var purposeInput = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.supportPurpose') });

    Tribunator.Utils.showModal({
      title: t('tribunals.addSupportRoom'),
      body: el('div', {}, [
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('space.room') }), roomSel]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.supportPurpose') }), purposeInput])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.add'), className: 'btn-primary', action: function() { if (roomSel.value) { store.addSupportRoom(self.currentSolutionId, self.currentTribunalId, dayId, roomSel.value, purposeInput.value); self.renderMain(); } } }
      ]
    });
  },

  promptPickRoom: function(onSelect, dayId, startTime, endTime) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var campuses = store.getCampuses();

    var selectedRoomId = null;
    var selectedLabel = el('div', { style: { padding: '8px 0', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }, textContent: '— ' + t('tribunals.pickRoomHint') + ' —' });
    var selectedDesc = el('div', { style: { fontSize: '12px', color: 'var(--text-secondary)', padding: '0 0 4px', display: 'none' } });

    var updateSelectedInfo = function(roomId) {
      var found = store.getRoom(roomId);
      if (found) {
        selectedLabel.textContent = found.room.name + ' (' + found.campus.name + ' / ' + found.floor.name + ')';
        selectedLabel.style.color = 'var(--primary)';
        if (found.room.notes && found.room.notes.trim()) {
          selectedDesc.textContent = found.room.notes;
          selectedDesc.style.display = 'block';
        } else {
          selectedDesc.style.display = 'none';
        }
      }
    };

    // Tab: plan vs list
    var mode = 'plan';
    var contentArea = el('div', { style: { minHeight: '250px' } });

    var currentCampusId = campuses.length > 0 ? campuses[0].id : null;
    var currentFloorId = null;
    if (currentCampusId) {
      var c = store.getCampus(currentCampusId);
      if (c && c.floors.length > 0) currentFloorId = c.floors[0].id;
    }

    // Occupation data
    var occupation = {};
    if (dayId && startTime && endTime) {
      var activeSol = store.getActiveSolution();
      if (activeSol) {
        var allTribs = activeSol.tribunals || [];
        allTribs.forEach(function(trib) {
          if (trib.id === self.currentTribunalId) return;
          var sched = (trib.schedule || []).find(function(s) { return s.dayId === dayId; });
          if (!sched || !sched.slots) return;
          sched.slots.forEach(function(slot) {
            if (slot.roomId && store._timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
              if (!occupation[slot.roomId]) occupation[slot.roomId] = [];
              occupation[slot.roomId].push(trib.name);
            }
          });
        });
      }
    }

    var renderContent = function() {
      Tribunator.Utils.clearElement(contentArea);
      if (mode === 'list') {
        renderList();
      } else {
        renderPlan();
      }
    };

    var renderList = function() {
      var allRooms = store.getAllRooms();
      var list = el('div', { style: { maxHeight: '300px', overflowY: 'auto' } });
      allRooms.forEach(function(item) {
        var isOccupied = occupation[item.room.id];
        var roomEl = el('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', opacity: isOccupied ? '0.5' : '1', background: selectedRoomId === item.room.id ? 'var(--primary-light)' : '' },
          onClick: function() {
            selectedRoomId = item.room.id;
            updateSelectedInfo(item.room.id);
            renderContent();
          }
        }, [
          el('span', { className: 'room-color-dot', style: { backgroundColor: item.room.color } }),
          el('span', { textContent: item.room.name }),
          el('span', { style: { color: 'var(--text-muted)', fontSize: '11px' }, textContent: item.campus.name + ' / ' + item.floor.name }),
          isOccupied ? el('span', { className: 'warning-badge', style: { marginLeft: 'auto' }, textContent: '⚠ ' + isOccupied.join(', ') }) : null
        ].filter(Boolean));
        list.appendChild(roomEl);
      });
      contentArea.appendChild(list);
    };

    var renderPlan = function() {
      var campus = store.getCampus(currentCampusId);
      var floor = campus ? store.getFloor(currentCampusId, currentFloorId) : null;
      if (!campus || !floor) { contentArea.appendChild(el('div', { textContent: t('space.noCampuses') })); return; }

      // Campus/floor selectors
      var nav = el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } });
      var campusSel = el('select', { className: 'form-select', style: { fontSize: '12px' }, onChange: function() {
        currentCampusId = campusSel.value;
        var c2 = store.getCampus(currentCampusId);
        currentFloorId = c2 && c2.floors.length > 0 ? c2.floors[0].id : null;
        renderContent();
      }});
      campuses.forEach(function(c) { var o = el('option', { value: c.id, textContent: c.name }); if (c.id === currentCampusId) o.selected = true; campusSel.appendChild(o); });
      nav.appendChild(campusSel);

      var floorSel = el('select', { className: 'form-select', style: { fontSize: '12px' }, onChange: function() { currentFloorId = floorSel.value; renderContent(); } });
      campus.floors.forEach(function(f) { var o = el('option', { value: f.id, textContent: f.name }); if (f.id === currentFloorId) o.selected = true; floorSel.appendChild(o); });
      nav.appendChild(floorSel);
      contentArea.appendChild(nav);

      // Grid
      var cellSize = 24;
      var cellLookup = {};
      floor.rooms.forEach(function(room) { room.cells.forEach(function(cell) { cellLookup[cell.col + ',' + cell.row] = room; }); });

      var gridWrap = el('div', { style: { overflow: 'auto', maxHeight: '250px' } });
      var grid = el('div', { style: { display: 'inline-grid', gridTemplateColumns: 'repeat(' + floor.gridCols + ', ' + cellSize + 'px)', gap: '1px', background: 'var(--border)', padding: '1px' } });

      for (var row = 0; row < floor.gridRows; row++) {
        for (var col = 0; col < floor.gridCols; col++) {
          var room = cellLookup[col + ',' + row];
          var isOccupied = room && occupation[room.id];
          var isSelected = room && room.id === selectedRoomId;

          var cellEl = el('div', { style: { width: cellSize + 'px', height: cellSize + 'px', background: room ? room.color : 'var(--bg)', position: 'relative', cursor: room ? 'pointer' : 'default', opacity: isOccupied ? '0.4' : '1', outline: isSelected ? '2px solid var(--primary)' : 'none', outlineOffset: '-2px' } });

          if (room) {
            // Room borders
            var rid = room.id;
            var topN = cellLookup[col + ',' + (row - 1)];
            var botN = cellLookup[col + ',' + (row + 1)];
            var lefN = cellLookup[(col - 1) + ',' + row];
            var rigN = cellLookup[(col + 1) + ',' + row];
            var bc = 'rgba(0,0,0,0.4)';
            if (!topN || topN.id !== rid) cellEl.style.borderTop = '1px solid ' + bc;
            if (!botN || botN.id !== rid) cellEl.style.borderBottom = '1px solid ' + bc;
            if (!lefN || lefN.id !== rid) cellEl.style.borderLeft = '1px solid ' + bc;
            if (!rigN || rigN.id !== rid) cellEl.style.borderRight = '1px solid ' + bc;

            if (room.cells[0].col === col && room.cells[0].row === row) {
              cellEl.appendChild(el('span', { style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: '600', color: 'white', textShadow: '0 1px 1px rgba(0,0,0,0.3)', pointerEvents: 'none', overflow: 'hidden' }, textContent: room.name }));
            }

            (function(r) {
              cellEl.addEventListener('click', function() {
                selectedRoomId = r.id;
                var found = store.getRoom(r.id);
                updateSelectedInfo(r.id);
                if (isOccupied) selectedLabel.style.color = 'var(--danger)';
                renderContent();
              });
            })(room);
          }
          grid.appendChild(cellEl);
        }
      }
      gridWrap.appendChild(grid);
      contentArea.appendChild(gridWrap);
    };

    // Mode toggle
    var modeToggle = el('div', { className: 'btn-group', style: { marginBottom: '8px' } });
    modeToggle.appendChild(el('button', { className: 'btn btn-sm active', id: 'pick-plan-btn', textContent: t('space.viewPlan'), onClick: function() { mode = 'plan'; document.getElementById('pick-plan-btn').classList.add('active'); document.getElementById('pick-list-btn').classList.remove('active'); renderContent(); } }));
    modeToggle.appendChild(el('button', { className: 'btn btn-sm', id: 'pick-list-btn', textContent: t('space.viewList'), onClick: function() { mode = 'list'; document.getElementById('pick-list-btn').classList.add('active'); document.getElementById('pick-plan-btn').classList.remove('active'); renderContent(); } }));

    var modalBody = el('div', {}, [modeToggle, contentArea, selectedLabel, selectedDesc]);

    var pickerOverlay = Tribunator.Utils.showModal({
      title: t('space.room'),
      body: modalBody,
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.confirm'), className: 'btn-primary', close: false, action: function() {
          if (!selectedRoomId) { selectedLabel.textContent = '⚠ ' + t('tribunals.pickRoomHint'); selectedLabel.style.color = 'var(--danger)'; return; }
          onSelect(selectedRoomId);
          pickerOverlay.remove();
        }}
      ]
    });
    renderContent();
  },

  promptAddSlot: function(day) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var timeOptions = store.generateTimeSlots(day.startTime, day.endTime);

    var startSel = el('select', { className: 'form-select' });
    var endSel = el('select', { className: 'form-select' });
    timeOptions.forEach(function(to) {
      startSel.appendChild(el('option', { value: to, textContent: to }));
      endSel.appendChild(el('option', { value: to, textContent: to }));
    });
    if (timeOptions.length > 1) endSel.value = timeOptions[1];

    var selectedRoomId = null;
    var roomLabel = el('div', { style: { padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', background: 'var(--bg)' }, textContent: '— ' + t('tribunals.pickRoomHint') + ' —' });
    roomLabel.addEventListener('click', function() {
      self.promptPickRoom(function(roomId) {
        selectedRoomId = roomId;
        var found = store.getRoom(roomId);
        roomLabel.textContent = found ? found.room.name + ' (' + found.campus.name + ' / ' + found.floor.name + ')' : roomId;
        roomLabel.style.color = 'var(--primary)';
        roomLabel.style.borderColor = 'var(--primary)';
      }, day.id, startSel.value, endSel.value);
    });

    var actInput = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.slotActivity'), style: { flex: '1' } });
    var actPickBtn = el('button', { className: 'btn btn-sm', textContent: '☰', title: t('tribunals.pickActivityHint'), style: { flexShrink: '0' }, onClick: function() {
      self.promptPickActivity(function(text) { actInput.value = text; });
    }});
    var actRow = el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [actInput, actPickBtn]);
    var errorMsg = el('div', { style: { color: 'var(--danger)', fontSize: '12px', marginTop: '8px', display: 'none' } });
    var memberWarnings = el('div', { id: 'slot-member-warnings', style: { marginTop: '8px' } });

    var checkMemberConflicts = function() {
      Tribunator.Utils.clearElement(memberWarnings);
      var trib = store.getTribunal(self.currentSolutionId, self.currentTribunalId);
      if (!trib) return;
      var st = startSel.value, en = endSel.value;
      trib.members.forEach(function(m) {
        var conflicts = store.getMemberConflicts(self.currentSolutionId, m.candidateId, day.id, self.currentTribunalId);
        if (conflicts.length > 0) {
          var c = store.getCandidate(m.candidateId);
          var cName = c ? c.surnames + ', ' + c.name : '?';
          var tribNames = conflicts.map(function(cf) { return cf.tribunal.name; }).join(', ');
          memberWarnings.appendChild(el('div', { className: 'warning-badge', style: { marginBottom: '4px', fontSize: '11px' }, textContent: '⚠ ' + cName + ' — ' + t('verify.memberConflict') + ': ' + tribNames }));
        }
      });
    };
    startSel.addEventListener('change', checkMemberConflicts);
    endSel.addEventListener('change', checkMemberConflicts);
    checkMemberConflicts();

    var slotOverlay = Tribunator.Utils.showModal({
      title: t('tribunals.addSlot'),
      body: el('div', {}, [
        el('div', { className: 'form-inline' }, [
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('time.startTime') + ' *' }), startSel]),
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('time.endTime') + ' *' }), endSel])
        ]),
        memberWarnings,
        el('div', { className: 'form-group', style: { marginTop: '12px' } }, [el('label', { className: 'form-label', textContent: t('space.room') + ' *' }), roomLabel]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.slotActivity') + ' *' }), actRow]),
        errorMsg
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.add'), className: 'btn-primary', close: false,
          action: function() {
            if (!selectedRoomId || !actInput.value.trim()) {
              errorMsg.textContent = t('tribunals.slotIncomplete');
              errorMsg.style.display = 'block';
              return;
            }
            var result = store.addTimeSlot(self.currentSolutionId, self.currentTribunalId, day.id, { startTime: startSel.value, endTime: endSel.value, roomId: selectedRoomId, activity: actInput.value.trim() });
            if (result && result.error === 'selfConflict') {
              errorMsg.textContent = t('tribunals.selfConflict') + ' (' + result.slot.startTime + '–' + result.slot.endTime + ')';
              errorMsg.style.display = 'block';
              return;
            }
            self.renderMain();
            slotOverlay.remove();
          }
        }
      ]
    });
  },

  showFreeRooms: function(day) {
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var freeRooms = store.findFreeRooms(this.currentSolutionId, day.id, day.startTime, day.endTime);
    var body = el('div');
    if (freeRooms.length === 0) {
      body.appendChild(el('p', { textContent: t('tribunals.noFreeRooms') }));
    } else {
      var list = el('div', { style: { maxHeight: '300px', overflowY: 'auto' } });
      freeRooms.forEach(function(item) {
        list.appendChild(el('div', { style: { padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' } }, [
          el('span', { className: 'room-color-dot', style: { backgroundColor: item.room.color } }),
          document.createTextNode(item.room.name + ' (' + item.campus.name + ' / ' + item.floor.name + ')')
        ]));
      });
      body.appendChild(list);
    }
    Tribunator.Utils.showModal({ title: t('tribunals.findFreeRooms') + ' — ' + Tribunator.Time.formatDate(day.date), body: body, buttons: [{ text: t('common.close'), className: 'btn-secondary' }] });
  },

  // --- VARIATION PROMPTS ---
  promptAddVariation: function() {
    var self = this;
    var el = Tribunator.Utils.el;
    var input = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.variationName') });
    Tribunator.Utils.showModal({
      title: t('tribunals.addVariation'),
      body: el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('common.name') }), input]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.create'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { Tribunator.Store.addVariation(self.currentSolutionId, self.currentTribunalId, n); self.renderMain(); } } }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptEditVariation: function(variationId) {
    var self = this;
    var el = Tribunator.Utils.el;
    var trib = Tribunator.Store.getTribunal(this.currentSolutionId, this.currentTribunalId);
    var v = trib.variations.find(function(x) { return x.id === variationId; });
    if (!v) return;
    var input = el('input', { className: 'form-input', type: 'text', value: v.name });
    Tribunator.Utils.showModal({
      title: t('common.edit'),
      body: el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('common.name') }), input]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.save'), className: 'btn-primary', action: function() { Tribunator.Store.updateVariation(self.currentSolutionId, self.currentTribunalId, variationId, { name: input.value.trim() }); self.renderMain(); } }
      ]
    });
  },

  promptAddVariationMember: function(variationId) {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var candidates = store.getCandidates();
    if (candidates.length === 0) { Tribunator.Utils.showToast(t('tribunals.noCandidates'), 'warning'); return; }

    // Detect busy candidates
    var trib = store.getTribunal(self.currentSolutionId, self.currentTribunalId);
    var tribSchedule = trib ? (trib.schedule || []) : [];
    var busyCandidates = {};
    if (tribSchedule.length > 0) {
      candidates.forEach(function(c) {
        var busyIn = [];
        tribSchedule.forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            var conflicts = store.getMemberConflicts(self.currentSolutionId, c.id, sched.dayId, self.currentTribunalId, slot.startTime, slot.endTime);
            if (conflicts.length > 0) { conflicts.forEach(function(cf) { if (busyIn.indexOf(cf.tribunal.name) === -1) busyIn.push(cf.tribunal.name); }); }
          });
        });
        if (busyIn.length > 0) busyCandidates[c.id] = busyIn;
      });
    }

    var sel = el('select', { className: 'form-select' });
    sel.appendChild(el('option', { value: '', textContent: '—' }));
    candidates.forEach(function(c) {
      var label = c.surnames + ', ' + c.name;
      var busy = busyCandidates[c.id];
      if (busy) label += ' ⚠ ' + busy.join(', ');
      var opt = el('option', { value: c.id, textContent: label });
      if (busy) opt.style.color = '#999';
      sel.appendChild(opt);
    });
    var roleInput = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.role'), list: 'var-role-dl' });
    var dl = el('datalist', { id: 'var-role-dl' });
    store.getRoleDefs().forEach(function(r) { dl.appendChild(el('option', { value: r.name })); });

    Tribunator.Utils.showModal({
      title: t('tribunals.addMember'),
      body: el('div', {}, [el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidate') }), sel]), el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.role') }), roleInput, dl])]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.add'), className: 'btn-primary', action: function() { if (sel.value) { store.addVariationMember(self.currentSolutionId, self.currentTribunalId, variationId, sel.value, roleInput.value); self.renderMain(); } } }
      ]
    });
  },

  // --- COMMON PROMPTS ---
  promptAddSolution: function() {
    var self = this;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.solutionName') });
    Tribunator.Utils.showModal({
      title: t('tribunals.addSolution'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }), input]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.create'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { var sol = Tribunator.Store.addSolution(n); self.selectSolution(sol.id); } } }]
    });
    setTimeout(function() { input.focus(); }, 100);
  },
  promptEditSolution: function(id) {
    var self = this;
    var sol = Tribunator.Store.getSolution(id); if (!sol) return;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', value: sol.name });
    Tribunator.Utils.showModal({
      title: t('tribunals.editSolution'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }), input]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.save'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { Tribunator.Store.updateSolution(id, { name: n }); self.renderSidebar(); } } }]
    });
    setTimeout(function() { input.focus(); }, 100);
  },
  promptDeleteSolution: function(id) {
    var self = this;
    Tribunator.Utils.showConfirm(t('tribunals.confirmDeleteSolution'), function() {
      Tribunator.Store.deleteSolution(id);
      if (self.currentSolutionId === id) { var a = Tribunator.Store.getActiveSolution(); self.currentSolutionId = a ? a.id : null; self.currentTribunalId = null; }
      self.render();
    });
  },
  selectSolution: function(id) { this.currentSolutionId = id; this.currentTribunalId = null; this.activeTab = 'tribunals'; this.renderSidebar(); this.renderMain(); },
  _specialties: [
    'Acordeón','Arpa','Bajo eléctrico','Canto','Canto valenciano','Clarinete','Clavecín',
    'Contrabajo','Coro','Dulzaina','Fagot','Flauta','Flauta de pico','Guitarra',
    'Guitarra eléctrica','Inst. cuerda pulsada Ren./Barroco','Instrumentos de plectro',
    'Oboe','Órgano','Percusión','Piano','Saxofón','Trombón','Trompa','Trompeta',
    'Tuba','Viola','Viola da gamba','Violín','Violonchelo'
  ],
  _levels: ['1 EEM','2 EEM','3 EEM','4 EEM','1 EPM','2 EPM','3 EPM','4 EPM','5 EPM','6 EPM'],

  promptAddTribunal: function() {
    if (!this.currentSolutionId) return;
    var self = this;
    var el = Tribunator.Utils.el;

    var specSelect = el('select', { className: 'form-select' });
    specSelect.appendChild(el('option', { value: '', textContent: '— ' + t('tribunals.specialty') + ' —' }));
    this._specialties.forEach(function(s) { specSelect.appendChild(el('option', { value: s, textContent: s })); });

    var levelSelect = el('select', { className: 'form-select' });
    levelSelect.appendChild(el('option', { value: '', textContent: '— ' + t('tribunals.level') + ' —' }));
    this._levels.forEach(function(l) { levelSelect.appendChild(el('option', { value: l, textContent: l })); });

    var input = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.tribunalName') });

    var updateName = function() {
      var parts = [];
      if (specSelect.value) parts.push(specSelect.value);
      if (levelSelect.value) parts.push(levelSelect.value);
      if (parts.length > 0) input.value = parts.join(' — ');
    };
    specSelect.addEventListener('change', updateName);
    levelSelect.addEventListener('change', updateName);

    Tribunator.Utils.showModal({
      title: t('tribunals.addTribunal'),
      body: el('div', {}, [
        el('div', { className: 'form-inline', style: { marginBottom: '12px' } }, [
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.specialty') }), specSelect]),
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.level') }), levelSelect])
        ]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('common.name') }), input])
      ]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.create'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { var tr = Tribunator.Store.addTribunal(self.currentSolutionId, n); self.currentTribunalId = tr.id; self.tribunalTab = 'schedule'; self.renderSidebar(); self.renderMain(); } } }]
    });
    setTimeout(function() { specSelect.focus(); }, 100);
  },
  promptEditTribunal: function(id) {
    var self = this;
    var trib = Tribunator.Store.getTribunal(this.currentSolutionId, id); if (!trib) return;
    var input = Tribunator.Utils.el('input', { className: 'form-input', type: 'text', value: trib.name });
    Tribunator.Utils.showModal({
      title: t('tribunals.editTribunal'),
      body: Tribunator.Utils.el('div', { className: 'form-group' }, [Tribunator.Utils.el('label', { className: 'form-label', textContent: t('common.name') }), input]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.save'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { Tribunator.Store.updateTribunal(self.currentSolutionId, id, { name: n }); self.renderSidebar(); self.renderMain(); } } }]
    });
    setTimeout(function() { input.focus(); }, 100);
  },
  promptDeleteTribunal: function(id) {
    var self = this;
    Tribunator.Utils.showConfirm(t('tribunals.confirmDeleteTribunal'), function() {
      Tribunator.Store.deleteTribunal(self.currentSolutionId, id);
      if (self.currentTribunalId === id) self.currentTribunalId = null;
      self.renderSidebar(); self.renderMain();
    });
  },
  promptAddMember: function() {
    var self = this; var store = Tribunator.Store; var candidates = store.getCandidates();
    if (candidates.length === 0) { Tribunator.Utils.showToast(t('tribunals.noCandidates'), 'warning'); return; }
    var el = Tribunator.Utils.el;

    // Specialty filter
    var specialties = {};
    candidates.forEach(function(c) { if (c.specialty) specialties[c.specialty] = true; });
    var specFilter = el('select', { className: 'filter-select', style: { marginBottom: '8px' } });
    specFilter.appendChild(el('option', { value: '', textContent: t('common.all') + ' ' + t('tribunals.candidateSpecialty').toLowerCase() }));
    Object.keys(specialties).sort().forEach(function(s) { specFilter.appendChild(el('option', { value: s, textContent: s })); });

    // Candidate select
    var sel = el('select', { className: 'form-select' });

    // Detect busy candidates based on tribunal's schedule
    var trib = store.getTribunal(self.currentSolutionId, self.currentTribunalId);
    var tribSchedule = trib ? (trib.schedule || []) : [];
    var busyCandidates = {};
    if (tribSchedule.length > 0) {
      candidates.forEach(function(c) {
        var busyIn = [];
        tribSchedule.forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            var conflicts = store.getMemberConflicts(self.currentSolutionId, c.id, sched.dayId, self.currentTribunalId, slot.startTime, slot.endTime);
            if (conflicts.length > 0) {
              conflicts.forEach(function(cf) { if (busyIn.indexOf(cf.tribunal.name) === -1) busyIn.push(cf.tribunal.name); });
            }
          });
        });
        if (busyIn.length > 0) busyCandidates[c.id] = busyIn;
      });
    }

    var rebuildCandidates = function() {
      var prev = sel.value;
      while (sel.firstChild) sel.removeChild(sel.firstChild);
      sel.appendChild(el('option', { value: '', textContent: '— ' + t('tribunals.selectCandidate') + ' —' }));
      var filter = specFilter.value;
      candidates.forEach(function(c) {
        if (filter && c.specialty !== filter) return;
        var label = c.surnames + ', ' + c.name + (c.specialty ? ' (' + c.specialty + ')' : '');
        var busy = busyCandidates[c.id];
        if (busy) label += ' ⚠ ' + busy.join(', ');
        var opt = el('option', { value: c.id, textContent: label });
        if (busy) opt.style.color = '#999';
        sel.appendChild(opt);
      });
      if (prev) sel.value = prev;
    };
    specFilter.addEventListener('change', rebuildCandidates);
    rebuildCandidates();

    var roleInput = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.role'), list: 'add-role-dl' });
    var dl = el('datalist', { id: 'add-role-dl' });
    store.getRoleDefs().forEach(function(r) { dl.appendChild(el('option', { value: r.name })); });

    var conflictInfo = el('div', { style: { marginTop: '8px' } });
    var trib = store.getTribunal(self.currentSolutionId, self.currentTribunalId);
    var tribSchedule = trib ? (trib.schedule || []) : [];

    sel.addEventListener('change', function() {
      Tribunator.Utils.clearElement(conflictInfo);
      if (!sel.value || tribSchedule.length === 0) return;
      tribSchedule.forEach(function(sched) {
        var conflicts = store.getMemberConflicts(self.currentSolutionId, sel.value, sched.dayId, self.currentTribunalId);
        if (conflicts.length > 0) {
          var day = store.getDay(sched.dayId);
          var dayLabel = day ? Tribunator.Time.formatDate(day.date) : sched.dayId;
          var tribNames = conflicts.map(function(cf) { return cf.tribunal.name; }).join(', ');
          conflictInfo.appendChild(el('div', { className: 'warning-badge', style: { marginBottom: '4px', fontSize: '11px' }, textContent: '⚠ ' + dayLabel + ': ' + t('verify.memberConflict') + ' (' + tribNames + ')' }));
        }
      });
    });

    Tribunator.Utils.showModal({
      title: t('tribunals.addMember'),
      body: el('div', {}, [
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateSpecialty') }), specFilter]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidate') }), sel]),
        conflictInfo,
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.role') }), roleInput, dl])
      ]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.add'), className: 'btn-primary', action: function() { if (sel.value) { store.addTribunalMember(self.currentSolutionId, self.currentTribunalId, sel.value, roleInput.value); if (roleInput.value && !store.getRoleDefByName(roleInput.value)) store.addRoleDef(roleInput.value); self.renderMain(); self.renderSidebar(); } } }]
    });
  },
  promptAddCandidate: function() {
    var self = this; var el = Tribunator.Utils.el;
    var surnIn = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.candidateSurnames') });
    var nameIn = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.candidateName') });
    var specIn = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.candidateSpecialty') });
    var titSurnIn = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.titularSurnames') });
    var titNameIn = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.titularName') });
    Tribunator.Utils.showModal({
      title: t('tribunals.addCandidate'),
      body: el('div', {}, [
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateSurnames') }), surnIn]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateName') }), nameIn]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateSpecialty') }), specIn]),
        el('div', { style: { borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px' } }, [
          el('label', { className: 'form-label', style: { color: 'var(--text-muted)', marginBottom: '8px' }, textContent: t('tribunals.titularSection') }),
          el('div', { className: 'form-inline' }, [
            el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.titularSurnames') }), titSurnIn]),
            el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.titularName') }), titNameIn])
          ])
        ])
      ]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.create'), className: 'btn-primary', action: function() {
        if (nameIn.value.trim() || surnIn.value.trim()) {
          Tribunator.Store.addCandidate({ name: nameIn.value.trim(), surnames: surnIn.value.trim(), specialty: specIn.value.trim(), titularName: titNameIn.value.trim(), titularSurnames: titSurnIn.value.trim() });
          self.renderSidebar(); if (self.activeTab === 'candidates') self.renderMain();
        }
      } }]
    });
    setTimeout(function() { surnIn.focus(); }, 100);
  },
  promptEditCandidate: function(id) {
    var self = this; var c = Tribunator.Store.getCandidate(id); if (!c) return; var el = Tribunator.Utils.el;
    var surnIn = el('input', { className: 'form-input', type: 'text', value: c.surnames });
    var nameIn = el('input', { className: 'form-input', type: 'text', value: c.name });
    var specIn = el('input', { className: 'form-input', type: 'text', value: c.specialty });
    var titSurnIn = el('input', { className: 'form-input', type: 'text', value: c.titularSurnames || '' });
    var titNameIn = el('input', { className: 'form-input', type: 'text', value: c.titularName || '' });
    Tribunator.Utils.showModal({
      title: t('tribunals.editCandidate'),
      body: el('div', {}, [
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateSurnames') }), surnIn]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateName') }), nameIn]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.candidateSpecialty') }), specIn]),
        el('div', { style: { borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px' } }, [
          el('label', { className: 'form-label', style: { color: 'var(--text-muted)', marginBottom: '8px' }, textContent: t('tribunals.titularSection') }),
          el('div', { className: 'form-inline' }, [
            el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.titularSurnames') }), titSurnIn]),
            el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.titularName') }), titNameIn])
          ])
        ])
      ]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.save'), className: 'btn-primary', action: function() { Tribunator.Store.updateCandidate(id, { name: nameIn.value.trim(), surnames: surnIn.value.trim(), specialty: specIn.value.trim(), titularName: titNameIn.value.trim(), titularSurnames: titSurnIn.value.trim() }); self.renderMain(); self.renderSidebar(); } }]
    });
  },
  downloadTemplate: function() {
    var csv = 'Apellidos;Nombre;Especialidad;Apellidos Titular;Nombre Titular\n';
    Tribunator.Utils.downloadFile(csv, 'tribunator-plantilla-candidatos.csv', 'text/csv');
  },

  promptUploadCandidates: function() {
    var self = this; var el = Tribunator.Utils.el;
    var fileInput = el('input', { type: 'file', accept: '.xlsx,.xls,.csv', className: 'form-input' });
    Tribunator.Utils.showModal({
      title: t('tribunals.uploadCandidates'),
      body: el('div', {}, [
        el('p', { style: { marginBottom: '8px', fontSize: '13px' }, textContent: t('tribunals.excelFormat') }),
        el('p', { style: { marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)' }, textContent: t('tribunals.excelHint') }),
        el('div', { className: 'form-group' }, [fileInput]),
        el('button', { className: 'btn btn-sm', style: { marginTop: '8px' }, textContent: t('tribunals.downloadTemplate'), onClick: function() { self.downloadTemplate(); } })
      ]),
      buttons: [{ text: t('common.cancel'), className: 'btn-secondary' }, { text: t('common.import'), className: 'btn-primary', action: function() { if (fileInput.files[0]) self.processExcelFile(fileInput.files[0]); }, close: true }]
    });
  },
  processExcelFile: function(file) {
    var self = this;
    var parseLine = function(cols) {
      return {
        surnames: (cols[0]||'').trim(),
        name: (cols[1]||'').trim(),
        specialty: (cols[2]||'').trim(),
        titularSurnames: (cols[3]||'').trim(),
        titularName: (cols[4]||'').trim()
      };
    };
    if (file.name.endsWith('.csv')) {
      Tribunator.Utils.readFile(file, function(err, content) {
        if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
        var lines = content.split('\n'); var cands = [];
        for (var i = 1; i < lines.length; i++) { var cols = lines[i].split(/[,;\t]/); if (cols[0] && cols[0].trim()) cands.push(parseLine(cols)); }
        var added = Tribunator.Store.importCandidates(cands);
        Tribunator.Utils.showToast(added + ' ' + t('tribunals.candidatesImported'));
        self.renderSidebar(); if (self.activeTab === 'candidates') self.renderMain();
      });
    } else {
      if (typeof XLSX === 'undefined') { Tribunator.Utils.showToast('XLSX library not loaded. Use CSV or connect to internet.', 'error'); return; }
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var wb = XLSX.read(e.target.result, { type: 'array' }); var data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }); var cands = [];
          for (var i = 1; i < data.length; i++) { var r = data[i]; if (r && r[0]) cands.push(parseLine(r.map(function(x) { return String(x||''); }))); }
          var added = Tribunator.Store.importCandidates(cands);
          Tribunator.Utils.showToast(added + ' ' + t('tribunals.candidatesImported'));
          self.renderSidebar(); if (self.activeTab === 'candidates') self.renderMain();
        } catch (ex) { Tribunator.Utils.showToast(t('export.formatError'), 'error'); }
      };
      reader.readAsArrayBuffer(file);
    }
  },
  _roleFormBody: function(input, countsCheck, requireCheck) {
    var el = Tribunator.Utils.el;
    return el('div', {}, [
      el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.role') }), input]),
      el('div', { className: 'form-group' }, [
        el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' } }, [
          countsCheck, document.createTextNode(t('tribunals.roleCounts'))
        ])
      ]),
      el('div', { className: 'form-group' }, [
        el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' } }, [
          requireCheck, document.createTextNode(t('tribunals.roleRequireOne'))
        ])
      ])
    ]);
  },

  promptAddRole: function() {
    var self = this;
    var el = Tribunator.Utils.el;
    var input = el('input', { className: 'form-input', type: 'text', placeholder: t('tribunals.role') });
    var countsCheck = el('input', { type: 'checkbox' }); countsCheck.checked = true;
    var requireCheck = el('input', { type: 'checkbox' }); requireCheck.checked = false;
    Tribunator.Utils.showModal({
      title: t('tribunals.addRole'),
      body: self._roleFormBody(input, countsCheck, requireCheck),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.create'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { Tribunator.Store.addRoleDef(n, countsCheck.checked, requireCheck.checked); self.renderSidebar(); } } }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  },

  promptEditRole: function(roleName) {
    var self = this;
    var el = Tribunator.Utils.el;
    var store = Tribunator.Store;
    var role = store.getRoleDefByName(roleName);
    if (!role) return;
    var input = el('input', { className: 'form-input', type: 'text', value: role.name });
    var countsCheck = el('input', { type: 'checkbox' }); countsCheck.checked = role.counts;
    var requireCheck = el('input', { type: 'checkbox' }); requireCheck.checked = !!role.requireOne;
    Tribunator.Utils.showModal({
      title: t('common.edit') + ': ' + role.name,
      body: self._roleFormBody(input, countsCheck, requireCheck),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.save'), className: 'btn-primary', action: function() { var n = input.value.trim(); if (n) { store.updateRoleDef(roleName, n, countsCheck.checked, requireCheck.checked); self.renderSidebar(); self.renderMain(); } } }
      ]
    });
    setTimeout(function() { input.focus(); }, 100);
  }
};

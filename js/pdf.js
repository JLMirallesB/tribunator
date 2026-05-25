window.Tribunator = window.Tribunator || {};

Tribunator.PDF = {
  MARGIN: 15,
  PAGE_W: 210,
  CONTENT_W: 180,
  PRIMARY: [37, 99, 235],
  DARK: [26, 26, 26],
  GRAY: [100, 100, 100],
  LIGHT_BG: [247, 247, 248],
  WHITE: [255, 255, 255],
  TABLE_HEAD: [37, 99, 235],
  TABLE_ALT: [245, 245, 250],

  _initDoc: function() {
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
      Tribunator.Utils.showToast('jsPDF library not loaded. Ensure internet connection.', 'error');
      return null;
    }
    var jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    return new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  },

  _state: function(doc) {
    var m = this.MARGIN;
    return {
      y: m,
      check: function(needed) { if (this.y + needed > 280) { doc.addPage(); this.y = m; } }
    };
  },

  _addHeader: function(doc, options, state) {
    var m = this.MARGIN, w = this.CONTENT_W;
    var headerH = 28;
    var hasLogo = !!options.logo;
    var hasText = !!options.headerText;

    if (hasLogo || hasText) {
      // Dark header band
      doc.setFillColor.apply(doc, this.DARK);
      doc.rect(0, 0, this.PAGE_W, headerH + 10, 'F');

      var textX = m;
      if (hasLogo) {
        try {
          doc.addImage(options.logo, 'PNG', m, 5, 22, 22);
          textX = m + 28;
        } catch (e) {}
      }

      if (hasText) {
        doc.setTextColor.apply(doc, this.WHITE);
        doc.setFontSize(18); doc.setFont(undefined, 'bold');
        doc.text(options.headerText, textX, 16);
        if (options.subHeaderText) {
          doc.setFontSize(10); doc.setFont(undefined, 'normal');
          doc.text(options.subHeaderText, textX, 23);
        }
      }
      doc.setTextColor(0);
      state.y = headerH + 14;
    }

    if (options.customText) {
      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      doc.setTextColor.apply(doc, this.GRAY);
      var lines = doc.splitTextToSize(options.customText, w);
      state.check(lines.length * 5 + 6);
      doc.text(lines, m, state.y);
      state.y += lines.length * 5 + 4;
      doc.setTextColor(0);
    }
  },

  _addFooter: function(doc, solName) {
    var pageCount = doc.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.setTextColor(170);
      doc.text(solName || 'Tribunator', this.MARGIN, 290);
      doc.text(new Date().toLocaleDateString(), this.PAGE_W / 2, 290, { align: 'center' });
      doc.text(i + ' / ' + pageCount, this.PAGE_W - this.MARGIN, 290, { align: 'right' });
      doc.setTextColor(0);
    }
  },

  _tribunalHeader: function(doc, name, state) {
    state.check(18);
    // Color accent line
    doc.setFillColor.apply(doc, this.PRIMARY);
    doc.rect(this.MARGIN, state.y, this.CONTENT_W, 0.8, 'F');
    state.y += 4;
    // Tribunal name
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.setTextColor.apply(doc, this.DARK);
    doc.text(name, this.MARGIN, state.y + 5);
    state.y += 10;
    doc.setTextColor(0);
  },

  _sectionLabel: function(doc, label, state) {
    state.check(10);
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.setTextColor.apply(doc, this.PRIMARY);
    doc.text(label, this.MARGIN, state.y + 4);
    state.y += 7;
    doc.setTextColor(0);
  },

  _membersTable: function(doc, members, store, state, selectedRoles, showTitular) {
    var filtered = members.filter(function(m) {
      if (selectedRoles && m.role && selectedRoles.indexOf(m.role) === -1) return false;
      return true;
    });
    if (filtered.length === 0) return;

    var self = this;
    var rows = filtered.map(function(m) {
      var c = store.getCandidate(m.candidateId);
      var surnames = c ? (c.useTitular && c.titularSurnames ? c.titularSurnames : c.surnames) : '—';
      var name = c ? (c.useTitular && c.titularName ? c.titularName : c.name) : '';
      var role = m.role || '';
      var specialty = c ? (c.specialty || '') : '';
      var note = '';
      if (c && store.isSubstitute(c.id) && !c.useTitular && showTitular) {
        note = '(titular: ' + c.titularSurnames + ', ' + c.titularName + ')';
      }
      return [surnames, name, role, specialty, note];
    });

    var hasTitularNotes = rows.some(function(r) { return r[4] !== ''; });
    var head = [[t('tribunals.candidateSurnames'), t('tribunals.candidateName'), t('tribunals.role'), t('tribunals.candidateSpecialty')]];
    if (hasTitularNotes) head[0].push(t('tribunals.titular'));
    var body = rows.map(function(r) { return hasTitularNotes ? r : r.slice(0, 4); });

    doc.autoTable({
      startY: state.y,
      margin: { left: self.MARGIN, right: self.MARGIN },
      head: head,
      body: body,
      styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.2 },
      headStyles: { fillColor: self.TABLE_HEAD, textColor: self.WHITE, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: self.TABLE_ALT },
      columnStyles: hasTitularNotes ? { 4: { fontStyle: 'italic', textColor: self.GRAY, fontSize: 7 } } : {},
      didParseCell: function(data) {
        if (data.section === 'body') {
          var m = filtered[data.row.index];
          if (m) {
            var roleDef = store.getRoleDefByName(m.role);
            if (roleDef && !roleDef.counts) {
              data.cell.styles.textColor = self.GRAY;
              data.cell.styles.fontStyle = 'italic';
            }
          }
        }
      }
    });

    state.y = doc.lastAutoTable.finalY + 4;
  },

  _variationsBlock: function(doc, variations, store, state, selectedRoles, showTitular) {
    if (!variations || variations.length === 0) return;
    var self = this;

    variations.forEach(function(v) {
      state.check(15);
      // Indented label with left border
      doc.setFillColor(230, 230, 230);
      doc.rect(self.MARGIN + 2, state.y, 1, 6, 'F');
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.setTextColor.apply(doc, self.GRAY);
      doc.text(t('tribunals.variations') + ': ' + v.name, self.MARGIN + 6, state.y + 4);
      state.y += 7;
      doc.setTextColor(0);

      self._membersTable(doc, v.members, store, state, selectedRoles, showTitular);
    });
  },

  _scheduleTable: function(doc, schedule, store, state) {
    var self = this;
    schedule.forEach(function(sched) {
      var day = store.getDay(sched.dayId);
      if (!day) return;
      var slots = sched.slots || [];
      if (slots.length === 0) return;

      state.check(15);
      // Day header with background
      doc.setFillColor.apply(doc, self.LIGHT_BG);
      doc.rect(self.MARGIN, state.y, self.CONTENT_W, 7, 'F');
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.setTextColor.apply(doc, self.DARK);
      doc.text(Tribunator.Time.formatDate(day.date), self.MARGIN + 3, state.y + 5);
      state.y += 9;
      doc.setTextColor(0);

      var rows = slots.map(function(slot) {
        var slotRoom = slot.roomId ? store.getRoom(slot.roomId) : null;
        return [
          slot.startTime + ' – ' + slot.endTime,
          slotRoom ? slotRoom.room.name : '—',
          slot.activity || ''
        ];
      });

      doc.autoTable({
        startY: state.y,
        margin: { left: self.MARGIN + 2, right: self.MARGIN },
        head: [[t('time.timeSlot'), t('space.room'), t('tribunals.slotActivity')]],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.2 },
        headStyles: { fillColor: [80, 80, 80], textColor: self.WHITE, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [250, 250, 252] },
        columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 30 } }
      });

      state.y = doc.lastAutoTable.finalY + 4;
    });
  },

  // === GENERATE ===
  generateFull: function(options) {
    var doc = this._initDoc();
    if (!doc) return;
    var store = Tribunator.Store;
    var state = this._state(doc);

    this._addHeader(doc, options, state);

    var sol = store.getSolution(options.solutionId);
    if (!sol) return;
    var tribunals = options.tribunalIds ? sol.tribunals.filter(function(tr) { return options.tribunalIds.indexOf(tr.id) !== -1; }) : sol.tribunals;
    var self = this;

    tribunals.forEach(function(trib, idx) {
      if (idx > 0) state.check(20);

      self._tribunalHeader(doc, trib.name, state);

      // Members
      if (trib.members.length > 0) {
        self._sectionLabel(doc, t('tribunals.members'), state);
        self._membersTable(doc, trib.members, store, state, options.selectedRoles, options.showTitular);
      }

      // Variations
      self._variationsBlock(doc, trib.variations, store, state, options.selectedRoles, options.showTitular);

      // Schedule
      if (!options.membersOnly) {
        var schedule = trib.schedule || [];
        if (schedule.length > 0) {
          self._sectionLabel(doc, t('tribunals.schedule'), state);
          self._scheduleTable(doc, schedule, store, state);
        }
      }

      state.y += 4;
    });

    this._addFooter(doc, sol.name);
    var suffix = options.membersOnly ? 'miembros' : 'completo';
    doc.save('tribunator-' + suffix + '-' + (sol.name || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
    Tribunator.Utils.showToast(t('common.success'));
  },

  generateMembersOnly: function(options) {
    options.membersOnly = true;
    this.generateFull(options);
  },

  // === DIALOG ===
  showExportDialog: function() {
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var activeSol = store.getActiveSolution();
    if (!activeSol) { Tribunator.Utils.showToast(t('tribunals.noSolutions'), 'warning'); return; }

    var headerInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.headerText') });
    var subHeaderInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.subHeaderText') });
    var customTextInput = el('textarea', { className: 'form-textarea', placeholder: t('pdf.customText') });
    var logoInput = el('input', { type: 'file', accept: 'image/*', className: 'form-input' });

    // Role checkboxes
    var roleDefs = store.getRoleDefs();
    var selectedRoles = roleDefs.filter(function(r) { return r.requireOne || r.counts; }).map(function(r) { return r.name; });
    var roleList = el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' } });
    roleDefs.forEach(function(role) {
      var isDefault = role.requireOne || role.counts;
      var lbl = el('label', { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' } });
      var cb = el('input', { type: 'checkbox' });
      cb.checked = isDefault;
      cb.addEventListener('change', function() {
        if (cb.checked) { if (selectedRoles.indexOf(role.name) === -1) selectedRoles.push(role.name); }
        else { selectedRoles = selectedRoles.filter(function(r) { return r !== role.name; }); }
      });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(role.name));
      roleList.appendChild(lbl);
    });

    // Show titular option
    var showTitularCb = el('input', { type: 'checkbox' });
    showTitularCb.checked = true;

    // Tribunal checkboxes
    var selectedIds = activeSol.tribunals.map(function(tr) { return tr.id; });
    var tribunalList = el('div', { style: { maxHeight: '150px', overflowY: 'auto', marginTop: '4px' } });
    activeSol.tribunals.forEach(function(trib) {
      var label = el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', cursor: 'pointer', fontSize: '13px' } });
      var cb = el('input', { type: 'checkbox' });
      cb.checked = true;
      cb.addEventListener('change', function() {
        if (cb.checked) { selectedIds.push(trib.id); } else { selectedIds = selectedIds.filter(function(id) { return id !== trib.id; }); }
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(trib.name));
      tribunalList.appendChild(label);
    });

    var buildOpts = function(callback) {
      var opts = {
        solutionId: activeSol.id,
        tribunalIds: selectedIds,
        selectedRoles: selectedRoles.slice(),
        showTitular: showTitularCb.checked,
        headerText: headerInput.value,
        subHeaderText: subHeaderInput.value,
        customText: customTextInput.value
      };
      var logoFile = logoInput.files[0];
      if (logoFile) {
        var reader = new FileReader();
        reader.onload = function(e) { opts.logo = e.target.result; callback(opts); };
        reader.readAsDataURL(logoFile);
      } else {
        callback(opts);
      }
    };

    Tribunator.Utils.showModal({
      title: t('tribunals.pdf'),
      body: el('div', {}, [
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.headerText') }), headerInput]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.subHeaderText') }), subHeaderInput]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.customText') }), customTextInput]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.logo') }), logoInput]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.roles') }), roleList]),
        el('div', { className: 'form-group' }, [
          el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [
            showTitularCb, document.createTextNode(t('pdf.showTitular'))
          ])
        ]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.tribunals') }), tribunalList])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('pdf.membersOnly'), className: 'btn-primary', action: function() { buildOpts(function(opts) { Tribunator.PDF.generateMembersOnly(opts); }); } },
        { text: t('pdf.full'), className: 'btn-primary', action: function() { buildOpts(function(opts) { Tribunator.PDF.generateFull(opts); }); } }
      ]
    });
  }
};

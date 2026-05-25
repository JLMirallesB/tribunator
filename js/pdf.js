window.Tribunator = window.Tribunator || {};

Tribunator.PDF = {
  _initDoc: function() {
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
      Tribunator.Utils.showToast('jsPDF library not loaded. Ensure internet connection.', 'error');
      return null;
    }
    var jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    return new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  },

  _addHeader: function(doc, options, state) {
    var margin = 15;
    if (options.logo) {
      try {
        doc.addImage(options.logo, 'PNG', margin, state.y, 30, 30);
        if (options.headerText) {
          doc.setFontSize(16); doc.setFont(undefined, 'bold');
          doc.text(options.headerText, margin + 35, state.y + 12);
          doc.setFontSize(10); doc.setFont(undefined, 'normal');
          if (options.subHeaderText) doc.text(options.subHeaderText, margin + 35, state.y + 20);
        }
        state.y += 35;
      } catch (e) {
        this._addHeaderText(doc, options, state);
      }
    } else {
      this._addHeaderText(doc, options, state);
    }
    if (options.customText) {
      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      var lines = doc.splitTextToSize(options.customText, 180);
      state.check(lines.length * 5 + 4);
      doc.text(lines, margin, state.y + 4);
      state.y += lines.length * 5 + 6;
    }
    doc.setDrawColor(200);
    doc.line(margin, state.y, 195, state.y);
    state.y += 6;
  },

  _addHeaderText: function(doc, options, state) {
    if (options.headerText) {
      doc.setFontSize(18); doc.setFont(undefined, 'bold');
      doc.text(options.headerText, 15, state.y + 8); state.y += 12;
      if (options.subHeaderText) { doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text(options.subHeaderText, 15, state.y + 4); state.y += 8; }
    }
  },

  _addFooter: function(doc) {
    var pageCount = doc.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setFont(undefined, 'normal'); doc.setTextColor(150);
      doc.text('Tribunator — ' + new Date().toLocaleDateString(), 15, 290);
      doc.text(i + '/' + pageCount, 195, 290, { align: 'right' });
      doc.setTextColor(0);
    }
  },

  _printMembers: function(doc, members, store, state, indent) {
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    members.forEach(function(m) {
      var c = store.getCandidate(m.candidateId);
      var displayName = c ? (c.useTitular && c.titularSurnames ? c.titularSurnames + ', ' + c.titularName : c.surnames + ', ' + c.name) : '—';
      var text = displayName;
      if (m.role) text += ' — ' + m.role;
      if (c && c.specialty) text += ' (' + c.specialty + ')';
      if (c && store.isSubstitute(c.id)) text += c.useTitular ? ' [titular]' : ' [sustituto]';
      state.check(5);
      doc.text(indent + text, 15, state.y + 3);
      state.y += 5;
    });
  },

  // Full PDF: members + variations + schedule
  generateFull: function(options) {
    var doc = this._initDoc();
    if (!doc) return;
    var store = Tribunator.Store;
    var margin = 15;
    var state = { y: margin, check: function(n) { if (state.y + n > 280) { doc.addPage(); state.y = margin; } } };

    this._addHeader(doc, options, state);

    var sol = store.getSolution(options.solutionId);
    if (!sol) return;
    var tribunals = options.tribunalIds ? sol.tribunals.filter(function(tr) { return options.tribunalIds.indexOf(tr.id) !== -1; }) : sol.tribunals;

    tribunals.forEach(function(trib, idx) {
      if (idx > 0) { state.check(40); doc.setDrawColor(220); doc.line(margin, state.y - 2, 195, state.y - 2); state.y += 4; }

      state.check(20);
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text(trib.name, margin, state.y + 5); state.y += 10;

      // Members
      if (trib.members.length > 0) {
        doc.setFontSize(11); doc.setFont(undefined, 'bold');
        doc.text(t('tribunals.members'), margin, state.y + 4); state.y += 7;
        Tribunator.PDF._printMembers(doc, trib.members, store, state, '  ');
        state.y += 2;
      }

      // Variations
      var variations = trib.variations || [];
      if (variations.length > 0) {
        variations.forEach(function(v) {
          state.check(15);
          doc.setFontSize(10); doc.setFont(undefined, 'bold');
          doc.text(t('tribunals.variations') + ': ' + v.name, margin + 3, state.y + 4); state.y += 6;
          Tribunator.PDF._printMembers(doc, v.members, store, state, '    ');
          state.y += 2;
        });
      }

      // Schedule
      var schedule = trib.schedule || [];
      if (schedule.length > 0 && !options.membersOnly) {
        doc.setFontSize(11); doc.setFont(undefined, 'bold');
        state.check(10);
        doc.text(t('tribunals.schedule'), margin, state.y + 4); state.y += 7;

        schedule.forEach(function(sched) {
          var day = store.getDay(sched.dayId);
          if (!day) return;
          state.check(12);
          doc.setFontSize(10); doc.setFont(undefined, 'bold');
          doc.text(Tribunator.Time.formatDate(day.date), margin + 3, state.y + 4); state.y += 6;
          doc.setFontSize(9); doc.setFont(undefined, 'normal');

          (sched.slots || []).forEach(function(slot) {
            var slotRoom = slot.roomId ? store.getRoom(slot.roomId) : null;
            var text = '  ' + slot.startTime + '–' + slot.endTime;
            if (slotRoom) text += '  ' + slotRoom.room.name;
            if (slot.activity) text += '  — ' + slot.activity;
            state.check(5);
            doc.text(text, margin, state.y + 3); state.y += 5;
          });
          state.y += 3;
        });
      }
    });

    this._addFooter(doc);
    var suffix = options.membersOnly ? 'miembros' : 'completo';
    doc.save('tribunator-' + suffix + '-' + (sol.name || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
    Tribunator.Utils.showToast(t('common.success'));
  },

  // Members-only PDF (no dates/schedule)
  generateMembersOnly: function(options) {
    options.membersOnly = true;
    this.generateFull(options);
  },

  showExportDialog: function() {
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var activeSol = store.getActiveSolution();
    if (!activeSol) { Tribunator.Utils.showToast(t('tribunals.noSolutions'), 'warning'); return; }

    var headerInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.headerText') });
    var subHeaderInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.subHeaderText') });
    var customTextInput = el('textarea', { className: 'form-textarea', placeholder: t('pdf.customText') });
    var logoInput = el('input', { type: 'file', accept: 'image/*', className: 'form-input' });

    var selectedIds = activeSol.tribunals.map(function(tr) { return tr.id; });
    var tribunalList = el('div', { style: { maxHeight: '200px', overflowY: 'auto', marginTop: '8px' } });
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

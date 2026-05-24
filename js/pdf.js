window.Tribunator = window.Tribunator || {};

Tribunator.PDF = {
  generate: function(options) {
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
      Tribunator.Utils.showToast('jsPDF library not loaded. Ensure internet connection.', 'error');
      return;
    }

    var jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    var doc = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var store = Tribunator.Store;
    var pageW = 210, margin = 15, contentW = pageW - margin * 2;
    var y = margin;

    var addPage = function() { doc.addPage(); y = margin; };
    var checkPage = function(needed) { if (y + needed > 280) addPage(); };

    // Header
    if (options.logo) {
      try {
        doc.addImage(options.logo, 'PNG', margin, y, 30, 30);
        if (options.headerText) {
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text(options.headerText, margin + 35, y + 12);
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          if (options.subHeaderText) doc.text(options.subHeaderText, margin + 35, y + 20);
        }
        y += 35;
      } catch (e) {
        if (options.headerText) {
          doc.setFontSize(18);
          doc.setFont(undefined, 'bold');
          doc.text(options.headerText, margin, y + 8);
          y += 12;
          if (options.subHeaderText) { doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text(options.subHeaderText, margin, y + 4); y += 8; }
        }
      }
    } else if (options.headerText) {
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(options.headerText, margin, y + 8);
      y += 12;
      if (options.subHeaderText) { doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text(options.subHeaderText, margin, y + 4); y += 8; }
    }

    // Custom text
    if (options.customText) {
      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      var lines = doc.splitTextToSize(options.customText, contentW);
      checkPage(lines.length * 5 + 4);
      doc.text(lines, margin, y + 4);
      y += lines.length * 5 + 6;
    }

    // Separator
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Tribunals
    var sol = store.getSolution(options.solutionId);
    if (!sol) return;
    var tribunals = options.tribunalIds ? sol.tribunals.filter(function(t) { return options.tribunalIds.indexOf(t.id) !== -1; }) : sol.tribunals;

    tribunals.forEach(function(trib, idx) {
      if (idx > 0) { checkPage(40); doc.setDrawColor(220); doc.line(margin, y - 2, pageW - margin, y - 2); y += 4; }

      // Tribunal name
      checkPage(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(trib.name, margin, y + 5);
      y += 10;

      // Members
      if (trib.members.length > 0) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(t('tribunals.members'), margin, y + 4);
        y += 7;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        trib.members.forEach(function(m) {
          var c = store.getCandidate(m.candidateId);
          var text = (c ? c.surnames + ', ' + c.name : '—');
          if (m.role) text += ' — ' + m.role;
          if (c && c.specialty) text += ' (' + c.specialty + ')';
          checkPage(5);
          doc.text('  ' + text, margin, y + 3);
          y += 5;
        });
        y += 3;
      }

      // Schedule
      var schedule = trib.schedule || [];
      if (schedule.length > 0) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        checkPage(10);
        doc.text(t('tribunals.schedule'), margin, y + 4);
        y += 7;

        schedule.forEach(function(sched) {
          var day = store.getDay(sched.dayId);
          if (!day) return;

          checkPage(12);
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.text(Tribunator.Time.formatDate(day.date), margin + 3, y + 4);
          y += 6;

          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');

          if (sched.primaryRoomId) {
            var rm = store.getRoom(sched.primaryRoomId);
            checkPage(5);
            doc.text('  ' + t('tribunals.primaryRoom') + ': ' + (rm ? rm.room.name : '—'), margin, y + 3);
            y += 5;
          }

          if (sched.activity) {
            checkPage(5);
            doc.text('  ' + t('tribunals.dayActivity') + ': ' + sched.activity, margin, y + 3);
            y += 5;
          }

          (sched.supportRooms || []).forEach(function(sr) {
            var srm = store.getRoom(sr.roomId);
            checkPage(5);
            doc.text('  ' + t('tribunals.supportRooms') + ': ' + (srm ? srm.room.name : '—') + (sr.purpose ? ' (' + sr.purpose + ')' : ''), margin, y + 3);
            y += 5;
          });

          (sched.slots || []).forEach(function(slot) {
            var slotRoom = slot.roomId ? store.getRoom(slot.roomId) : null;
            var text = '  ' + slot.startTime + '–' + slot.endTime;
            if (slotRoom) text += '  ' + slotRoom.room.name;
            if (slot.activity) text += '  — ' + slot.activity;
            checkPage(5);
            doc.text(text, margin, y + 3);
            y += 5;
          });

          y += 3;
        });
      }
    });

    // Footer
    var pageCount = doc.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(150);
      doc.text('Tribunator — ' + new Date().toLocaleDateString(), margin, 290);
      doc.text(i + '/' + pageCount, pageW - margin, 290, { align: 'right' });
      doc.setTextColor(0);
    }

    doc.save('tribunator-' + (sol.name || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
    Tribunator.Utils.showToast(t('common.success'));
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

    // Tribunal checkboxes
    var selectedIds = activeSol.tribunals.map(function(t) { return t.id; });
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
        {
          text: t('tribunals.pdf'),
          className: 'btn-primary',
          action: function() {
            var logoFile = logoInput.files[0];
            var opts = {
              solutionId: activeSol.id,
              tribunalIds: selectedIds,
              headerText: headerInput.value,
              subHeaderText: subHeaderInput.value,
              customText: customTextInput.value
            };

            if (logoFile) {
              var reader = new FileReader();
              reader.onload = function(e) {
                opts.logo = e.target.result;
                Tribunator.PDF.generate(opts);
              };
              reader.readAsDataURL(logoFile);
            } else {
              Tribunator.PDF.generate(opts);
            }
          }
        }
      ]
    });
  }
};

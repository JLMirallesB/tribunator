window.Tribunator = window.Tribunator || {};

Tribunator.Dashboard = {
  render: function() {
    var container = document.getElementById('phase-dashboard');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'block';

    var el = Tribunator.Utils.el;
    var store = Tribunator.Store;
    var wrapper = el('div', { style: { maxWidth: '900px', margin: '0 auto', padding: '24px' } });

    var hasData = store.hasData();

    if (!hasData) {
      this._renderWelcome(wrapper, el);
      container.appendChild(wrapper);
      return;
    }

    // Cards
    var allRooms = store.getAllRooms();
    var days = store.getDays();
    var activeSol = store.getActiveSolution();
    var tribunals = activeSol ? activeSol.tribunals : [];
    var candidates = store.getCandidates();
    var errors = activeSol ? Tribunator.Verify.collectErrors(store, activeSol) : [];
    var errorCount = errors.filter(function(e) { return e.severity === 'error'; }).length;
    var warnCount = errors.filter(function(e) { return e.severity === 'warning'; }).length;

    var cards = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' } });
    cards.appendChild(this._card(el, allRooms.length, t('space.rooms'), store.getCampuses().length + ' ' + t('space.campuses').toLowerCase(), 'space'));
    cards.appendChild(this._card(el, days.length, t('time.days'), days.length > 0 ? days[0].date.substring(5) + ' – ' + days[days.length - 1].date.substring(5) : '', 'time'));
    cards.appendChild(this._card(el, tribunals.length, t('tribunals.tribunals'), candidates.length + ' ' + t('tribunals.candidates').toLowerCase(), 'tribunals'));
    var errColor = errorCount > 0 ? 'var(--danger)' : warnCount > 0 ? 'var(--warning)' : 'var(--success)';
    cards.appendChild(this._card(el, errorCount, t('verify.errors'), warnCount + ' ' + t('verify.warnings'), 'verify', errColor));
    wrapper.appendChild(cards);

    // Active solution
    if (activeSol) {
      wrapper.appendChild(el('div', { style: { marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' } }, [
        el('span', { style: { fontWeight: '600' }, textContent: t('tribunals.activeSolution') + ': ' }),
        document.createTextNode(activeSol.name)
      ]));
    }

    // Days summary
    if (days.length > 0 && activeSol) {
      var daysPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      daysPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.upcomingDays') }));
      var daysBody = el('div', { className: 'panel-body', style: { padding: '0' } });
      days.forEach(function(day) {
        var occupation = store.getRoomOccupation(activeSol.id, day.id);
        var tribCount = 0, slotCount = 0;
        tribunals.forEach(function(trib) {
          var sched = (trib.schedule || []).find(function(s) { return s.dayId === day.id; });
          if (sched) { tribCount++; slotCount += (sched.slots || []).length; }
        });
        var roomCount = Object.keys(occupation).length;
        daysBody.appendChild(el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer' }, onClick: function() { Tribunator.App.setPhase('time'); } }, [
          el('span', { style: { fontWeight: '500' }, textContent: Tribunator.Time.formatDate(day.date) }),
          el('span', { style: { color: 'var(--text-muted)' }, textContent: tribCount + ' trib. · ' + slotCount + ' franjas · ' + roomCount + ' aulas' })
        ]));
      });
      daysPanel.appendChild(daysBody);
      wrapper.appendChild(daysPanel);
    }

    // Two columns: rooms + members
    var cols = el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } });

    // Most used rooms
    if (activeSol && days.length > 0) {
      var roomUsage = {};
      tribunals.forEach(function(trib) {
        (trib.schedule || []).forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            if (slot.roomId) roomUsage[slot.roomId] = (roomUsage[slot.roomId] || 0) + 1;
          });
        });
      });
      var sortedRooms = Object.keys(roomUsage).map(function(rid) { return { id: rid, count: roomUsage[rid] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

      var roomPanel = el('div', { className: 'panel' });
      roomPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.topRooms') }));
      var roomBody = el('div', { className: 'panel-body', style: { padding: '0' } });
      if (sortedRooms.length === 0) {
        roomBody.appendChild(el('div', { style: { padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('common.noData') }));
      } else {
        sortedRooms.forEach(function(r) {
          var found = store.getRoom(r.id);
          var name = found ? found.room.name : r.id;
          roomBody.appendChild(el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '6px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
            el('span', { textContent: name }),
            el('span', { style: { color: 'var(--text-muted)' }, textContent: r.count + ' franjas' })
          ]));
        });
      }
      roomPanel.appendChild(roomBody);
      cols.appendChild(roomPanel);
    }

    // Member workload
    if (activeSol) {
      var memberLoad = {};
      tribunals.forEach(function(trib) {
        trib.members.forEach(function(m) {
          if (!memberLoad[m.candidateId]) memberLoad[m.candidateId] = 0;
          memberLoad[m.candidateId]++;
        });
      });
      var sortedMembers = Object.keys(memberLoad).map(function(cid) { return { id: cid, count: memberLoad[cid] }; }).sort(function(a, b) { return b.count - a.count; });

      var memberPanel = el('div', { className: 'panel' });
      memberPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.topMembers') + ' (' + sortedMembers.length + ')' }));
      var memberBody = el('div', { className: 'panel-body', style: { padding: '0', maxHeight: '200px', overflowY: 'auto' } });
      if (sortedMembers.length === 0) {
        memberBody.appendChild(el('div', { style: { padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('common.noData') }));
      } else {
        sortedMembers.forEach(function(m) {
          var c = store.getCandidate(m.id);
          var name = c ? c.surnames + ', ' + c.name : '?';
          var color = m.count >= 3 ? 'var(--danger)' : 'var(--text-muted)';
          memberBody.appendChild(el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '6px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
            el('span', { textContent: name }),
            el('span', { style: { color: color, fontWeight: m.count >= 3 ? '600' : '400' }, textContent: m.count + ' trib.' })
          ]));
        });
      }
      memberPanel.appendChild(memberBody);
      cols.appendChild(memberPanel);
    }
    wrapper.appendChild(cols);

    // Unused candidates
    if (activeSol && candidates.length > 0) {
      var usedIds = {};
      tribunals.forEach(function(trib) { trib.members.forEach(function(m) { usedIds[m.candidateId] = true; }); });
      var unused = candidates.filter(function(c) { return !usedIds[c.id]; });
      if (unused.length > 0) {
        var unusedPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
        unusedPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.unusedCandidates') + ' (' + unused.length + ')' }));
        var unusedBody = el('div', { className: 'panel-body', style: { padding: '0', maxHeight: '150px', overflowY: 'auto' } });
        unused.forEach(function(c) {
          unusedBody.appendChild(el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
            el('span', { textContent: c.surnames + ', ' + c.name }),
            el('span', { style: { color: 'var(--text-muted)' }, textContent: c.specialty || '' })
          ]));
        });
        unusedPanel.appendChild(unusedBody);
        wrapper.appendChild(unusedPanel);
      }
    }

    // Errors preview
    if (errors.length > 0) {
      var errPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      errPanel.appendChild(el('div', { className: 'panel-header', style: { cursor: 'pointer' }, onClick: function() { Tribunator.App.setPhase('verify'); } }, [
        t('dashboard.pendingErrors') + ' (' + errors.length + ')',
        el('span', { style: { fontSize: '10px', color: 'inherit', opacity: '0.7' }, textContent: ' → ' + t('app.phases.verify') })
      ]));
      var errBody = el('div', { className: 'panel-body', style: { padding: '0' } });
      errors.slice(0, 6).forEach(function(err) {
        var icon = err.severity === 'error' ? '✕' : '⚠';
        var color = err.severity === 'error' ? 'var(--danger)' : 'var(--warning)';
        errBody.appendChild(el('div', { style: { display: 'flex', gap: '8px', padding: '6px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
          el('span', { style: { color: color, fontWeight: '700', width: '14px' }, textContent: icon }),
          el('div', { style: { flex: '1' } }, [
            el('span', { textContent: err.message }),
            err.detail ? el('span', { style: { color: 'var(--text-muted)', marginLeft: '6px' }, textContent: err.detail }) : null
          ].filter(Boolean))
        ]));
      });
      if (errors.length > 6) {
        errBody.appendChild(el('div', { style: { padding: '6px 16px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', cursor: 'pointer' }, textContent: '+ ' + (errors.length - 6) + ' ' + t('dashboard.more'), onClick: function() { Tribunator.App.setPhase('verify'); } }));
      }
      errPanel.appendChild(errBody);
      wrapper.appendChild(errPanel);
    }

    // Export / Import section
    var ioPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
    ioPanel.appendChild(el('div', { className: 'panel-header', textContent: t('common.export') + ' / ' + t('common.import') }));
    var ioBody = el('div', { className: 'panel-body' });
    var ioRow = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' } });
    ioRow.appendChild(el('button', { className: 'btn btn-sm', textContent: t('export.exportAll'), onClick: function() { var data = store.exportAll(); Tribunator.Utils.downloadFile(data, 'tribunator-completo.json'); Tribunator.Utils.showToast(t('export.exportSuccess')); } }));
    ioRow.appendChild(el('button', { className: 'btn btn-sm', textContent: t('export.exportSpaces'), onClick: function() { var data = store.exportSpaces(); Tribunator.Utils.downloadFile(data, 'tribunator-espacios.json'); Tribunator.Utils.showToast(t('export.exportSuccess')); } }));
    ioRow.appendChild(el('button', { className: 'btn btn-sm', textContent: t('export.exportTime'), onClick: function() { var data = store.exportTime(); Tribunator.Utils.downloadFile(data, 'tribunator-tiempo.json'); Tribunator.Utils.showToast(t('export.exportSuccess')); } }));
    var fileInput = el('input', { type: 'file', accept: '.json', className: 'file-input-hidden', onChange: function(e) {
      var file = e.target.files[0]; if (!file) return;
      Tribunator.Utils.readFile(file, function(err, content) {
        if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
        if (store.hasData()) {
          Tribunator.Utils.showImportDialog(
            function() { var r = store.importData(content, 'replace'); if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); Tribunator.App.render(); Tribunator.App.renderCurrentPhase(); } else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); } },
            function() { var r = store.importData(content, 'merge'); if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); Tribunator.App.render(); Tribunator.App.renderCurrentPhase(); } else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); } }
          );
        } else {
          var r = store.importData(content, 'replace');
          if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); Tribunator.App.render(); Tribunator.App.renderCurrentPhase(); }
          else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); }
        }
      });
      e.target.value = '';
    }});
    ioRow.appendChild(fileInput);
    ioRow.appendChild(el('button', { className: 'btn btn-sm', textContent: t('export.importData'), onClick: function() { fileInput.click(); } }));
    ioBody.appendChild(ioRow);
    ioPanel.appendChild(ioBody);
    wrapper.appendChild(ioPanel);

    container.appendChild(wrapper);
  },

  _renderWelcome: function(wrapper, el) {
    wrapper.appendChild(el('div', { style: { textAlign: 'center', padding: '48px 24px' } }, [
      el('img', { src: 'logo.svg', alt: 'Tribunator', style: { width: '80px', height: '80px', imageRendering: 'pixelated', marginBottom: '16px' } }),
      el('h2', { style: { fontSize: '24px', fontWeight: '700', marginBottom: '8px' }, textContent: t('dashboard.welcome') }),
      el('p', { style: { color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }, textContent: t('dashboard.welcomeDesc') }),
      el('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' } }, [
        el('button', { className: 'btn btn-primary', textContent: t('dashboard.startFresh'), onClick: function() { Tribunator.App.setPhase('space'); } }),
        (function() {
          var fileIn = el('input', { type: 'file', accept: '.json', className: 'file-input-hidden', onChange: function(e) {
            var file = e.target.files[0]; if (!file) return;
            Tribunator.Utils.readFile(file, function(err, content) {
              if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
              var r = Tribunator.Store.importData(content, 'replace');
              if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); Tribunator.App.render(); Tribunator.App.renderCurrentPhase(); }
              else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); }
            });
            e.target.value = '';
          }});
          var btn = el('button', { className: 'btn', textContent: t('export.importData'), onClick: function() { fileIn.click(); } });
          var wrap = el('span', {}, [fileIn, btn]);
          return wrap;
        })(),
        el('button', { className: 'btn', textContent: t('app.loadDemo'), onClick: function() { Tribunator.App.loadDemo(); } })
      ])
    ]));
  },

  _card: function(el, number, label, sub, phase, color) {
    return el('div', {
      className: 'panel',
      style: { textAlign: 'center', padding: '16px', cursor: 'pointer' },
      onClick: function() { Tribunator.App.setPhase(phase); }
    }, [
      el('div', { style: { fontSize: '28px', fontWeight: '700', color: color || 'var(--text)' }, textContent: String(number) }),
      el('div', { style: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }, textContent: label }),
      sub ? el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }, textContent: sub }) : null
    ].filter(Boolean));
  }
};

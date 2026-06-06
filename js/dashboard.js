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

    // Daily activity overview
    if (days.length > 0 && activeSol) {
      var overviewPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      overviewPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.dailyOverview') }));
      var overviewBody = el('div', { className: 'panel-body', style: { padding: '0' } });
      days.forEach(function(day) {
        var tribActivities = {};
        tribunals.forEach(function(trib) {
          var sched = (trib.schedule || []).find(function(s) { return s.dayId === day.id; });
          if (!sched) return;
          var activities = [];
          (sched.slots || []).forEach(function(slot) {
            if (!slot.activity) return;
            var hasPart = slot.activity.indexOf('Parte A') !== -1 || slot.activity.indexOf('Parte B') !== -1 || slot.activity.indexOf('Part A') !== -1 || slot.activity.indexOf('Part B') !== -1;
            var hasLevel = slot.activity.indexOf('EEM') !== -1 || slot.activity.indexOf('EPM') !== -1;
            if (!hasPart && !hasLevel) return;
            if (activities.indexOf(slot.activity) === -1) activities.push(slot.activity);
          });
          if (activities.length > 0) tribActivities[trib.name] = activities.join(', ');
        });
        var tribNames = Object.keys(tribActivities);
        if (tribNames.length === 0) return;

        var groups = {};
        tribNames.forEach(function(name) {
          var key = tribActivities[name];
          if (!groups[key]) groups[key] = [];
          groups[key].push(name);
        });

        var daySection = el('div', { style: { padding: '10px 16px', borderBottom: '1px solid var(--border)' } });
        daySection.appendChild(el('div', { style: { fontWeight: '600', fontSize: '13px', marginBottom: '6px' }, textContent: Tribunator.Time.formatDate(day.date) }));

        Object.keys(groups).forEach(function(actKey) {
          var row = el('div', { style: { display: 'flex', gap: '6px', fontSize: '12px', marginBottom: '4px', alignItems: 'center', flexWrap: 'wrap' } });
          groups[actKey].forEach(function(name, i) {
            if (i > 0) row.appendChild(el('span', { style: { color: 'var(--border)', margin: '0 2px' }, textContent: '·' }));
            row.appendChild(el('span', { style: { fontWeight: '600', padding: '2px 7px', background: 'var(--bg-secondary)', borderRadius: '3px', border: '1px solid var(--border)' }, textContent: name }));
          });
          row.appendChild(el('span', { style: { color: 'var(--text-muted)', marginLeft: '4px' }, textContent: '— ' + actKey }));
          daySection.appendChild(row);
        });

        overviewBody.appendChild(daySection);
      });
      overviewPanel.appendChild(overviewBody);
      wrapper.appendChild(overviewPanel);
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
      var memberInfo = {};
      tribunals.forEach(function(trib) {
        trib.members.forEach(function(m) {
          if (!memberInfo[m.candidateId]) memberInfo[m.candidateId] = { tribs: {}, details: [] };
          memberInfo[m.candidateId].tribs[trib.id] = true;
          memberInfo[m.candidateId].details.push(trib.name + (m.role ? ' (' + m.role + ')' : ''));
        });
        (trib.variations || []).forEach(function(v) {
          v.members.forEach(function(m) {
            if (!memberInfo[m.candidateId]) memberInfo[m.candidateId] = { tribs: {}, details: [] };
            memberInfo[m.candidateId].tribs[trib.id] = true;
            memberInfo[m.candidateId].details.push(trib.name + ' — ' + v.name + (m.role ? ' (' + m.role + ')' : ''));
          });
        });
      });
      var sortedMembers = Object.keys(memberInfo).map(function(cid) {
        var info = memberInfo[cid];
        return { id: cid, tribCount: Object.keys(info.tribs).length, details: info.details };
      }).sort(function(a, b) { return b.tribCount - a.tribCount || b.details.length - a.details.length; });

      var memberPanel = el('div', { className: 'panel' });
      memberPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.topMembers') + ' (' + sortedMembers.length + ')' }));
      var memberBody = el('div', { className: 'panel-body', style: { padding: '0', maxHeight: '200px', overflowY: 'auto' } });
      if (sortedMembers.length === 0) {
        memberBody.appendChild(el('div', { style: { padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('common.noData') }));
      } else {
        sortedMembers.forEach(function(m) {
          var c = store.getCandidate(m.id);
          var name = c ? c.surnames + ', ' + c.name : '?';
          var color = m.tribCount >= 3 ? 'var(--danger)' : 'var(--text-muted)';
          var tooltip = m.details.join('\n');
          var label = m.tribCount + ' trib.';
          if (m.details.length > m.tribCount) label += ' (' + m.details.length + ' partic.)';
          memberBody.appendChild(el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '6px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', cursor: 'default' }, title: tooltip }, [
            el('span', { textContent: name }),
            el('span', { style: { color: color, fontWeight: m.tribCount >= 3 ? '600' : '400' }, textContent: label })
          ]));
        });
      }
      memberPanel.appendChild(memberBody);
      cols.appendChild(memberPanel);
    }
    wrapper.appendChild(cols);

    // Candidate search
    if (activeSol && candidates.length > 0) {
      var searchPanel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      searchPanel.appendChild(el('div', { className: 'panel-header', textContent: t('dashboard.searchCandidate') }));
      var searchBody = el('div', { className: 'panel-body' });

      var specialties = {};
      candidates.forEach(function(c) { if (c.specialty) specialties[c.specialty] = true; });
      var specKeys = Object.keys(specialties).sort();

      var filterRow = el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } });
      var specSelect = el('select', { style: { flex: '0 0 auto', fontSize: '12px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)' } });
      specSelect.appendChild(el('option', { value: '', textContent: t('dashboard.allSpecialties') }));
      specKeys.forEach(function(sp) { specSelect.appendChild(el('option', { value: sp, textContent: sp })); });
      var nameInput = el('input', { type: 'text', placeholder: t('dashboard.searchPlaceholder'), style: { flex: '1', fontSize: '12px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)' } });
      filterRow.appendChild(specSelect);
      filterRow.appendChild(nameInput);
      searchBody.appendChild(filterRow);

      var resultArea = el('div', { style: { maxHeight: '300px', overflowY: 'auto' } });
      var detailArea = el('div');
      searchBody.appendChild(resultArea);
      searchBody.appendChild(detailArea);

      var selectedId = null;

      function buildCandidateDetail(cid) {
        Tribunator.Utils.clearElement(detailArea);
        selectedId = cid;
        var c = store.getCandidate(cid);
        if (!c) return;

        var entries = [];
        tribunals.forEach(function(trib) {
          trib.members.forEach(function(m) {
            if (m.candidateId === cid) entries.push({ type: 'member', trib: trib, role: m.role });
          });
          (trib.variations || []).forEach(function(v) {
            v.members.forEach(function(m) {
              if (m.candidateId === cid) entries.push({ type: 'variation', trib: trib, varName: v.name, role: m.role });
            });
          });
        });

        if (entries.length === 0) {
          detailArea.appendChild(el('div', { style: { padding: '8px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }, textContent: t('dashboard.noTribunals') }));
          return;
        }

        var detailBox = el('div', { style: { marginTop: '8px', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' } });
        detailBox.appendChild(el('div', { style: { fontWeight: '600', fontSize: '13px', marginBottom: '8px' }, textContent: c.surnames + ', ' + c.name + (c.specialty ? ' — ' + c.specialty : '') }));

        entries.forEach(function(entry) {
          var tag = entry.type === 'member' ? t('dashboard.memberOf') : t('dashboard.variationOf');
          var tagColor = entry.type === 'member' ? 'var(--primary)' : 'var(--warning)';
          var tribLabel = entry.trib.name;
          if (entry.type === 'variation') tribLabel += ' — ' + entry.varName;
          if (entry.role) tribLabel += ' (' + entry.role + ')';

          var entryRow = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '12px' } }, [
            el('span', { style: { fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: tagColor, color: '#fff', fontWeight: '600', flexShrink: '0', marginTop: '1px' }, textContent: tag }),
            el('div', { style: { flex: '1' } })
          ]);
          var detailCol = entryRow.lastChild;
          detailCol.appendChild(el('div', { style: { fontWeight: '500' }, textContent: tribLabel }));

          var schedule = entry.trib.schedule || [];
          schedule.forEach(function(sched) {
            var day = store.getDay(sched.dayId);
            if (!day) return;
            var slots = (sched.slots || []).slice().sort(function(a, b) { return a.startTime.localeCompare(b.startTime); });
            if (slots.length === 0) return;
            var slotTexts = slots.map(function(s) { return s.startTime + '–' + s.endTime + (s.activity ? ' ' + s.activity : ''); });
            detailCol.appendChild(el('div', { style: { color: 'var(--text-muted)', marginTop: '2px' }, textContent: Tribunator.Time.formatDate(day.date) + ': ' + slotTexts.join(', ') }));
          });

          detailBox.appendChild(entryRow);
        });

        detailArea.appendChild(detailBox);
      }

      function updateResults() {
        Tribunator.Utils.clearElement(resultArea);
        Tribunator.Utils.clearElement(detailArea);
        selectedId = null;
        var specFilter = specSelect.value;
        var textFilter = nameInput.value.trim().toLowerCase();
        if (!specFilter && !textFilter) {
          resultArea.appendChild(el('div', { style: { padding: '8px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }, textContent: t('dashboard.selectCandidate') }));
          return;
        }
        var filtered = candidates.filter(function(c) {
          if (specFilter && c.specialty !== specFilter) return false;
          if (textFilter) {
            var full = ((c.surnames || '') + ' ' + (c.name || '')).toLowerCase();
            if (full.indexOf(textFilter) === -1) return false;
          }
          return true;
        });
        if (filtered.length === 0) {
          resultArea.appendChild(el('div', { style: { padding: '8px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }, textContent: t('common.noData') }));
          return;
        }
        filtered.forEach(function(c) {
          var row = el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid var(--border)', fontSize: '12px', cursor: 'pointer', background: selectedId === c.id ? 'var(--primary-light)' : '' }, onClick: function() { buildCandidateDetail(c.id); updateHighlight(); } }, [
            el('span', { textContent: c.surnames + ', ' + c.name }),
            el('span', { style: { color: 'var(--text-muted)' }, textContent: c.specialty || '' })
          ]);
          row._cid = c.id;
          resultArea.appendChild(row);
        });
      }

      function updateHighlight() {
        var rows = resultArea.children;
        for (var i = 0; i < rows.length; i++) {
          rows[i].style.background = rows[i]._cid === selectedId ? 'var(--primary-light)' : '';
        }
      }

      specSelect.addEventListener('change', updateResults);
      nameInput.addEventListener('input', updateResults);

      resultArea.appendChild(el('div', { style: { padding: '8px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }, textContent: t('dashboard.selectCandidate') }));

      searchPanel.appendChild(searchBody);
      wrapper.appendChild(searchPanel);
    }

    // Unused candidates
    if (activeSol && candidates.length > 0) {
      var usedIds = {};
      tribunals.forEach(function(trib) {
        trib.members.forEach(function(m) { usedIds[m.candidateId] = true; });
        (trib.variations || []).forEach(function(v) { v.members.forEach(function(m) { usedIds[m.candidateId] = true; }); });
      });
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

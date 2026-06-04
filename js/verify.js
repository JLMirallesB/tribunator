window.Tribunator = window.Tribunator || {};

Tribunator.Verify = {
  render: function() {
    var container = document.getElementById('phase-verify');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'block';

    var el = Tribunator.Utils.el;
    var store = Tribunator.Store;
    var wrapper = el('div', { style: { maxWidth: '900px', margin: '0 auto', padding: '24px' } });

    var activeSol = store.getActiveSolution();

    wrapper.appendChild(el('div', { className: 'main-area-header' }, [
      el('div', { className: 'main-area-title', textContent: t('verify.title') }),
      activeSol ? el('span', { style: { fontSize: '13px', color: 'var(--text-muted)' }, textContent: t('tribunals.activeSolution') + ': ' + activeSol.name }) : null
    ].filter(Boolean)));

    if (!activeSol) {
      wrapper.appendChild(el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-state-text', textContent: t('tribunals.noSolutions') })
      ]));
      container.appendChild(wrapper);
      return;
    }

    var errors = this.collectErrors(store, activeSol);

    if (errors.length === 0) {
      wrapper.appendChild(el('div', { style: { textAlign: 'center', padding: '48px 24px' } }, [
        el('div', { style: { fontSize: '48px', marginBottom: '16px' }, textContent: '✓' }),
        el('div', { style: { fontSize: '16px', fontWeight: '500', color: 'var(--success)' }, textContent: t('verify.allGood') })
      ]));
      container.appendChild(wrapper);
      return;
    }

    // Summary
    var counts = {};
    errors.forEach(function(e) { counts[e.severity] = (counts[e.severity] || 0) + 1; });
    var summary = el('div', { style: { display: 'flex', gap: '16px', marginBottom: '24px' } });
    if (counts.error) summary.appendChild(el('div', { className: 'status-badge assigned', style: { fontSize: '13px', padding: '6px 12px' }, textContent: counts.error + ' ' + t('verify.errors') }));
    if (counts.warning) summary.appendChild(el('div', { className: 'warning-badge', style: { fontSize: '13px', padding: '6px 12px' }, textContent: counts.warning + ' ' + t('verify.warnings') }));
    if (counts.info) summary.appendChild(el('div', { style: { fontSize: '13px', padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px' }, textContent: counts.info + ' ' + t('verify.infos') }));
    wrapper.appendChild(summary);

    // Group by category
    var categories = {};
    errors.forEach(function(e) {
      if (!categories[e.category]) categories[e.category] = [];
      categories[e.category].push(e);
    });

    Object.keys(categories).forEach(function(cat) {
      var catErrors = categories[cat];
      var panel = el('div', { className: 'panel', style: { marginBottom: '16px' } });
      panel.appendChild(el('div', { className: 'panel-header' }, [
        el('span', { textContent: t('verify.cat_' + cat) + ' (' + catErrors.length + ')' })
      ]));
      var body = el('div', { className: 'panel-body', style: { padding: '0' } });

      catErrors.forEach(function(err) {
        var icon = err.severity === 'error' ? '✕' : err.severity === 'warning' ? '⚠' : 'ℹ';
        var color = err.severity === 'error' ? 'var(--danger)' : err.severity === 'warning' ? 'var(--warning)' : 'var(--primary)';
        var detailEl = el('div', { style: { flex: '1' } });
        detailEl.appendChild(el('div', { style: { fontWeight: '500' }, textContent: err.message }));
        if (err.detailLines) {
          err.detailLines.forEach(function(line) {
            detailEl.appendChild(el('div', { style: { color: line.color || 'var(--text-muted)', fontSize: '12px', marginTop: '2px', paddingLeft: line.indent ? '12px' : '0' }, textContent: line.text }));
          });
        } else if (err.detail) {
          detailEl.appendChild(el('div', { style: { color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }, textContent: err.detail }));
        }
        body.appendChild(el('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px' } }, [
          el('span', { style: { color: color, fontWeight: '700', flexShrink: '0', width: '16px' }, textContent: icon }),
          detailEl
        ]));
      });

      panel.appendChild(body);
      wrapper.appendChild(panel);
    });

    container.appendChild(wrapper);
  },

  collectErrors: function(store, sol) {
    var errors = [];
    var days = store.getDays();
    var candidates = store.getCandidates();
    var roleDefs = store.getRoleDefs();
    var def = store.data.settings.defaultMembersPerTribunal;
    var requiredRoles = roleDefs.filter(function(r) { return r.requireOne; });

    // --- No days configured ---
    if (days.length === 0) {
      errors.push({ severity: 'error', category: 'time', message: t('verify.noDays') });
    }

    // --- No tribunals ---
    if (sol.tribunals.length === 0) {
      errors.push({ severity: 'error', category: 'tribunals', message: t('verify.noTribunals') });
      return errors;
    }

    // --- Per-tribunal checks ---
    var memberDayMap = {};

    sol.tribunals.forEach(function(trib) {
      var mc = store.countTribunalMembers(sol.id, trib.id);

      // Member count
      if (mc < def) {
        errors.push({ severity: 'error', category: 'members', message: t('verify.memberLow'), detail: trib.name + ' (' + mc + '/' + def + ')' });
      } else if (mc > def) {
        errors.push({ severity: 'warning', category: 'members', message: t('verify.memberHigh'), detail: trib.name + ' (' + mc + '/' + def + ')' });
      }

      // No members at all
      if (trib.members.length === 0) {
        errors.push({ severity: 'error', category: 'members', message: t('verify.noMembers'), detail: trib.name });
      }

      // Required roles
      requiredRoles.forEach(function(roleDef) {
        var has = trib.members.some(function(m) { return m.role === roleDef.name; });
        if (!has) {
          errors.push({ severity: 'warning', category: 'members', message: t('verify.missingRole') + ': ' + roleDef.name, detail: trib.name });
        }
      });

      // Members without role
      trib.members.forEach(function(m) {
        if (!m.role || !m.role.trim()) {
          var c = store.getCandidate(m.candidateId);
          errors.push({ severity: 'warning', category: 'members', message: t('verify.memberNoRole'), detail: trib.name + ' — ' + (c ? c.surnames + ', ' + c.name : '?') });
        }
      });

      // Schedule
      var schedule = trib.schedule || [];
      if (schedule.length === 0) {
        errors.push({ severity: 'error', category: 'schedule', message: t('verify.noSchedule'), detail: trib.name });
      }

      schedule.forEach(function(sched) {
        var day = store.getDay(sched.dayId);
        if (!day) return;
        var dayLabel = Tribunator.Time.formatDate(day.date);

        // No slots
        if (!sched.slots || sched.slots.length === 0) {
          errors.push({ severity: 'error', category: 'schedule', message: t('verify.noSlots'), detail: trib.name + ' — ' + dayLabel });
        }

        (sched.slots || []).forEach(function(slot) {
          // Missing room
          if (!slot.roomId) {
            errors.push({ severity: 'error', category: 'schedule', message: t('verify.slotNoRoom'), detail: trib.name + ' — ' + dayLabel + ' ' + slot.startTime + '–' + slot.endTime });
          }

          // Missing activity
          if (!slot.activity || !slot.activity.trim()) {
            errors.push({ severity: 'warning', category: 'schedule', message: t('verify.slotNoActivity'), detail: trib.name + ' — ' + dayLabel + ' ' + slot.startTime + '–' + slot.endTime });
          }

          // Room conflict with other tribunals
          if (slot.roomId) {
            var conflicts = store.getRoomConflicts(sol.id, slot.roomId, sched.dayId, slot.startTime, slot.endTime, trib.id, slot.activity);
            conflicts.forEach(function(c) {
              var roomInfo = store.getRoom(slot.roomId);
              var roomName = roomInfo ? roomInfo.room.name : slot.roomId;
              var sev = c.nonBlocking ? 'info' : 'error';
              var msg = c.nonBlocking ? roomName + ' — ' + t('verify.sharedNonBlocking') : roomName + ' — ' + t('verify.roomOccupiedTwice');
              var lines = [
                { text: trib.name + ': ' + slot.startTime + '–' + slot.endTime + (slot.activity ? ' — ' + slot.activity : ''), indent: true },
                { text: c.tribunal.name + ': ' + (c.slot ? c.slot.startTime + '–' + c.slot.endTime + (c.slot.activity ? ' — ' + c.slot.activity : '') : ''), indent: true },
                { text: '📅 ' + dayLabel, color: 'var(--text-muted)' }
              ];
              errors.push({ severity: sev, category: 'conflicts', message: msg, detailLines: lines });
            });
          }
        });

        // Member time conflicts: check slot-level overlap (including variations)
        var allMembers = trib.members.slice();
        (trib.variations || []).forEach(function(v) { v.members.forEach(function(vm) { if (!allMembers.some(function(m) { return m.candidateId === vm.candidateId; })) allMembers.push(vm); }); });
        allMembers.forEach(function(m) {
          (sched.slots || []).forEach(function(slot) {
            var key = m.candidateId + '_' + sched.dayId + '_' + slot.startTime + '_' + slot.endTime;
            if (!memberDayMap[key]) memberDayMap[key] = { candidateId: m.candidateId, dayId: sched.dayId, start: slot.startTime, end: slot.endTime, tribs: [] };
            memberDayMap[key].tribs.push(trib);
          });
        });
      });
    });

    // Check member time conflicts (same person overlapping slots in different tribunals)
    var seenConflicts = {};
    var memberSlots = {};
    // Rebuild: group by candidateId + dayId, collect all slots
    sol.tribunals.forEach(function(trib) {
      var allMembersForSlots = trib.members.slice();
      (trib.variations || []).forEach(function(v) { v.members.forEach(function(vm) { if (!allMembersForSlots.some(function(m) { return m.candidateId === vm.candidateId; })) allMembersForSlots.push(vm); }); });
      allMembersForSlots.forEach(function(m) {
        (trib.schedule || []).forEach(function(sched) {
          (sched.slots || []).forEach(function(slot) {
            var key = m.candidateId + '_' + sched.dayId;
            if (!memberSlots[key]) memberSlots[key] = [];
            memberSlots[key].push({ trib: trib, slot: slot });
          });
        });
      });
    });
    Object.keys(memberSlots).forEach(function(key) {
      var entries = memberSlots[key];
      for (var i = 0; i < entries.length; i++) {
        for (var j = i + 1; j < entries.length; j++) {
          if (entries[i].trib.id === entries[j].trib.id) continue;
          if (store._timesOverlap(entries[i].slot.startTime, entries[i].slot.endTime, entries[j].slot.startTime, entries[j].slot.endTime)) {
            var parts = key.split('_');
            var candidateId = parts[0], dayId = parts[1];
            var c = store.getCandidate(candidateId);
            var day = store.getDay(dayId);
            var nonBlocking = store.isNonBlockingSlot(entries[i].slot) || store.isNonBlockingSlot(entries[j].slot);
            var conflictKey = [entries[i].trib.id, entries[j].trib.id].sort().join('|') + '_' + dayId + '_' + candidateId;
            if (!seenConflicts[conflictKey]) {
              seenConflicts[conflictKey] = true;
              var cName = c ? c.surnames + ', ' + c.name : '?';
              var dayStr = day ? Tribunator.Time.formatDate(day.date) : '';
              // Find roles
              var role1 = ''; var role2 = '';
              entries[i].trib.members.forEach(function(mb) { if (mb.candidateId === candidateId) role1 = mb.role || ''; });
              entries[j].trib.members.forEach(function(mb) { if (mb.candidateId === candidateId) role2 = mb.role || ''; });
              var msg = nonBlocking ? cName + ' — ' + t('verify.memberSharedNonBlocking') : cName + ' — ' + t('verify.memberOccupiedTwice');
              var lines = [
                { text: entries[i].trib.name + ': ' + entries[i].slot.startTime + '–' + entries[i].slot.endTime + (role1 ? ' (' + role1 + ')' : '') + (entries[i].slot.activity ? ' — ' + entries[i].slot.activity : ''), indent: true },
                { text: entries[j].trib.name + ': ' + entries[j].slot.startTime + '–' + entries[j].slot.endTime + (role2 ? ' (' + role2 + ')' : '') + (entries[j].slot.activity ? ' — ' + entries[j].slot.activity : ''), indent: true },
                { text: '📅 ' + dayStr, color: 'var(--text-muted)' }
              ];
              errors.push({ severity: nonBlocking ? 'info' : 'error', category: 'conflicts', message: msg, detailLines: lines });
            }
          }
        }
      }
    });

    // --- Activity coverage check (3 levels) ---
    sol.tribunals.forEach(function(trib) {
      var coverage = store.checkActivityCoverage(sol.id, trib.id);
      coverage.forEach(function(issue) {
        var severity = issue.level === 'part' ? 'error' : 'warning';
        var msgKey = issue.level === 'part' ? 'verify.missingPart' : issue.level === 'specialty' ? 'verify.missingSpecialtySub' : 'verify.missingSub';
        errors.push({
          severity: severity,
          category: 'coverage',
          message: t(msgKey) + ': ' + issue.missingPart,
          detail: trib.name + ' (' + issue.template + ')'
        });
      });
    });

    // --- Rooms without assignment (info) ---
    var assignedRoomIds = {};
    sol.tribunals.forEach(function(trib) {
      (trib.schedule || []).forEach(function(sched) {
        (sched.slots || []).forEach(function(slot) {
          if (slot.roomId) assignedRoomIds[slot.roomId] = true;
        });
      });
    });

    // Deduplicate room conflicts
    var seen = {};
    errors = errors.filter(function(e) {
      if (e.category === 'conflicts') {
        var k = e.message + '|' + e.detail;
        if (seen[k]) return false;
        seen[k] = true;
      }
      return true;
    });

    // Sort: errors first, then warnings, then info
    var order = { error: 0, warning: 1, info: 2 };
    errors.sort(function(a, b) { return (order[a.severity] || 9) - (order[b.severity] || 9); });

    return errors;
  }
};

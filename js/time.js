window.Tribunator = window.Tribunator || {};

Tribunator.Time = {
  init: function() {},

  render: function() {
    var container = document.getElementById('phase-time');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'block';

    var wrapper = Tribunator.Utils.el('div', { style: { maxWidth: '800px', margin: '0 auto', padding: '24px' } });

    // Header
    var header = Tribunator.Utils.el('div', { className: 'main-area-header' });
    header.appendChild(Tribunator.Utils.el('div', { className: 'main-area-title', textContent: t('time.days') }));
    var actions = Tribunator.Utils.el('div', { className: 'main-area-actions' });
    actions.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-primary',
      textContent: t('time.addDay'),
      onClick: function() { Tribunator.Time.promptAddDay(); }
    }));
    actions.appendChild(Tribunator.Utils.el('button', {
      className: 'btn',
      textContent: t('common.export'),
      onClick: function() {
        var data = Tribunator.Store.exportTime();
        Tribunator.Utils.downloadFile(data, 'tribunator-tiempo.json');
        Tribunator.Utils.showToast(t('export.exportSuccess'));
      }
    }));
    var fileInput = Tribunator.Utils.el('input', { type: 'file', accept: '.json', className: 'file-input-hidden', onChange: function(e) { Tribunator.Time.handleImport(e); } });
    actions.appendChild(fileInput);
    actions.appendChild(Tribunator.Utils.el('button', {
      className: 'btn',
      textContent: t('common.import'),
      onClick: function() { fileInput.click(); }
    }));
    header.appendChild(actions);
    wrapper.appendChild(header);

    var days = Tribunator.Store.getDays();

    if (days.length === 0) {
      wrapper.appendChild(Tribunator.Utils.el('div', { className: 'empty-state' }, [
        Tribunator.Utils.el('div', { className: 'empty-state-icon', textContent: '📅' }),
        Tribunator.Utils.el('div', { className: 'empty-state-text', textContent: t('time.noDays') })
      ]));
    } else {
      // Summary
      wrapper.appendChild(Tribunator.Utils.el('div', {
        style: { marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' },
        textContent: days.length + ' ' + t('time.dayCount')
      }));

      // Days table
      var table = Tribunator.Utils.el('table', { className: 'room-list-table' });
      var thead = Tribunator.Utils.el('thead');
      var headerRow = Tribunator.Utils.el('tr');
      [t('time.date'), t('time.startTime'), t('time.endTime'), t('common.actions')].forEach(function(h) {
        headerRow.appendChild(Tribunator.Utils.el('th', { textContent: h }));
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      var tbody = Tribunator.Utils.el('tbody');
      days.forEach(function(day) {
        var tr = Tribunator.Utils.el('tr');
        tr.appendChild(Tribunator.Utils.el('td', {
          style: { fontWeight: '500' },
          textContent: Tribunator.Time.formatDate(day.date)
        }));
        tr.appendChild(Tribunator.Utils.el('td', { textContent: day.startTime }));
        tr.appendChild(Tribunator.Utils.el('td', { textContent: day.endTime }));

        var actions = Tribunator.Utils.el('td');
        actions.appendChild(Tribunator.Utils.el('button', {
          className: 'btn btn-sm',
          textContent: t('common.edit'),
          style: { marginRight: '4px' },
          onClick: function() { Tribunator.Time.promptEditDay(day.id); }
        }));
        actions.appendChild(Tribunator.Utils.el('button', {
          className: 'btn btn-sm',
          textContent: t('common.delete'),
          onClick: function() { Tribunator.Time.promptDeleteDay(day.id); }
        }));
        tr.appendChild(actions);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrapper.appendChild(table);
    }

    container.appendChild(wrapper);
  },

  promptAddDay: function() {
    var self = this;
    var today = new Date().toISOString().split('T')[0];

    var dateInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'date', value: today });
    var startInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'time', value: '08:00' });
    var endInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'time', value: '21:00' });

    Tribunator.Utils.showModal({
      title: t('time.addDay'),
      body: Tribunator.Utils.el('div', {}, [
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.date') }),
          dateInput
        ]),
        Tribunator.Utils.el('div', { className: 'form-inline' }, [
          Tribunator.Utils.el('div', { className: 'form-group' }, [
            Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.startTime') }),
            startInput
          ]),
          Tribunator.Utils.el('div', { className: 'form-group' }, [
            Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.endTime') }),
            endInput
          ])
        ])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.create'),
          className: 'btn-primary',
          action: function() {
            var date = dateInput.value;
            if (date) {
              Tribunator.Store.addDay({
                date: date,
                startTime: startInput.value || '08:00',
                endTime: endInput.value || '21:00'
              });
              self.render();
            }
          }
        }
      ]
    });
  },

  promptEditDay: function(id) {
    var self = this;
    var day = Tribunator.Store.getDay(id);
    if (!day) return;

    var dateInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'date', value: day.date });
    var startInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'time', value: day.startTime });
    var endInput = Tribunator.Utils.el('input', { className: 'form-input', type: 'time', value: day.endTime });

    Tribunator.Utils.showModal({
      title: t('time.editDay'),
      body: Tribunator.Utils.el('div', {}, [
        Tribunator.Utils.el('div', { className: 'form-group' }, [
          Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.date') }),
          dateInput
        ]),
        Tribunator.Utils.el('div', { className: 'form-inline' }, [
          Tribunator.Utils.el('div', { className: 'form-group' }, [
            Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.startTime') }),
            startInput
          ]),
          Tribunator.Utils.el('div', { className: 'form-group' }, [
            Tribunator.Utils.el('label', { className: 'form-label', textContent: t('time.endTime') }),
            endInput
          ])
        ])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        {
          text: t('common.save'),
          className: 'btn-primary',
          action: function() {
            Tribunator.Store.updateDay(id, {
              date: dateInput.value,
              startTime: startInput.value,
              endTime: endInput.value
            });
            self.render();
          }
        }
      ]
    });
  },

  promptDeleteDay: function(id) {
    var self = this;
    var refs = Tribunator.Store.getDayReferences(id);
    var msg = t('time.confirmDeleteDay');
    if (refs.length > 0) {
      msg += '\n\n⚠ ' + t('verify.dayHasRefs') + ':\n' + refs.map(function(r) { return r.tribunal + ' (' + r.slots + ' ' + t('tribunals.timeSlots') + ')'; }).join('\n');
    }
    Tribunator.Utils.showConfirm(msg, function() {
      Tribunator.Store.deleteDay(id);
      self.render();
    });
  },

  handleImport: function(e) {
    var self = this;
    var file = e.target.files[0];
    if (!file) return;
    Tribunator.Utils.readFile(file, function(err, content) {
      if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
      var store = Tribunator.Store;
      if (store.getDays().length > 0) {
        Tribunator.Utils.showImportDialog(
          function() { var r = store.importData(content, 'replace'); if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); self.render(); } else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); } },
          function() { var r = store.importData(content, 'merge'); if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); self.render(); } else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); } }
        );
      } else {
        var r = store.importData(content, 'replace');
        if (r.success) { Tribunator.Utils.showToast(t('export.importSuccess')); self.render(); }
        else { Tribunator.Utils.showToast(t('export.' + r.error), 'error'); }
      }
    });
    e.target.value = '';
  },

  formatDate: function(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    var lang = Tribunator.i18n.currentLang;
    var date = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var locale = lang === 'va' ? 'ca' : lang === 'es' ? 'es-ES' : 'en-GB';
    try {
      return date.toLocaleDateString(locale, options);
    } catch (e) {
      return dateStr;
    }
  }
};

window.Tribunator = window.Tribunator || {};

Tribunator.Templates = {
  selectedId: null,

  init: function() {},

  render: function() {
    var container = document.getElementById('phase-templates');
    Tribunator.Utils.clearElement(container);
    container.className = 'phase-content active';
    container.style.display = 'flex';

    var sidebar = Tribunator.Utils.el('div', { className: 'sidebar', id: 'templates-sidebar' });
    var main = Tribunator.Utils.el('div', { className: 'main-area', id: 'templates-main' });
    container.appendChild(sidebar);
    container.appendChild(main);
    this.renderSidebar();
    this.renderMain();
  },

  renderSidebar: function() {
    var sidebar = document.getElementById('templates-sidebar');
    Tribunator.Utils.clearElement(sidebar);
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var templates = store.getActivityTemplates();

    var section = el('div', { className: 'sidebar-section' });
    section.appendChild(el('div', { className: 'sidebar-header' }, [
      t('templates.title'),
      el('button', { className: 'btn-icon', textContent: '+', title: t('templates.add'), onClick: function() { self.promptAddTemplate(); } })
    ]));

    templates.forEach(function(tmpl) {
      var isActive = tmpl.id === self.selectedId;
      var item = el('div', {
        className: 'sidebar-item' + (isActive ? ' active' : ''),
        onClick: function(e) {
          if (e.target.closest('.sidebar-item-actions') || e.target.type === 'checkbox') return;
          self.selectedId = tmpl.id;
          self.renderSidebar();
          self.renderMain();
        }
      }, [
        el('input', { type: 'checkbox', style: { marginRight: '6px', cursor: 'pointer' }, onClick: function(e) {
          e.stopPropagation();
          store.toggleTemplate(tmpl.id);
          self.renderSidebar();
        }}),
        el('span', { className: 'sidebar-item-name', style: { opacity: tmpl.enabled ? '1' : '0.4' }, textContent: tmpl.label }),
        el('div', { className: 'sidebar-item-actions' }, [
          el('button', { className: 'btn-icon btn-sm', textContent: '×', onClick: function(e) {
            e.stopPropagation();
            Tribunator.Utils.showConfirm(t('common.confirm'), function() {
              var tmpls = store.getActivityTemplates().filter(function(t) { return t.id !== tmpl.id; });
              store.setActivityTemplates(tmpls);
              if (self.selectedId === tmpl.id) self.selectedId = null;
              self.renderSidebar(); self.renderMain();
            });
          }})
        ])
      ]);
      var cb = item.querySelector('input[type=checkbox]');
      cb.checked = tmpl.enabled;
      section.appendChild(item);
    });

    sidebar.appendChild(section);

    // Reset button
    var resetSection = el('div', { className: 'sidebar-section' });
    // Export/Import
    var ioSection = el('div', { className: 'sidebar-section' });
    ioSection.appendChild(el('div', { style: { padding: '8px 16px', display: 'flex', gap: '4px', flexWrap: 'wrap' } }, [
      el('button', { className: 'btn btn-sm', style: { flex: '1' }, textContent: t('common.export'), onClick: function() {
        var data = JSON.stringify(store.getActivityTemplates(), null, 2);
        Tribunator.Utils.downloadFile(data, 'tribunator-plantillas.json');
        Tribunator.Utils.showToast(t('export.exportSuccess'));
      }}),
      el('button', { className: 'btn btn-sm', style: { flex: '1' }, textContent: t('common.import'), onClick: function() { self.promptImportTemplates(); }}),
    ]));
    sidebar.appendChild(ioSection);

    // Reset
    resetSection.appendChild(el('div', { style: { padding: '8px 16px' } }, [
      el('button', { className: 'btn btn-sm', style: { width: '100%' }, textContent: t('templates.reset'), onClick: function() {
        Tribunator.Utils.showConfirm(t('templates.resetConfirm'), function() {
          store.resetActivityTemplates();
          self.selectedId = null;
          self.renderSidebar(); self.renderMain();
        });
      }})
    ]));
    sidebar.appendChild(resetSection);

    // Source reference
    sidebar.appendChild(el('div', { style: { padding: '8px 16px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5' } }, [
      document.createTextNode(t('templates.sourceNote') + ' '),
      el('a', { href: 'https://jlmirallesb.github.io/legis_cpmdem/es/ley/orden-8-2026/', target: '_blank', style: { color: 'var(--primary)' }, textContent: 'Orden 8/2026' })
    ]));
  },

  renderMain: function() {
    var main = document.getElementById('templates-main');
    Tribunator.Utils.clearElement(main);
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;

    if (!this.selectedId) {
      main.appendChild(el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-state-icon', textContent: '☰' }),
        el('div', { className: 'empty-state-text', textContent: t('templates.selectHint') })
      ]));
      return;
    }

    var tmpl = store.getActivityTemplates().find(function(t) { return t.id === this.selectedId; }.bind(this));
    if (!tmpl) return;

    // Header
    main.appendChild(el('div', { className: 'main-area-header' }, [
      el('div', { className: 'main-area-title', textContent: tmpl.label }),
      el('div', { className: 'main-area-actions' }, [
        el('span', { className: tmpl.enabled ? 'status-badge free' : 'status-badge assigned', textContent: tmpl.enabled ? t('templates.enabled') : t('templates.disabled') })
      ])
    ]));

    // Levels
    if (tmpl.levels && tmpl.levels.length > 0) {
      main.appendChild(el('div', { style: { marginBottom: '12px', fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('templates.appliesTo') + ': ' + tmpl.levels.join(', ') }));
    }

    // Required parts
    if (tmpl.requiredParts) {
      main.appendChild(el('div', { style: { marginBottom: '16px', fontSize: '12px' } }, [
        el('span', { style: { fontWeight: '600' }, textContent: t('templates.requiredParts') + ': ' }),
        document.createTextNode(tmpl.requiredParts.join(', '))
      ]));
    }

    // Tree view
    var self = this;
    var renderTree = function(nodes, depth) {
      var container = el('div', { style: { marginLeft: (depth * 16) + 'px' } });
      nodes.forEach(function(node) {
        var hasChildren = node.children && node.children.length > 0;
        var specialtyNote = '';
        if (node.onlyFor) specialtyNote = ' [solo: ' + node.onlyFor.join(', ') + ']';
        if (node.excludeFor) specialtyNote = ' [excluye: ' + node.excludeFor.join(', ') + ']';

        var nodeEl = el('div', { style: { padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' } }, [
          el('span', { style: { fontWeight: hasChildren ? '600' : '400' }, textContent: (hasChildren ? '▸ ' : '  ') + node.label }),
          specialtyNote ? el('span', { style: { fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }, textContent: specialtyNote }) : null
        ].filter(Boolean));
        container.appendChild(nodeEl);

        if (hasChildren) {
          container.appendChild(renderTree(node.children, depth + 1));
        }
      });
      return container;
    };

    main.appendChild(el('div', { className: 'panel' }, [
      el('div', { className: 'panel-header', textContent: t('templates.structure') }),
      el('div', { className: 'panel-body', style: { padding: '0' } }, [renderTree(tmpl.children, 0)])
    ]));

    // Preview: filtered for a specific specialty
    main.appendChild(el('div', { style: { marginTop: '16px' } }, [
      el('label', { className: 'form-label', textContent: t('templates.previewSpecialty') })
    ]));

    var specSelect = el('select', { className: 'form-select', style: { maxWidth: '300px', marginBottom: '12px' } });
    specSelect.appendChild(el('option', { value: '', textContent: '— ' + t('common.all') + ' —' }));
    Tribunator.Tribunals._specialties.forEach(function(s) {
      specSelect.appendChild(el('option', { value: s, textContent: s }));
    });

    var previewArea = el('div');

    specSelect.addEventListener('change', function() {
      Tribunator.Utils.clearElement(previewArea);
      if (!specSelect.value) return;
      var filtered = store.filterTemplateForSpecialty(tmpl, specSelect.value);
      previewArea.appendChild(el('div', { className: 'panel', style: { background: 'var(--bg-secondary)' } }, [
        el('div', { className: 'panel-header', textContent: tmpl.label + ' — ' + specSelect.value }),
        el('div', { className: 'panel-body', style: { padding: '0' } }, [renderTree(filtered.children, 0)])
      ]));
    });

    main.appendChild(specSelect);
    main.appendChild(previewArea);
  },

  promptAddTemplate: function() {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var labelIn = el('input', { className: 'form-input', type: 'text', placeholder: t('templates.templateName') });

    Tribunator.Utils.showModal({
      title: t('templates.add'),
      body: el('div', { className: 'form-group' }, [
        el('label', { className: 'form-label', textContent: t('common.name') }),
        labelIn
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('common.create'), className: 'btn-primary', action: function() {
          var name = labelIn.value.trim();
          if (!name) return;
          var templates = store.getActivityTemplates();
          templates.push({
            id: Tribunator.Store.generateId(),
            label: name,
            enabled: true,
            levels: [],
            requiredParts: [],
            children: []
          });
          store.setActivityTemplates(templates);
          self.selectedId = templates[templates.length - 1].id;
          self.renderSidebar();
          self.renderMain();
        }}
      ]
    });
    setTimeout(function() { labelIn.focus(); }, 100);
  },

  promptImportTemplates: function() {
    var self = this;
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var fileInput = el('input', { type: 'file', accept: '.json', className: 'form-input' });

    Tribunator.Utils.showModal({
      title: t('common.import') + ' — ' + t('templates.title'),
      body: el('div', {}, [
        el('p', { style: { fontSize: '13px', marginBottom: '12px' }, textContent: t('templates.importHint') }),
        el('div', { className: 'form-group' }, [fileInput])
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('export.importReplace'), className: 'btn-danger', action: function() {
          if (!fileInput.files[0]) return;
          Tribunator.Utils.readFile(fileInput.files[0], function(err, content) {
            if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
            try {
              var imported = JSON.parse(content);
              if (!Array.isArray(imported)) throw new Error();
              store.setActivityTemplates(imported);
              self.selectedId = null;
              self.renderSidebar(); self.renderMain();
              Tribunator.Utils.showToast(t('export.importSuccess'));
            } catch (e) { Tribunator.Utils.showToast(t('export.formatError'), 'error'); }
          });
        }},
        { text: t('export.importMerge'), className: 'btn-primary', action: function() {
          if (!fileInput.files[0]) return;
          Tribunator.Utils.readFile(fileInput.files[0], function(err, content) {
            if (err) { Tribunator.Utils.showToast(err, 'error'); return; }
            try {
              var imported = JSON.parse(content);
              if (!Array.isArray(imported)) throw new Error();
              var current = store.getActivityTemplates();
              imported.forEach(function(tmpl) {
                var exists = current.find(function(c) { return c.id === tmpl.id || c.label === tmpl.label; });
                if (!exists) {
                  if (!tmpl.id) tmpl.id = Tribunator.Store.generateId();
                  current.push(tmpl);
                }
              });
              store.setActivityTemplates(current);
              self.renderSidebar(); self.renderMain();
              Tribunator.Utils.showToast(t('export.importSuccess'));
            } catch (e) { Tribunator.Utils.showToast(t('export.formatError'), 'error'); }
          });
        }}
      ]
    });
  }
};

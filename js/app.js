window.Tribunator = window.Tribunator || {};

Tribunator.App = {
  currentPhase: 'dashboard',

  init: function() {
    Tribunator.i18n.init();
    Tribunator.Store.init();
    Tribunator.Space.init();
    Tribunator.Time.init();
    Tribunator.Templates.init();
    Tribunator.Tribunals.init();
    this.render();
    this._initUndoRedo();
  },

  _initUndoRedo: function() {
    var self = this;
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        self.doUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        self.doRedo();
      }
    });
  },

  doUndo: function() {
    if (Tribunator.Store.undo()) {
      Tribunator.Utils.showToast('Undo', 'success');
      this._refreshAfterUndoRedo();
    }
  },

  doRedo: function() {
    if (Tribunator.Store.redo()) {
      Tribunator.Utils.showToast('Redo', 'success');
      this._refreshAfterUndoRedo();
    }
  },

  _refreshAfterUndoRedo: function() {
    Tribunator.Space.currentCampusId = null;
    Tribunator.Space.currentFloorId = null;
    Tribunator.Space.editingRoomId = null;
    Tribunator.Space.selectedCells = [];
    var active = Tribunator.Store.getActiveSolution();
    if (active) Tribunator.Tribunals.currentSolutionId = active.id;
    else { Tribunator.Tribunals.currentSolutionId = null; Tribunator.Tribunals.currentTribunalId = null; }
    this.render();
    this.renderCurrentPhase();
  },

  render: function() {
    this.renderHeader();
    this.renderBody();
    this.renderFooter();
  },

  renderHeader: function() {
    var header = document.getElementById('app-header');
    Tribunator.Utils.clearElement(header);
    var self = this;

    var left = Tribunator.Utils.el('div', { className: 'app-header-left' });
    left.appendChild(Tribunator.Utils.el('img', { src: 'logo.svg', alt: 'Tribunator', style: { width: '28px', height: '28px', imageRendering: 'pixelated' } }));
    left.appendChild(Tribunator.Utils.el('div', { className: 'app-title' }, [
      'Tribunator',
      Tribunator.Utils.el('span', { className: 'app-version', textContent: ' v1.2.5' })
    ]));

    // Phase nav
    var nav = Tribunator.Utils.el('div', { className: 'phase-nav' });
    var phases = ['dashboard', 'space', 'time', 'templates', 'tribunals', 'verify'];
    phases.forEach(function(phase) {
      nav.appendChild(Tribunator.Utils.el('button', {
        className: 'phase-btn' + (self.currentPhase === phase ? ' active' : ''),
        textContent: t('app.phases.' + phase),
        onClick: function() { self.setPhase(phase); }
      }));
    });
    left.appendChild(nav);
    header.appendChild(left);

    var right = Tribunator.Utils.el('div', { className: 'app-header-right' });

    // Undo/Redo
    right.appendChild(Tribunator.Utils.el('button', {
      className: 'btn-icon',
      style: { color: Tribunator.Store.canUndo() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontSize: '14px' },
      title: 'Undo (Ctrl+Z)',
      textContent: '↶',
      onClick: function() { self.doUndo(); }
    }));
    right.appendChild(Tribunator.Utils.el('button', {
      className: 'btn-icon',
      style: { color: Tribunator.Store.canRedo() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontSize: '14px' },
      title: 'Redo (Ctrl+Shift+Z)',
      textContent: '↷',
      onClick: function() { self.doRedo(); }
    }));

    // Load demo button
    right.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm',
      style: { color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: '11px' },
      textContent: t('app.loadDemo'),
      onClick: function() { self.loadDemo(); }
    }));

    // Changelog button
    right.appendChild(Tribunator.Utils.el('button', {
      className: 'btn btn-sm',
      style: { color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: '11px' },
      title: t('app.changelog'),
      textContent: t('app.checkVersion'),
      onClick: function() { self.showChangelog(); }
    }));

    // Language selector
    var langSelect = Tribunator.Utils.el('select', {
      className: 'lang-select',
      onChange: function() {
        Tribunator.i18n.setLanguage(langSelect.value);
        self.render();
        self.renderCurrentPhase();
      }
    });
    [
      { value: 'es', label: 'ES' },
      { value: 'va', label: 'VA' },
      { value: 'en', label: 'EN' }
    ].forEach(function(lang) {
      var opt = Tribunator.Utils.el('option', { value: lang.value, textContent: lang.label });
      if (lang.value === Tribunator.i18n.currentLang) opt.selected = true;
      langSelect.appendChild(opt);
    });
    right.appendChild(langSelect);

    header.appendChild(right);
  },

  renderBody: function() {
    var body = document.getElementById('app-body');
    Tribunator.Utils.clearElement(body);

    var dashContainer = Tribunator.Utils.el('div', {
      id: 'phase-dashboard',
      className: 'phase-content' + (this.currentPhase === 'dashboard' ? ' active' : '')
    });
    var spaceContainer = Tribunator.Utils.el('div', {
      id: 'phase-space',
      className: 'phase-content' + (this.currentPhase === 'space' ? ' active' : '')
    });
    var timeContainer = Tribunator.Utils.el('div', {
      id: 'phase-time',
      className: 'phase-content' + (this.currentPhase === 'time' ? ' active' : '')
    });
    var templatesContainer = Tribunator.Utils.el('div', {
      id: 'phase-templates',
      className: 'phase-content' + (this.currentPhase === 'templates' ? ' active' : '')
    });
    var tribunalsContainer = Tribunator.Utils.el('div', {
      id: 'phase-tribunals',
      className: 'phase-content' + (this.currentPhase === 'tribunals' ? ' active' : '')
    });

    var verifyContainer = Tribunator.Utils.el('div', {
      id: 'phase-verify',
      className: 'phase-content' + (this.currentPhase === 'verify' ? ' active' : '')
    });

    body.appendChild(dashContainer);
    body.appendChild(spaceContainer);
    body.appendChild(timeContainer);
    body.appendChild(templatesContainer);
    body.appendChild(tribunalsContainer);
    body.appendChild(verifyContainer);

    this.renderCurrentPhase();
  },

  renderCurrentPhase: function() {
    if (this.currentPhase === 'dashboard') {
      Tribunator.Dashboard.render();
    } else if (this.currentPhase === 'space') {
      Tribunator.Space.render();
    } else if (this.currentPhase === 'time') {
      Tribunator.Time.render();
    } else if (this.currentPhase === 'templates') {
      Tribunator.Templates.render();
    } else if (this.currentPhase === 'tribunals') {
      Tribunator.Tribunals.render();
    } else if (this.currentPhase === 'verify') {
      Tribunator.Verify.render();
    }
  },

  renderFooter: function() {
    var footer = document.getElementById('app-footer');
    Tribunator.Utils.clearElement(footer);

    footer.appendChild(Tribunator.Utils.el('a', {
      href: 'https://github.com/JLMirallesB/tribunator',
      target: '_blank',
      textContent: 'Tribunator'
    }));
    footer.appendChild(document.createTextNode(' ' + t('app.footer.designedBy') + ' '));
    footer.appendChild(Tribunator.Utils.el('a', {
      href: 'https://www.jlmirall.es',
      target: '_blank',
      textContent: 'José Luis Miralles'
    }));
    footer.appendChild(document.createTextNode(' ' + t('app.footer.withHelp') + ' '));
    footer.appendChild(document.createTextNode(t('app.footer.coffee') + ' '));
    footer.appendChild(Tribunator.Utils.el('a', {
      href: 'https://ko-fi.com/miralles',
      target: '_blank',
      textContent: '☕'
    }));
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(Tribunator.Utils.el('a', {
      href: 'mailto:joseluismirallesbono@gmail.com',
      textContent: t('app.footer.contact')
    }));
  },

  loadDemo: function() {
    var self = this;
    var el = Tribunator.Utils.el;
    Tribunator.Utils.showModal({
      title: t('app.loadDemo'),
      body: el('div', {}, [
        el('p', { style: { marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: 'var(--danger)' }, textContent: t('app.demoWarning') }),
        el('p', { style: { fontSize: '12px', color: 'var(--text-muted)' }, textContent: t('app.demoDesc') })
      ]),
      buttons: [
        { text: t('common.cancel'), className: 'btn-secondary' },
        { text: t('app.loadDemo'), className: 'btn-danger', close: false, action: function() {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'demo.json', true);
          xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 0) {
              var result = Tribunator.Store.importData(xhr.responseText, 'replace');
              if (result.success) {
                Tribunator.Utils.showToast(t('export.importSuccess'));
                Tribunator.Space.currentCampusId = null;
                Tribunator.Space.currentFloorId = null;
                Tribunator.Tribunals.currentSolutionId = null;
                Tribunator.Tribunals.currentTribunalId = null;
                var active = Tribunator.Store.getActiveSolution();
                if (active) Tribunator.Tribunals.currentSolutionId = active.id;
                self.render();
                self.renderCurrentPhase();
              } else {
                Tribunator.Utils.showToast(t('export.formatError'), 'error');
              }
            } else {
              Tribunator.Utils.showToast(t('export.fileError'), 'error');
            }
            document.querySelector('.modal-overlay').remove();
          };
          xhr.onerror = function() { Tribunator.Utils.showToast(t('export.fileError'), 'error'); };
          xhr.send();
        }}
      ]
    });
  },

  setPhase: function(phase) {
    this.currentPhase = phase;
    this.renderHeader();
    this.renderBody();
  },

  showChangelog: function() {
    var el = Tribunator.Utils.el;
    var currentVersion = Tribunator.Store.VERSION;
    var entries = [
      {
        version: '1.2.5',
        date: '2026-06-08',
        changes: {
          es: ['Conflictos de franja se muestran debajo del slot en fila propia'],
          va: ['Conflictes de franja es mostren davall del slot en fila pròpia'],
          en: ['Slot conflicts shown below the slot in a dedicated row']
        }
      },
      {
        version: '1.2.4',
        date: '2026-06-08',
        changes: {
          es: [
            'PDF Directorio: nota al pie con nombre del titular para sustitutos',
            'PDF Planos: selección de múltiples días con fecha en cada página',
            'PDF Cartelería: selección de múltiples días con fecha en cada página'
          ],
          va: [
            'PDF Directori: nota al peu amb nom del titular per a substituts',
            'PDF Plànols: selecció de múltiples dies amb data a cada pàgina',
            'PDF Cartelleria: selecció de múltiples dies amb data a cada pàgina'
          ],
          en: [
            'PDF Directory: footnote with titular name for substitutes',
            'PDF Floor plans: multi-day selection with date on each page',
            'PDF Room signs: multi-day selection with date on each page'
          ]
        }
      },
      {
        version: '1.2.3',
        date: '2026-06-06',
        changes: {
          es: ['Exportar para Listados: JSON simplificado con tribunales y variaciones'],
          va: ['Exportar per a Llistats: JSON simplificat amb tribunals i variacions'],
          en: ['Export for Listings: simplified JSON with tribunals and variations']
        }
      },
      {
        version: '1.2.2',
        date: '2026-06-06',
        changes: {
          es: [
            'Dashboard: carga de miembros muestra tribunales únicos, no participaciones duplicadas',
            'Dashboard: buscador de candidatos con filtro por especialidad y nombre',
            'Dashboard: esquema diario de pruebas con agrupación por actividades',
            'PDF: nuevo tipo "Directorio" con listado alfabético de miembros y sus asignaciones',
            'PDF: cabeceras optimizadas para impresión (fondo gris claro + barra lateral)',
            'PDF: campo libre de texto solo se muestra en el tipo Tribunales'
          ],
          va: [
            'Dashboard: càrrega de membres mostra tribunals únics, no participacions duplicades',
            'Dashboard: cercador de candidats amb filtre per especialitat i nom',
            'Dashboard: esquema diari de proves amb agrupació per activitats',
            'PDF: nou tipus "Directori" amb llistat alfabètic de membres i les seues assignacions',
            'PDF: capçaleres optimitzades per a impressió (fons gris clar + barra lateral)',
            'PDF: camp lliure de text només es mostra en el tipus Tribunals'
          ],
          en: [
            'Dashboard: member load shows unique tribunals, not duplicate participations',
            'Dashboard: candidate search with specialty and name filter',
            'Dashboard: daily exam overview with activity grouping',
            'PDF: new "Directory" type with alphabetical member listing and assignments',
            'PDF: headers optimized for printing (light gray background + sidebar accent)',
            'PDF: custom text field only shown for Tribunals type'
          ]
        }
      },
      {
        version: '1.2.1',
        date: '2026-06-04',
        changes: {
          es: [
            'Conflictos no bloqueantes: ahora ambas franjas deben ser no bloqueantes para reducir a info',
            'Deduplicación de conflictos: conflictos bloqueantes y no bloqueantes se reportan por separado',
            'Roles en conflictos de variaciones: se muestra el rol correcto del miembro en la variación'
          ],
          va: [
            'Conflictes no bloquejants: ara ambdues franges han de ser no bloquejants per a reduir a info',
            'Deduplicació de conflictes: conflictes bloquejants i no bloquejants es reporten per separat',
            'Rols en conflictes de variacions: es mostra el rol correcte del membre en la variació'
          ],
          en: [
            'Non-blocking conflicts: both slots must now be non-blocking to downgrade to info',
            'Conflict deduplication: blocking and non-blocking conflicts reported separately',
            'Variation conflict roles: correct member role shown from variation data'
          ]
        }
      },
      {
        version: '1.2.0',
        date: '2026-06-04',
        changes: {
          es: [
            'Detección de conflictos de miembros ahora incluye variaciones de tribunal',
            'Verificación: miembros de variaciones comprobados en solapamientos de franjas',
            'getMemberConflicts: detecta si un candidato está en variaciones de otros tribunales'
          ],
          va: [
            'Detecció de conflictes de membres ara inclou variacions de tribunal',
            'Verificació: membres de variacions comprovats en solapaments de franges',
            'getMemberConflicts: detecta si un candidat està en variacions d\'altres tribunals'
          ],
          en: [
            'Member conflict detection now includes tribunal variations',
            'Verification: variation members checked for time slot overlaps',
            'getMemberConflicts: detects candidates in variations of other tribunals'
          ]
        }
      },
      {
        version: '1.1.3',
        date: '2026-06-03',
        changes: {
          es: ['PDF: botones Todos/Ninguno para selección rápida de días'],
          va: ['PDF: botons Tots/Cap per a selecció ràpida de dies'],
          en: ['PDF: All/None toggle buttons for quick day selection']
        }
      },
      {
        version: '1.1.2',
        date: '2026-06-03',
        changes: {
          es: [
            'Texto de publicación por solución: se guarda y se precarga en el PDF',
            'PDF: campo de texto adicional precargado desde la solución activa'
          ],
          va: [
            'Text de publicació per solució: es guarda i es precarrega en el PDF',
            'PDF: camp de text addicional precarregat des de la solució activa'
          ],
          en: [
            'Publish text per solution: saved and preloaded in PDF',
            'PDF: custom text field preloaded from active solution'
          ]
        }
      },
      {
        version: '1.1.1',
        date: '2026-06-03',
        changes: {
          es: [
            'PDF tribunales: cada tribunal empieza en página nueva',
            'Dashboard: variaciones incluidas en conteo de carga y candidatos sin tribunal',
            'Dashboard: tooltip en miembros mostrando en qué tribunales y variaciones participan'
          ],
          va: [
            'PDF tribunals: cada tribunal comença en pàgina nova',
            'Dashboard: variacions incloses en comptatge de càrrega i candidats sense tribunal',
            'Dashboard: tooltip en membres mostrant en quins tribunals i variacions participen'
          ],
          en: [
            'PDF tribunals: each tribunal starts on a new page',
            'Dashboard: variations included in load count and unused candidates',
            'Dashboard: tooltip on members showing which tribunals and variations they belong to'
          ]
        }
      },
      {
        version: '1.1.0',
        date: '2026-06-03',
        changes: {
          es: [
            'Campo "Información para publicar" en cada tribunal (aparece en PDF)',
            'Franjas horarias ordenadas automáticamente (pruebas antes que no-bloqueantes)',
            'Hora fin del día seleccionable como hora de fin de franja',
            'Miembros de tribunal reordenables con ↑↓',
            'Variaciones: rol editable y miembros reordenables con ↑↓',
            'Mover todas las franjas de un día a otro con selector',
            'Candidatos ocupados marcados en gris al añadir miembro o variación',
            'Conflictos de franja inline: fondo coloreado en la misma fila',
            'Menú contextual ⋯ con posición fija (no se corta por overflow)',
            'Dashboard: candidatos sin tribunal y lista completa de carga',
            'Dashboard: panel de importar/exportar general',
            'Cartelería PDF: solo muestra franjas que ocurren en el aula'
          ],
          va: [
            'Camp "Informació per a publicar" en cada tribunal (apareix en PDF)',
            'Franges horàries ordenades automàticament (proves abans que no-bloquejants)',
            'Hora fi del dia seleccionable com a hora de fi de franja',
            'Membres de tribunal reordenables amb ↑↓',
            'Variacions: rol editable i membres reordenables amb ↑↓',
            'Moure totes les franges d\'un dia a un altre amb selector',
            'Candidats ocupats marcats en gris al afegir membre o variació',
            'Conflictes de franja inline: fons acolorit en la mateixa fila',
            'Menú contextual ⋯ amb posició fixa (no es talla per overflow)',
            'Dashboard: candidats sense tribunal i llista completa de càrrega',
            'Dashboard: panell d\'importar/exportar general',
            'Cartelleria PDF: només mostra franges que ocorren en l\'aula'
          ],
          en: [
            'Publish notes field for each tribunal (shown in PDF)',
            'Time slots auto-sorted (exams before non-blocking)',
            'Day end time selectable as slot end time',
            'Tribunal members reorderable with ↑↓',
            'Variations: editable role and reorderable members with ↑↓',
            'Move all slots from one day to another with selector',
            'Busy candidates shown in gray when adding member or variation',
            'Inline slot conflicts: colored background on same row',
            'Context menu ⋯ with fixed position (no overflow clipping)',
            'Dashboard: unused candidates and full member load list',
            'Dashboard: general import/export panel',
            'Room signs PDF: only shows slots that occur in that room'
          ]
        }
      },
      {
        version: '1.0.1',
        date: '2026-05-31',
        changes: {
          es: [
            'Actividades generales: Constitución del Tribunal y Llamamiento de Aspirantes',
            'Llamamiento de Aspirantes como actividad no bloqueante (info en vez de error)',
            'Verificación mejorada: detalle multi-línea con tribunal, hora, rol y actividad',
            'Conflictos de miembros: ahora compara franjas horarias reales, no solo el día',
            'Duplicar tribunal con un click (miembros, variaciones y horario)',
            'Menú contextual ⋯ en tribunales del sidebar (subir, bajar, duplicar, editar, eliminar)',
            'PDF: opción de mostrar/ocultar especialidad y franja completa',
            'Dashboard: exportar/importar general con todos los tipos',
            'Dashboard: botón de importar en la pantalla de bienvenida',
            'Espacio: sidebar solo exporta/importa espacios'
          ],
          va: [
            'Activitats generals: Constitució del Tribunal i Crida d\'Aspirants',
            'Crida d\'Aspirants com a activitat no bloquejant (info en lloc d\'error)',
            'Verificació millorada: detall multi-línia amb tribunal, hora, rol i activitat',
            'Conflictes de membres: ara compara franges horàries reals, no només el dia',
            'Duplicar tribunal amb un click (membres, variacions i horari)',
            'Menú contextual ⋯ en tribunals del sidebar (pujar, baixar, duplicar, editar, eliminar)',
            'PDF: opció de mostrar/ocultar especialitat i franja completa',
            'Dashboard: exportar/importar general amb tots els tipus',
            'Dashboard: botó d\'importar en la pantalla de benvinguda',
            'Espai: sidebar només exporta/importa espais'
          ],
          en: [
            'General activities: Tribunal Constitution and Candidate Roll Call',
            'Candidate Roll Call as non-blocking activity (info instead of error)',
            'Improved verification: multi-line detail with tribunal, time, role and activity',
            'Member conflicts: now compares actual time slots, not just the day',
            'Duplicate tribunal with one click (members, variations and schedule)',
            'Context menu ⋯ on sidebar tribunals (move up/down, duplicate, edit, delete)',
            'PDF: option to show/hide specialty and full time slot',
            'Dashboard: general export/import with all types',
            'Dashboard: import button on welcome screen',
            'Space: sidebar only exports/imports spaces'
          ]
        }
      },
      {
        version: '1.0.0',
        date: '2026-05-25',
        changes: {
          es: [
            'Dashboard de inicio con tarjetas resumen y estadísticas',
            'Aulas más usadas y miembros con más carga',
            'Errores pendientes con acceso directo a Verificación',
            'Pantalla de bienvenida para usuarios nuevos',
            'Undo/Redo con Ctrl+Z / Ctrl+Shift+Z y botones en el header',
            'PDF: 4 tipos — Tribunales, Planning diario, Planos, Cartelería',
            'PDF: planning diario con agenda por día ordenada cronológicamente',
            'PDF: planos con rejilla, bordes, ocupación y leyenda',
            'PDF: cartelería para puertas de aula (página completa o media)',
            'PDF: diálogo unificado con pestañas por tipo',
            'PDF: nombre de archivo personalizable',
            'PDF: sustitutos con asterisco y nota al pie sobre titulares',
            'Tribunales colapsables en sidebar',
            'Etiquetas de plantilla con curso primero (1 EPM en vez de EPM 1r)',
            'Secciones colapsables en sidebars con cabeceras oscuras'
          ],
          va: [
            'Dashboard d\'inici amb targetes resum i estadístiques',
            'Aules més usades i membres amb més càrrega',
            'Errors pendents amb accés directe a Verificació',
            'Pantalla de benvinguda per a usuaris nous',
            'Undo/Redo amb Ctrl+Z / Ctrl+Shift+Z i botons al header',
            'PDF: 4 tipus — Tribunals, Planning diari, Plànols, Cartelleria',
            'PDF: planning diari amb agenda per dia ordenada cronològicament',
            'PDF: plànols amb graella, vores, ocupació i llegenda',
            'PDF: cartelleria per a portes d\'aula (pàgina completa o mitja)',
            'PDF: diàleg unificat amb pestanyes per tipus',
            'PDF: nom d\'arxiu personalitzable',
            'PDF: substituts amb asterisc i nota al peu sobre titulars',
            'Tribunals col·lapsables al sidebar',
            'Etiquetes de plantilla amb curs primer (1 EPM en lloc d\'EPM 1r)',
            'Seccions col·lapsables en sidebars amb capçaleres fosques'
          ],
          en: [
            'Dashboard with summary cards and statistics',
            'Most used rooms and members with highest load',
            'Pending errors with direct link to Verification',
            'Welcome screen for new users',
            'Undo/Redo with Ctrl+Z / Ctrl+Shift+Z and header buttons',
            'PDF: 4 types — Tribunals, Daily planning, Floor plans, Room signs',
            'PDF: daily planning with chronological agenda per day',
            'PDF: floor plans with grid, borders, occupation and legend',
            'PDF: room signs for doors (full page or half page)',
            'PDF: unified dialog with tabs per type',
            'PDF: customizable file name',
            'PDF: substitutes with asterisk and footnote about titulars',
            'Tribunals collapsible in sidebar',
            'Template labels with course first (1 EPM instead of EPM 1r)',
            'Collapsible sections in sidebars with dark headers'
          ]
        }
      },
      {
        version: '0.3.0',
        date: '2026-05-25',
        changes: {
          es: [
            'PDF: nombre de archivo personalizable con botón para copiar del título',
            'Tribunales colapsables en el sidebar con contador',
            'Demo: corregidas actividades con "Música" redundante'
          ],
          va: [
            'PDF: nom d\'arxiu personalitzable amb botó per a copiar del títol',
            'Tribunals col·lapsables al sidebar amb comptador',
            'Demo: corregides activitats amb "Música" redundant'
          ],
          en: [
            'PDF: customizable file name with button to copy from title',
            'Tribunals collapsible in sidebar with counter',
            'Demo: fixed activities with redundant "Música"'
          ]
        }
      },
      {
        version: '0.3.0',
        date: '2026-05-25',
        changes: {
          es: [
            'PDF rediseñado con tablas reales (jsPDF-AutoTable)',
            'PDF: franja negra con nombre del tribunal en blanco',
            'PDF: sustitutos con asterisco y nota al pie sobre titulares',
            'PDF: color principal configurable (escala de grises por defecto)',
            'PDF: selección de roles a imprimir',
            'PDF: opción de mostrar titular entre paréntesis',
            'PDF: horario ordenado cronológicamente',
            'Sidebar rediseñado: cabeceras con fondo oscuro',
            'Secciones colapsables: Agrupaciones, Campos, Roles, Exportar/Importar',
            'Tribunales: ordenación manual (↑↓) y alfabética (A↓)',
            'Tribunales: indicador simplificado (solo ⚠ si hay problemas)',
            'Demo: planos en forma de L, variaciones, tribunales multi-día',
            'Botón Cargar ejemplo con datos de demo',
            'Presidente/a, Vocal y Secretario/a como roles requeridos',
            'Enlace de contacto en el footer',
            'Cache-busting para evitar versiones cacheadas'
          ],
          va: [
            'PDF redissenyat amb taules reals (jsPDF-AutoTable)',
            'PDF: franja negra amb nom del tribunal en blanc',
            'PDF: substituts amb asterisc i nota al peu sobre titulars',
            'PDF: color principal configurable (escala de grisos per defecte)',
            'PDF: selecció de rols a imprimir',
            'PDF: opció de mostrar titular entre parèntesi',
            'PDF: horari ordenat cronològicament',
            'Sidebar redissenyat: capçaleres amb fons fosc',
            'Seccions col·lapsables: Agrupacions, Camps, Rols, Exportar/Importar',
            'Tribunals: ordenació manual (↑↓) i alfabètica (A↓)',
            'Tribunals: indicador simplificat (només ⚠ si hi ha problemes)',
            'Demo: plànols en forma de L, variacions, tribunals multi-dia',
            'Botó Carregar exemple amb dades de demo',
            'President/a, Vocal i Secretari/a com a rols requerits',
            'Enllaç de contacte al footer',
            'Cache-busting per a evitar versions cacheades'
          ],
          en: [
            'PDF redesigned with real tables (jsPDF-AutoTable)',
            'PDF: dark band with tribunal name in white',
            'PDF: substitutes with asterisk and footnote about titulars',
            'PDF: configurable accent color (grayscale by default)',
            'PDF: role selection for printing',
            'PDF: option to show titular in parentheses',
            'PDF: schedule sorted chronologically',
            'Sidebar redesigned: dark background headers',
            'Collapsible sections: Groups, Fields, Roles, Export/Import',
            'Tribunals: manual ordering (↑↓) and alphabetical sort (A↓)',
            'Tribunals: simplified indicator (only ⚠ if issues)',
            'Demo: L-shaped plans, variations, multi-day tribunals',
            'Load example button with demo data',
            'President, Member and Secretary as required roles',
            'Contact link in footer',
            'Cache-busting to prevent stale versions'
          ]
        }
      },
      {
        version: '0.2.0',
        date: '2026-05-25',
        changes: {
          es: [
            'Nueva fase Plantillas: gestión de estructuras de prueba entre Tiempo y Tribunales',
            'Plantillas de prueba precargadas para EEM y EPM de Música (8 plantillas)',
            'Activar/desactivar plantillas según las necesidades del centro',
            'Reglas por especialidad: subapartados que aplican o se excluyen según instrumento',
            'Selector de actividad con plantilla del tribunal priorizada y aviso si se sale',
            'Preview de plantilla filtrada por especialidad',
            'Validación de cobertura en 3 niveles: partes, subapartados y especialidad',
            'EPM 1r: Canto, Guitarra eléctrica y Bajo eléctrico sin lectura a primera vista',
            'Indicador de versión con enlace a comprobar actualizaciones'
          ],
          va: [
            'Nova fase Plantilles: gestió d\'estructures de prova entre Temps i Tribunals',
            'Plantilles de prova precargades per a EEM i EPM de Música (8 plantilles)',
            'Activar/desactivar plantilles segons les necessitats del centre',
            'Regles per especialitat: subapartats que apliquen o s\'excloguen segons instrument',
            'Selector d\'activitat amb plantilla del tribunal prioritzada i avís si se\'n ix',
            'Preview de plantilla filtrada per especialitat',
            'Validació de cobertura en 3 nivells: parts, subapartats i especialitat',
            'EPM 1r: Cant, Guitarra elèctrica i Baix elèctric sense lectura a primera vista',
            'Indicador de versió amb enllaç a comprovar actualitzacions'
          ],
          en: [
            'New Templates phase: exam structure management between Time and Tribunals',
            'Pre-loaded exam templates for EEM and EPM Music (8 templates)',
            'Enable/disable templates based on center needs',
            'Specialty rules: sub-sections that apply or are excluded per instrument',
            'Activity picker with tribunal template prioritized and warning if deviating',
            'Template preview filtered by specialty',
            'Coverage validation at 3 levels: parts, sub-sections and specialty',
            'EPM 1st: Canto, Electric Guitar and Electric Bass without sight-reading',
            'Version indicator with link to check for updates'
          ]
        }
      },
      {
        changes: {
          es: [
            'Orden de tabs: Horario primero, luego Miembros, luego Variaciones',
            'Filtro por especialidad al añadir miembros a tribunales',
            'Colores visuales para sustitutos (azul) y mutados a titular (amarillo) en tablas',
            'Descripción del aula visible al seleccionarla en el modal de asignación'
          ],
          va: [
            'Ordre de pestanyes: Horari primer, després Membres, després Variacions',
            'Filtre per especialitat al afegir membres a tribunals',
            'Colors visuals per a substituts (blau) i mutats a titular (groc) en taules',
            'Descripció de l\'aula visible al seleccionar-la al modal d\'assignació'
          ],
          en: [
            'Tab order: Schedule first, then Members, then Variations',
            'Specialty filter when adding tribunal members',
            'Visual colors for substitutes (blue) and titular-switched (yellow) in tables',
            'Room description visible when selecting in the assignment modal'
          ]
        }
      },
      {
        version: '0.1.1',
        date: '2026-05-25',
        changes: {
          es: [
            'Gestión de sustitutos y titulares: los candidatos pueden tener un titular asociado',
            'Mutación sustituto/titular: cambia quién actúa en el tribunal con un click',
            'Excel con 5 columnas: Apellidos, Nombre, Especialidad, Apellidos Titular, Nombre Titular',
            'Plantilla CSV descargable con las cabeceras correctas',
            'Pestaña de Verificación: auditoría completa de la solución activa',
            'Protección al borrar: aviso si un día, aula o candidato tiene referencias en tribunales',
            'Limpieza automática de referencias al borrar (slots, miembros)',
            'Validación de conflictos al editar franjas inline',
            'Aviso de conflicto de miembros al crear franjas y al añadir miembros',
            'Logo y favicon de la aplicación',
            'README con manual de uso completo'
          ],
          va: [
            'Gestió de substituts i titulars: els candidats poden tindre un titular associat',
            'Mutació substitut/titular: canvia qui actua en el tribunal amb un click',
            'Excel amb 5 columnes: Cognoms, Nom, Especialitat, Cognoms Titular, Nom Titular',
            'Plantilla CSV descarregable amb les capçaleres correctes',
            'Pestanya de Verificació: auditoria completa de la solució activa',
            'Protecció al esborrar: avís si un dia, aula o candidat té referències en tribunals',
            'Neteja automàtica de referències al esborrar (slots, membres)',
            'Validació de conflictes al editar franges inline',
            'Avís de conflicte de membres al crear franges i al afegir membres',
            'Logo i favicon de l\'aplicació',
            'README amb manual d\'ús complet'
          ],
          en: [
            'Substitute/titular management: candidates can have an associated titular',
            'Substitute/titular toggle: switch who acts in the tribunal with one click',
            'Excel with 5 columns: Surnames, Name, Specialty, Titular Surnames, Titular Name',
            'Downloadable CSV template with correct headers',
            'Verification tab: full audit of the active solution',
            'Delete protection: warning if a day, room or candidate has tribunal references',
            'Automatic reference cleanup on delete (slots, members)',
            'Conflict validation when editing slots inline',
            'Member conflict warning when creating slots and adding members',
            'App logo and favicon',
            'README with complete user manual'
          ]
        }
      },
      {
        version: '0.1.0',
        date: '2026-05-24',
        changes: {
          es: [
            'Scheduling completo: franjas horarias con aula y actividad obligatorias',
            'Selector visual de aulas: elige aula navegando por planos o por lista',
            'Aulas ocupadas marcadas con aviso de conflicto en el selector',
            'Detección de conflictos en tiempo real (aulas y miembros)',
            'Buscador de aulas libres por día y franja',
            'Vista de ocupación en planos: selector de día con colores libre/ocupada',
            'Variaciones de tribunal: composiciones alternativas de miembros',
            'Generación de PDF personalizable (logo, cabecera, selección de tribunales)',
            'Roles con dos tipos: computan (Presidente, Vocal, Secretario) y no computan (Suplente, Asesor, Ayudante)',
            'Aviso si un tribunal no tiene suplente',
            'Generador de nombres de tribunal por especialidad y curso/nivel',
            'Reordenación de plantas con botones arriba/abajo',
            'Bordes de aula visibles para delimitar espacios multi-celda',
            'Zoom del plano (50%–300%)',
            'Ampliación de aulas existentes (merge de celdas)',
            'Selección de celdas sin parpadeo (manipulación directa del DOM)',
            'Reducción de rejilla desde cualquier lado con protección de aulas',
            'Exportación e importación independiente de tiempo',
            'Múltiples soluciones para comparar asignaciones',
            'Migración automática de datos antiguos'
          ],
          va: [
            'Scheduling complet: franges horàries amb aula i activitat obligatòries',
            'Selector visual d\'aules: tria aula navegant per plànols o per llista',
            'Aules ocupades marcades amb avís de conflicte al selector',
            'Detecció de conflictes en temps real (aules i membres)',
            'Cercador d\'aules lliures per dia i franja',
            'Vista d\'ocupació en plànols: selector de dia amb colors lliure/ocupada',
            'Variacions de tribunal: composicions alternatives de membres',
            'Generació de PDF personalitzable (logo, capçalera, selecció de tribunals)',
            'Rols amb dos tipus: computen (President/a, Vocal, Secretari/a) i no computen (Suplent, Assessor/a, Ajudant)',
            'Avís si un tribunal no té suplent',
            'Generador de noms de tribunal per especialitat i curs/nivell',
            'Reordenació de plantes amb botons amunt/avall',
            'Vores d\'aula visibles per a delimitar espais multi-cel·la',
            'Zoom del plànol (50%–300%)',
            'Ampliació d\'aules existents (merge de cel·les)',
            'Selecció de cel·les sense parpelleig (manipulació directa del DOM)',
            'Reducció de graella des de qualsevol costat amb protecció d\'aules',
            'Exportació i importació independent de temps',
            'Múltiples solucions per a comparar assignacions',
            'Migració automàtica de dades antigues'
          ],
          en: [
            'Complete scheduling: time slots with mandatory room and activity',
            'Visual room picker: choose room by navigating floor plans or list',
            'Occupied rooms marked with conflict warnings in picker',
            'Real-time conflict detection (rooms and members)',
            'Free room finder by day and time slot',
            'Occupation view on plans: day selector with free/occupied colors',
            'Tribunal variations: alternative member compositions',
            'Customizable PDF generation (logo, header, tribunal selection)',
            'Two role types: counting (President, Member, Secretary) and non-counting (Substitute, Advisor, Assistant)',
            'Warning if tribunal has no substitute',
            'Tribunal name generator by specialty and course/level',
            'Floor reordering with up/down buttons',
            'Visible room borders for multi-cell spaces',
            'Plan zoom (50%–300%)',
            'Expand existing rooms (cell merge)',
            'Flicker-free cell selection (direct DOM manipulation)',
            'Grid shrinking from any side with room protection',
            'Independent time export and import',
            'Multiple solutions to compare assignments',
            'Automatic data migration from older versions'
          ]
        }
      },
      {
        version: '0.0.1',
        date: '2026-05-24',
        changes: {
          es: [
            'Versión inicial de Tribunator',
            'Fase de Espacio: sedes, plantas y rejilla',
            'Creación y edición de aulas con campos personalizados',
            'Agrupaciones de aulas con avisos de cruce',
            'Vista lista y plano con tooltips',
            'Duplicación de plantas',
            'Fase de Tiempo: gestión de días con horarios configurables',
            'Fase de Tribunales: soluciones, candidatos y miembros',
            'Subida de candidatos desde Excel/CSV',
            'Exportación e importación en JSON',
            'Persistencia en LocalStorage',
            'Interfaz en español, valenciano e inglés'
          ],
          va: [
            'Versió inicial de Tribunator',
            'Fase d\'Espai: seus, plantes i graella',
            'Creació i edició d\'aules amb camps personalitzats',
            'Agrupacions d\'aules amb avisos de creuament',
            'Vista llista i plànol amb tooltips',
            'Duplicació de plantes',
            'Fase de Temps: gestió de dies amb horaris configurables',
            'Fase de Tribunals: solucions, candidats i membres',
            'Pujada de candidats des d\'Excel/CSV',
            'Exportació i importació en JSON',
            'Persistència en LocalStorage',
            'Interfície en espanyol, valencià i anglés'
          ],
          en: [
            'Initial version of Tribunator',
            'Space phase: campuses, floors and grid',
            'Room creation and editing with custom fields',
            'Room groupings with cross-campus/floor warnings',
            'List view and plan view with tooltips',
            'Floor duplication',
            'Time phase: day management with configurable schedules',
            'Tribunals phase: solutions, candidates and members',
            'Candidate upload from Excel/CSV',
            'JSON data export and import',
            'LocalStorage persistence',
            'Interface in Spanish, Valencian and English'
          ]
        }
      }
    ];

    var lang = Tribunator.i18n.currentLang;
    var content = el('div', { className: 'changelog-container' });

    // Version header with link to latest release
    var versionHeader = el('div', { style: { textAlign: 'center', padding: '16px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' } }, [
      el('div', { style: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }, textContent: t('app.currentVersion') }),
      el('div', { style: { fontSize: '24px', fontWeight: '700', marginBottom: '12px' }, textContent: 'v' + currentVersion }),
      el('a', {
        href: 'https://github.com/JLMirallesB/tribunator/releases/latest',
        target: '_blank',
        style: { display: 'inline-block', padding: '6px 16px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', fontSize: '13px', textDecoration: 'none', fontWeight: '500' },
        textContent: t('app.checkLatest')
      })
    ]);
    content.appendChild(versionHeader);

    entries.forEach(function(entry) {
      var entryEl = Tribunator.Utils.el('div', { className: 'changelog-entry' });
      entryEl.appendChild(Tribunator.Utils.el('div', { className: 'changelog-version', textContent: 'v' + entry.version }));
      entryEl.appendChild(Tribunator.Utils.el('div', { className: 'changelog-date', textContent: entry.date }));
      var list = Tribunator.Utils.el('ul', { className: 'changelog-list' });
      var changes = entry.changes[lang] || entry.changes['es'];
      changes.forEach(function(change) {
        list.appendChild(Tribunator.Utils.el('li', { textContent: change }));
      });
      entryEl.appendChild(list);
      content.appendChild(entryEl);
    });

    Tribunator.Utils.showModal({
      title: t('changelog.title'),
      body: content,
      buttons: [
        { text: t('common.close'), className: 'btn-secondary' }
      ]
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  Tribunator.App.init();
});

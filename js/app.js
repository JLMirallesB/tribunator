window.Tribunator = window.Tribunator || {};

Tribunator.App = {
  currentPhase: 'space',

  init: function() {
    Tribunator.i18n.init();
    Tribunator.Store.init();
    Tribunator.Space.init();
    Tribunator.Time.init();
    Tribunator.Templates.init();
    Tribunator.Tribunals.init();
    this.render();
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
      Tribunator.Utils.el('span', { className: 'app-version', textContent: ' v0.2.2' })
    ]));

    // Phase nav
    var nav = Tribunator.Utils.el('div', { className: 'phase-nav' });
    var phases = ['space', 'time', 'templates', 'tribunals', 'verify'];
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

    body.appendChild(spaceContainer);
    body.appendChild(timeContainer);
    body.appendChild(templatesContainer);
    body.appendChild(tribunalsContainer);
    body.appendChild(verifyContainer);

    this.renderCurrentPhase();
  },

  renderCurrentPhase: function() {
    if (this.currentPhase === 'space') {
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
        version: '0.2.2',
        date: '2026-05-25',
        changes: {
          es: [
            'PDF: selección de roles a imprimir con checkboxes',
            'PDF: opción de mostrar titular entre paréntesis para sustitutos',
            'PDF: dos modos de exportación (completo y solo miembros)',
            'PDF: variaciones de tribunal incluidas en ambos modos',
            'Presidente/a, Vocal y Secretario/a ahora son roles requeridos (aviso si faltan)',
            'Demo: roles de Asesor/a y Ayudante en tribunales de ejemplo',
            'Demo: planos en forma de L y variaciones de tribunal',
            'Enlace de contacto para errores y sugerencias en el footer'
          ],
          va: [
            'PDF: selecció de rols a imprimir amb checkboxes',
            'PDF: opció de mostrar titular entre parèntesi per a substituts',
            'PDF: dos modes d\'exportació (complet i només membres)',
            'PDF: variacions de tribunal incloses en ambdós modes',
            'President/a, Vocal i Secretari/a ara són rols requerits (avís si falten)',
            'Demo: rols d\'Assessor/a i Ajudant en tribunals d\'exemple',
            'Demo: plànols en forma de L i variacions de tribunal',
            'Enllaç de contacte per a errors i suggeriments al footer'
          ],
          en: [
            'PDF: role selection with checkboxes for printing',
            'PDF: option to show titular in parentheses for substitutes',
            'PDF: two export modes (full and members only)',
            'PDF: tribunal variations included in both modes',
            'President, Member and Secretary are now required roles (warning if missing)',
            'Demo: Advisor and Assistant roles in sample tribunals',
            'Demo: L-shaped floor plans and tribunal variations',
            'Contact link for bugs and suggestions in footer'
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

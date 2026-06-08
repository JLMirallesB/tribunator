window.Tribunator = window.Tribunator || {};

Tribunator.PDF = {
  MARGIN: 15,
  PAGE_W: 210,
  CONTENT_W: 180,
  DARK: [26, 26, 26],
  GRAY: [100, 100, 100],
  LIGHT_BG: [245, 245, 245],
  WHITE: [255, 255, 255],
  TABLE_ALT: [248, 248, 248],

  _accent: function(o) { return (o && o.accentColor) || [60, 60, 60]; },
  _hexToRgb: function(h) { h = h.replace('#',''); return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)]; },
  _fmtTime: function(start, end, full) { return full ? start + ' – ' + end : start; },
  _initDoc: function() {
    var C = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!C) { Tribunator.Utils.showToast('jsPDF not loaded', 'error'); return null; }
    return new C({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  },
  _state: function(doc) { var m = this.MARGIN; return { y: m, check: function(n) { if (this.y + n > 280) { doc.addPage(); this.y = m; } } }; },
  _addFooter: function(doc) {
    var pc = doc.getNumberOfPages();
    for (var i = 1; i <= pc; i++) { doc.setPage(i); doc.setFontSize(8); doc.setFont(undefined,'normal'); doc.setTextColor(170); doc.text(i+' / '+pc, this.PAGE_W/2, 290, {align:'center'}); doc.setTextColor(0); }
  },
  _savePdf: function(doc, options) {
    this._addFooter(doc);
    var fname = (options.filename || 'tribunator').replace(/[^a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ_\- ]/g, '').replace(/\s+/g, '_');
    doc.save(fname + '.pdf');
    Tribunator.Utils.showToast(t('common.success'));
  },
  _addHeader: function(doc, options, state) {
    var m = this.MARGIN;
    if (options.logo || options.headerText) {
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, this.PAGE_W, 32, 'F');
      var tx = m;
      if (options.logo) { try { doc.addImage(options.logo, 'PNG', m, 5, 22, 22); tx = m + 28; } catch(e) {} }
      if (options.headerText) { doc.setTextColor.apply(doc, this.DARK); doc.setFontSize(18); doc.setFont(undefined,'bold'); doc.text(options.headerText, tx, 16); if (options.subHeaderText) { doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.setTextColor.apply(doc, this.GRAY); doc.text(options.subHeaderText, tx, 23); } }
      doc.setTextColor(0); state.y = 36;
    }
    if (options.customText) { doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.setTextColor.apply(doc, this.GRAY); var lines = doc.splitTextToSize(options.customText, this.CONTENT_W); state.check(lines.length*5+6); doc.text(lines, m, state.y); state.y += lines.length*5+4; doc.setTextColor(0); }
  },
  _tribunalBand: function(doc, name, state) {
    state.check(12); doc.setFillColor.apply(doc, this.DARK);
    doc.rect(this.MARGIN, state.y, 1.5, 8, 'F');
    doc.setFontSize(12); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, this.DARK);
    doc.text(name, this.MARGIN + 5, state.y + 6);
    state.y += 11; doc.setTextColor(0);
  },
  _sectionLabel: function(doc, label, state, options) {
    state.check(10); doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, this._accent(options)); doc.text(label, this.MARGIN, state.y+4); state.y += 7; doc.setTextColor(0);
  },
  _membersTable: function(doc, members, store, state, options) {
    var filtered = members.filter(function(m) { return !options.selectedRoles || !m.role || options.selectedRoles.indexOf(m.role) !== -1; });
    if (!filtered.length) return;
    var self = this, footnotes = [], fi = 0;
    var rows = filtered.map(function(m) {
      var c = store.getCandidate(m.candidateId);
      var sn = c ? (c.useTitular && c.titularSurnames ? c.titularSurnames : c.surnames) : '—';
      var nm = c ? (c.useTitular && c.titularName ? c.titularName : c.name) : '';
      if (c && store.isSubstitute(c.id) && !c.useTitular && options.showTitular) { fi++; sn += ' *'+fi; footnotes.push({i:fi, sub:c.surnames+', '+c.name, tit:c.titularSurnames+', '+c.titularName}); }
      var row = [sn, nm, m.role||''];
      if (options.showSpecialty) row.push(c?(c.specialty||''):'');
      return row;
    });
    var head = [t('tribunals.candidateSurnames'),t('tribunals.candidateName'),t('tribunals.role')];
    if (options.showSpecialty) head.push(t('tribunals.candidateSpecialty'));
    doc.autoTable({ startY: state.y, margin:{left:self.MARGIN,right:self.MARGIN}, head:[head], body:rows, styles:{fontSize:8,cellPadding:2,lineColor:[220,220,220],lineWidth:0.2}, headStyles:{fillColor:self._accent(options),textColor:self.WHITE,fontStyle:'bold',fontSize:8}, alternateRowStyles:{fillColor:self.TABLE_ALT},
      didParseCell:function(d){ if(d.section==='body'){ var m=filtered[d.row.index]; if(m){var rd=store.getRoleDefByName(m.role); if(rd&&!rd.counts){d.cell.styles.textColor=self.GRAY;d.cell.styles.fontStyle='italic';}} }}
    });
    state.y = doc.lastAutoTable.finalY + 2;
    if (footnotes.length > 0) { doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor.apply(doc,self.GRAY); footnotes.forEach(function(fn){ state.check(8); doc.text('*'+fn.i+' '+fn.sub+' — '+t('pdf.titularFootnote')+': '+fn.tit, self.MARGIN+2, state.y+3); state.y+=4; }); doc.setTextColor(0); doc.setFont(undefined,'normal'); state.y+=2; }
  },
  _variationsBlock: function(doc, variations, store, state, options) {
    if (!variations || !variations.length) return;
    var self = this;
    variations.forEach(function(v) { state.check(15); doc.setFillColor(210,210,210); doc.rect(self.MARGIN+2,state.y,1,6,'F'); doc.setFontSize(9); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc,self.GRAY); doc.text(t('tribunals.variations')+': '+v.name, self.MARGIN+6, state.y+4); state.y+=7; doc.setTextColor(0); self._membersTable(doc, v.members, store, state, options); });
  },
  _scheduleTable: function(doc, schedule, store, state, options) {
    var self = this;
    var sorted = schedule.slice().sort(function(a,b){ var da=store.getDay(a.dayId),db=store.getDay(b.dayId); return da&&db?da.date.localeCompare(db.date):0; });
    sorted.forEach(function(sched) {
      var day = store.getDay(sched.dayId); if (!day) return;
      var slots = (sched.slots||[]).slice().sort(function(a,b){return a.startTime.localeCompare(b.startTime);}); if (!slots.length) return;
      state.check(15); doc.setFillColor.apply(doc, self.LIGHT_BG); doc.rect(self.MARGIN, state.y, self.CONTENT_W, 7, 'F'); doc.setFontSize(10); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK); doc.text(Tribunator.Time.formatDate(day.date), self.MARGIN+3, state.y+5); state.y+=9; doc.setTextColor(0);
      var rows = slots.map(function(s){ var rm=s.roomId?store.getRoom(s.roomId):null; return [self._fmtTime(s.startTime, s.endTime, options && options.showFullTime), rm?rm.room.name:'—', s.activity||'']; });
      doc.autoTable({ startY:state.y, margin:{left:self.MARGIN+2,right:self.MARGIN}, head:[[t('time.timeSlot'),t('space.room'),t('tribunals.slotActivity')]], body:rows, styles:{fontSize:8,cellPadding:2,lineColor:[220,220,220],lineWidth:0.2}, headStyles:{fillColor:[80,80,80],textColor:self.WHITE,fontStyle:'bold',fontSize:7}, alternateRowStyles:{fillColor:[250,250,252]}, columnStyles:{0:{cellWidth:28},1:{cellWidth:30}} });
      state.y = doc.lastAutoTable.finalY + 4;
    });
  },

  // ============================================================
  // TYPE 1: Tribunals (full / members only)
  // ============================================================
  generateTribunals: function(options) {
    var doc = this._initDoc(); if (!doc) return;
    var store = Tribunator.Store, state = this._state(doc), self = this;
    this._addHeader(doc, options, state);
    var sol = store.getSolution(options.solutionId); if (!sol) return;
    var tribunals = options.tribunalIds ? sol.tribunals.filter(function(tr){return options.tribunalIds.indexOf(tr.id)!==-1;}) : sol.tribunals;
    tribunals.forEach(function(trib, idx) {
      if (idx > 0) { doc.addPage(); state.y = self.MARGIN; }
      self._tribunalBand(doc, trib.name, state);
      if (trib.publishNotes) {
        doc.setFontSize(9); doc.setFont(undefined, 'italic'); doc.setTextColor.apply(doc, self.GRAY);
        var noteLines = doc.splitTextToSize(trib.publishNotes, self.CONTENT_W - 4);
        state.check(noteLines.length * 4 + 4);
        doc.text(noteLines, self.MARGIN + 2, state.y + 3);
        state.y += noteLines.length * 4 + 4;
        doc.setFont(undefined, 'normal'); doc.setTextColor(0);
      }
      if (trib.members.length > 0) { self._sectionLabel(doc, t('tribunals.members'), state, options); self._membersTable(doc, trib.members, store, state, options); }
      self._variationsBlock(doc, trib.variations, store, state, options);
      if (!options.membersOnly) { var sched = trib.schedule||[]; if (sched.length) { self._sectionLabel(doc, t('tribunals.schedule'), state, options); self._scheduleTable(doc, sched, store, state, options); } }
      state.y += 4;
    });
    this._savePdf(doc, options);
  },

  // ============================================================
  // TYPE 2: Daily planning
  // ============================================================
  generateDailyPlanning: function(options) {
    var doc = this._initDoc(); if (!doc) return;
    var store = Tribunator.Store, self = this;
    var sol = store.getSolution(options.solutionId); if (!sol) return;
    var days = (options.dayIds || store.getDays().map(function(d){return d.id;}));

    days.forEach(function(dayId, dayIdx) {
      var day = store.getDay(dayId); if (!day) return;
      if (dayIdx > 0) doc.addPage();
      var state = self._state(doc);
      self._addHeader(doc, options, state);

      // Day title
      state.check(12); doc.setFillColor.apply(doc, self.DARK);
      doc.rect(self.MARGIN, state.y, 1.5, 8, 'F');
      doc.setFontSize(12); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK);
      doc.text(Tribunator.Time.formatDate(day.date) + '  (' + day.startTime + ' – ' + day.endTime + ')', self.MARGIN + 5, state.y + 6);
      state.y += 11; doc.setTextColor(0);

      // Collect all slots for this day across all tribunals
      var allSlots = [];
      var tribunals = options.tribunalIds ? sol.tribunals.filter(function(tr){return options.tribunalIds.indexOf(tr.id)!==-1;}) : sol.tribunals;
      tribunals.forEach(function(trib) {
        var sched = (trib.schedule||[]).find(function(s){return s.dayId===dayId;});
        if (!sched || !sched.slots) return;
        sched.slots.forEach(function(slot) {
          var rm = slot.roomId ? store.getRoom(slot.roomId) : null;
          var memberNames = trib.members.filter(function(m) {
            return !options.selectedRoles || !m.role || options.selectedRoles.indexOf(m.role) !== -1;
          }).map(function(m) {
            var c = store.getCandidate(m.candidateId);
            return c ? (c.useTitular && c.titularSurnames ? c.titularSurnames : c.surnames) + (m.role ? ' ('+m.role+')' : '') : '?';
          }).join(', ');
          allSlots.push([self._fmtTime(slot.startTime, slot.endTime, options.showFullTime), trib.name, rm ? rm.room.name : '—', slot.activity || '', memberNames]);
        });
      });

      allSlots.sort(function(a,b){ return a[0].localeCompare(b[0]); });

      if (allSlots.length === 0) {
        doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.text(t('time.noDays'), self.MARGIN, state.y+5); state.y+=10;
      } else {
        doc.autoTable({
          startY: state.y, margin:{left:self.MARGIN, right:self.MARGIN},
          head: [[t('time.timeSlot'), t('tribunals.tribunal'), t('space.room'), t('tribunals.slotActivity'), t('tribunals.members')]],
          body: allSlots,
          styles: {fontSize:7, cellPadding:2, lineColor:[220,220,220], lineWidth:0.2, overflow:'linebreak'},
          headStyles: {fillColor:self._accent(options), textColor:self.WHITE, fontStyle:'bold', fontSize:7},
          alternateRowStyles: {fillColor:self.TABLE_ALT},
          columnStyles: {0:{cellWidth:22}, 1:{cellWidth:28}, 2:{cellWidth:20}, 3:{cellWidth:35}}
        });
        state.y = doc.lastAutoTable.finalY + 4;
      }
    });
    this._savePdf(doc, options);
  },

  // ============================================================
  // TYPE 3: Floor plans
  // ============================================================
  generateFloorPlans: function(options) {
    var doc = this._initDoc(); if (!doc) return;
    var store = Tribunator.Store, self = this;
    var campuses = store.getCampuses();
    var activeSol = store.getActiveSolution();
    var planDays = (options.dayIds && options.dayIds.length > 0) ? options.dayIds : [null];
    var firstPage = true;

    planDays.forEach(function(dayId) {
      var occupation = {};
      var day = dayId ? store.getDay(dayId) : null;
      if (dayId && activeSol) occupation = store.getRoomOccupation(activeSol.id, dayId);

    campuses.forEach(function(campus) {
      campus.floors.forEach(function(floor) {
        if (options.floorIds && options.floorIds.indexOf(floor.id) === -1) return;
        if (!firstPage) doc.addPage();
        firstPage = false;
        var state = self._state(doc);
        self._addHeader(doc, options, state);

        // Floor title
        var floorTitle = campus.name + ' — ' + floor.name;
        if (day) floorTitle += '  ·  ' + Tribunator.Time.formatDate(day.date);
        state.check(12); doc.setFillColor.apply(doc, self.DARK);
        doc.rect(self.MARGIN, state.y, 1.5, 8, 'F');
        doc.setFontSize(11); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK);
        doc.text(floorTitle, self.MARGIN + 5, state.y + 6);
        state.y += 11; doc.setTextColor(0);

        // Draw grid
        var maxW = self.CONTENT_W;
        var cellSize = Math.min(Math.floor(maxW / floor.gridCols), 8);
        var gridW = cellSize * floor.gridCols;
        var gridH = cellSize * floor.gridRows;
        var offsetX = self.MARGIN + (maxW - gridW) / 2;

        state.check(gridH + 20);

        var cellLookup = {};
        floor.rooms.forEach(function(room) { room.cells.forEach(function(c) { cellLookup[c.col+','+c.row] = room; }); });

        for (var row = 0; row < floor.gridRows; row++) {
          for (var col = 0; col < floor.gridCols; col++) {
            var x = offsetX + col * cellSize;
            var y = state.y + row * cellSize;
            var room = cellLookup[col+','+row];
            if (room) {
              var occ = occupation[room.id];
              if (occ && occ.length > 0) {
                doc.setFillColor(255, 200, 200);
              } else if (dayId) {
                doc.setFillColor(200, 240, 200);
              } else {
                doc.setFillColor(200, 210, 230);
              }
              doc.rect(x, y, cellSize, cellSize, 'F');
              // Borders
              var rid = room.id;
              var topN = cellLookup[col+','+(row-1)]; var botN = cellLookup[col+','+(row+1)];
              var lefN = cellLookup[(col-1)+','+row]; var rigN = cellLookup[(col+1)+','+row];
              doc.setDrawColor(60); doc.setLineWidth(0.3);
              if (!topN || topN.id !== rid) doc.line(x, y, x+cellSize, y);
              if (!botN || botN.id !== rid) doc.line(x, y+cellSize, x+cellSize, y+cellSize);
              if (!lefN || lefN.id !== rid) doc.line(x, y, x, y+cellSize);
              if (!rigN || rigN.id !== rid) doc.line(x+cellSize, y, x+cellSize, y+cellSize);
              // Label on first cell
              if (room.cells[0].col === col && room.cells[0].row === row) {
                doc.setFontSize(Math.max(4, cellSize * 0.45)); doc.setFont(undefined,'bold'); doc.setTextColor(30);
                doc.text(room.name, x + 1, y + cellSize * 0.65, { maxWidth: cellSize * room.cells.length - 1 });
              }
            } else {
              doc.setFillColor(250, 250, 250);
              doc.rect(x, y, cellSize, cellSize, 'F');
              doc.setDrawColor(230); doc.setLineWidth(0.1);
              doc.rect(x, y, cellSize, cellSize, 'S');
            }
          }
        }
        doc.setTextColor(0); doc.setDrawColor(0); doc.setLineWidth(0.2);
        state.y += gridH + 6;

        // Legend table
        var legendRows = [];
        floor.rooms.forEach(function(room) {
          var occ = occupation[room.id];
          var status = '';
          if (dayId) {
            status = occ && occ.length > 0 ? occ.map(function(o){return o.tribunal.name;}).join(', ') : t('common.free');
          }
          var row = [room.name, room.notes || ''];
          if (dayId) row.push(status);
          legendRows.push(row);
        });
        var legendHead = [t('space.room'), t('common.notes')];
        if (dayId) legendHead.push(t('space.status'));
        doc.autoTable({
          startY: state.y, margin:{left:self.MARGIN, right:self.MARGIN},
          head: [legendHead], body: legendRows,
          styles: {fontSize:7, cellPadding:1.5, lineColor:[220,220,220], lineWidth:0.1},
          headStyles: {fillColor:self._accent(options), textColor:self.WHITE, fontStyle:'bold', fontSize:7},
          alternateRowStyles: {fillColor:self.TABLE_ALT}
        });
      });
    });
    }); // end planDays loop
    this._savePdf(doc, options);
  },

  // ============================================================
  // TYPE 4: Room signs (cartelería)
  // ============================================================
  generateRoomSigns: function(options) {
    var doc = this._initDoc(); if (!doc) return;
    var store = Tribunator.Store, self = this;
    var sol = store.getActiveSolution(); if (!sol) return;
    var signDayIds = (options.dayIds && options.dayIds.length > 0) ? options.dayIds : (options.signDayId ? [options.signDayId] : []);
    var allRooms = store.getAllRooms();
    var signRooms = options.signRoomIds ? allRooms.filter(function(r){return options.signRoomIds.indexOf(r.room.id)!==-1;}) : allRooms;
    var halfPage = options.halfPage;
    var m = self.MARGIN;
    var pageIdx = 0;

    signDayIds.forEach(function(dayId) {
      var day = store.getDay(dayId); if (!day) return;
      var occupation = store.getRoomOccupation(sol.id, dayId);

    signRooms.forEach(function(item) {
      var room = item.room;
      var occ = occupation[room.id] || [];
      if (occ.length === 0 && !options.includeEmpty) return;

      if (halfPage) {
        if (pageIdx > 0 && pageIdx % 2 === 0) doc.addPage();
        var yOffset = (pageIdx % 2 === 0) ? 0 : 148.5;
        var availH = 148.5;
      } else {
        if (pageIdx > 0) doc.addPage();
        var yOffset = 0;
        var availH = 297;
      }

      // Room name big
      doc.setFontSize(28); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK);
      doc.text(room.name, self.PAGE_W/2, yOffset + 30, {align:'center'});

      // Campus / floor
      doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.setTextColor.apply(doc, self.GRAY);
      doc.text(item.campus.name + ' — ' + item.floor.name, self.PAGE_W/2, yOffset + 38, {align:'center'});

      // Day
      doc.setFontSize(12); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK);
      doc.text(Tribunator.Time.formatDate(day.date), self.PAGE_W/2, yOffset + 50, {align:'center'});
      doc.setTextColor(0);

      if (occ.length === 0) {
        doc.setFontSize(14); doc.setFont(undefined,'normal'); doc.setTextColor.apply(doc, self.GRAY);
        doc.text(t('common.free'), self.PAGE_W/2, yOffset + 70, {align:'center'});
        doc.setTextColor(0);
      } else {
        var signY = yOffset + 56;
        occ.forEach(function(o) {
          var trib = o.tribunal;
          // Tribunal name
          doc.setFillColor.apply(doc, self.DARK);
          doc.rect(m, signY, 1.5, 8, 'F');
          doc.setFontSize(11); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.DARK);
          doc.text(trib.name, m + 5, signY + 5.5);
          doc.setTextColor(0); signY += 10;

          // Members
          var members = trib.members.filter(function(mb) { return !options.selectedRoles || !mb.role || options.selectedRoles.indexOf(mb.role) !== -1; });
          var memberRows = members.map(function(mb) {
            var c = store.getCandidate(mb.candidateId);
            var nm = c ? (c.useTitular && c.titularSurnames ? c.titularSurnames+', '+c.titularName : c.surnames+', '+c.name) : '?';
            return [nm, mb.role || ''];
          });
          if (memberRows.length) {
            doc.autoTable({
              startY: signY, margin:{left:m, right:m},
              body: memberRows,
              styles: {fontSize:9, cellPadding:2, lineColor:[220,220,220], lineWidth:0.1},
              alternateRowStyles: {fillColor:self.TABLE_ALT},
              columnStyles: {1:{cellWidth:30}}
            });
            signY = doc.lastAutoTable.finalY + 2;
          }

          // Variations
          (trib.variations || []).forEach(function(v) {
            var vMembers = v.members.filter(function(mb) { return !options.selectedRoles || !mb.role || options.selectedRoles.indexOf(mb.role) !== -1; });
            if (!vMembers.length) return;
            doc.setFontSize(8); doc.setFont(undefined,'bold'); doc.setTextColor.apply(doc, self.GRAY);
            doc.text(t('tribunals.variations') + ': ' + v.name, m + 2, signY + 3);
            doc.setTextColor(0); doc.setFont(undefined,'normal'); signY += 5;
            var vRows = vMembers.map(function(mb) {
              var c = store.getCandidate(mb.candidateId);
              var nm = c ? (c.useTitular && c.titularSurnames ? c.titularSurnames+', '+c.titularName : c.surnames+', '+c.name) : '?';
              return [nm, mb.role || ''];
            });
            doc.autoTable({
              startY: signY, margin:{left:m, right:m},
              body: vRows,
              styles: {fontSize:8, cellPadding:1.5, lineColor:[220,220,220], lineWidth:0.1},
              alternateRowStyles: {fillColor:self.TABLE_ALT},
              columnStyles: {1:{cellWidth:30}}
            });
            signY = doc.lastAutoTable.finalY + 2;
          });

          // Slots for this day IN THIS ROOM only
          var sched = (trib.schedule||[]).find(function(s){return s.dayId===dayId;});
          if (sched && sched.slots && sched.slots.length) {
            var roomSlots = sched.slots.filter(function(s) { return s.roomId === room.id; });
            var slotRows = roomSlots.slice().sort(function(a,b){return a.startTime.localeCompare(b.startTime);}).map(function(s) { return [self._fmtTime(s.startTime, s.endTime, options.showFullTime), s.activity||'']; });
            doc.autoTable({
              startY: signY, margin:{left:m, right:m},
              body: slotRows,
              styles: {fontSize:8, cellPadding:1.5, lineColor:[220,220,220], lineWidth:0.1},
              alternateRowStyles: {fillColor:[250,250,252]},
              columnStyles: {0:{cellWidth:28}}
            });
            signY = doc.lastAutoTable.finalY + 4;
          }
        });
      }

      // Separator for half page
      if (halfPage && pageIdx % 2 === 0) {
        doc.setDrawColor(200); doc.setLineWidth(0.3);
        doc.line(0, 148.5, self.PAGE_W, 148.5);
      }
      pageIdx++;
    });
    }); // end signDayIds loop
    this._savePdf(doc, options);
  },

  // ============================================================
  // TYPE 5: Member directory
  // ============================================================
  generateDirectory: function(options) {
    var doc = this._initDoc(); if (!doc) return;
    var store = Tribunator.Store, self = this;
    var sol = store.getSolution(options.solutionId); if (!sol) return;
    var state = this._state(doc);
    this._addHeader(doc, options, state);

    var candidateMap = {};
    sol.tribunals.forEach(function(trib) {
      trib.members.forEach(function(m) {
        if (!candidateMap[m.candidateId]) candidateMap[m.candidateId] = [];
        candidateMap[m.candidateId].push({ trib: trib, role: m.role, type: 'member' });
      });
      (trib.variations || []).forEach(function(v) {
        v.members.forEach(function(m) {
          if (!candidateMap[m.candidateId]) candidateMap[m.candidateId] = [];
          candidateMap[m.candidateId].push({ trib: trib, role: m.role, type: 'variation', varName: v.name });
        });
      });
    });

    var allCandidates = store.getCandidates();
    allCandidates.forEach(function(c) {
      if (!candidateMap[c.id]) candidateMap[c.id] = [];
    });

    var rows = [];
    var footnotes = [], fi = 0;
    Object.keys(candidateMap).forEach(function(cid) {
      var c = store.getCandidate(cid);
      if (!c) return;
      var sn = c.useTitular && c.titularSurnames ? c.titularSurnames : c.surnames;
      var nm = c.useTitular && c.titularName ? c.titularName : c.name;
      if (c && store.isSubstitute(c.id) && !c.useTitular && options.showTitular) { fi++; sn += ' *'+fi; footnotes.push({i:fi, sub:c.surnames+', '+c.name, tit:c.titularSurnames+', '+c.titularName}); }
      var entries = candidateMap[cid];
      if (entries.length === 0) {
        var row = [sn, nm];
        if (options.showSpecialty) row.push(c.specialty || '');
        row.push(t('dashboard.noTribunals'));
        rows.push(row);
        return;
      }
      var lines = entries.map(function(entry) {
        var label = entry.trib.name;
        if (entry.type === 'variation') label += ' — ' + entry.varName;
        if (entry.role) label += ' (' + entry.role + ')';
        var schedule = entry.trib.schedule || [];
        var dayParts = [];
        schedule.forEach(function(sched) {
          var day = store.getDay(sched.dayId);
          if (!day) return;
          var acts = [];
          (sched.slots || []).forEach(function(slot) {
            if (slot.activity && acts.indexOf(slot.activity) === -1) acts.push(slot.activity);
          });
          if (acts.length > 0) dayParts.push(Tribunator.Time.formatDate(day.date) + ': ' + acts.join(', '));
        });
        if (dayParts.length > 0) label += '\n    ' + dayParts.join('\n    ');
        return label;
      });
      var row = [sn, nm];
      if (options.showSpecialty) row.push(c.specialty || '');
      row.push(lines.join('\n'));
      rows.push(row);
    });

    rows.sort(function(a, b) { return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]); });

    var head = [t('tribunals.candidateSurnames'), t('tribunals.candidateName')];
    if (options.showSpecialty) head.push(t('tribunals.candidateSpecialty'));
    head.push(t('pdf.assignments'));

    doc.autoTable({
      startY: state.y, margin: { left: self.MARGIN, right: self.MARGIN },
      head: [head], body: rows,
      styles: { fontSize: 7, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.2, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: self._accent(options), textColor: self.WHITE, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: self.TABLE_ALT },
      columnStyles: options.showSpecialty ? { 0: { cellWidth: 30 }, 1: { cellWidth: 22 }, 2: { cellWidth: 22 } } : { 0: { cellWidth: 30 }, 1: { cellWidth: 22 } }
    });
    state.y = doc.lastAutoTable.finalY + 2;
    if (footnotes.length > 0) { doc.setFontSize(7); doc.setFont(undefined,'italic'); doc.setTextColor.apply(doc,self.GRAY); footnotes.forEach(function(fn){ state.check(8); doc.text('*'+fn.i+' '+fn.sub+' — '+t('pdf.titularFootnote')+': '+fn.tit, self.MARGIN+2, state.y+3); state.y+=4; }); doc.setTextColor(0); doc.setFont(undefined,'normal'); state.y+=2; }

    this._savePdf(doc, options);
  },

  // ============================================================
  // UNIFIED DIALOG
  // ============================================================
  showExportDialog: function() {
    var store = Tribunator.Store;
    var el = Tribunator.Utils.el;
    var activeSol = store.getActiveSolution();
    if (!activeSol) { Tribunator.Utils.showToast(t('tribunals.noSolutions'), 'warning'); return; }
    var self = this;

    // PDF type selector
    var pdfType = 'tribunals';
    var typeArea = el('div', { className: 'btn-group', style: { marginBottom: '12px' } });
    var optionsArea = el('div');

    var typeButtons = {};
    ['tribunals', 'daily', 'plans', 'signs', 'directory'].forEach(function(tp) {
      var btn = el('button', {
        className: 'btn btn-sm' + (tp === pdfType ? ' active' : ''),
        textContent: t('pdf.type_' + tp),
        onClick: function() {
          pdfType = tp;
          Object.keys(typeButtons).forEach(function(k) { typeButtons[k].className = 'btn btn-sm' + (k === tp ? ' active' : ''); });
          renderOptions();
          renderFooterButtons();
        }
      });
      typeButtons[tp] = btn;
      typeArea.appendChild(btn);
    });

    // Common fields
    var filenameInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.filename'), value: 'tribunator' });
    var headerInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.headerText') });
    var copyTitleBtn = el('button', { className: 'btn btn-sm', textContent: '← ' + t('pdf.copyTitle'), style: { flexShrink: '0' }, onClick: function() { if (headerInput.value.trim()) filenameInput.value = headerInput.value.trim().replace(/[^a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ \-_]/g, '').replace(/\s+/g, '_'); } });
    var subHeaderInput = el('input', { className: 'form-input', type: 'text', placeholder: t('pdf.subHeaderText') });
    var logoInput = el('input', { type: 'file', accept: 'image/*', className: 'form-input' });
    var colorInput = el('input', { type: 'color', value: '#3c3c3c', style: { width: '40px', height: '28px', border: 'none', cursor: 'pointer' } });

    // Shared state
    var roleDefs = store.getRoleDefs();
    var selectedRoles = roleDefs.filter(function(r){return r.requireOne||r.counts;}).map(function(r){return r.name;});
    var selectedIds = activeSol.tribunals.map(function(tr){return tr.id;});
    var days = store.getDays();
    var selectedDayIds = days.map(function(d){return d.id;});
    var allFloors = [];
    store.getCampuses().forEach(function(c) { c.floors.forEach(function(f) { allFloors.push({ campus: c, floor: f }); }); });
    var selectedFloorIds = allFloors.map(function(f){return f.floor.id;});
    var showTitular = true;
    var showSpecialty = false;
    var showFullTime = false;
    var halfPage = false;
    var includeEmpty = false;
    var signDayId = days.length > 0 ? days[0].id : null;
    var planDayId = null;

    // Builders
    var makeRoleList = function() {
      var rl = el('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' } });
      roleDefs.forEach(function(role) {
        var lbl = el('label', { style: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', cursor: 'pointer' } });
        var cb = el('input', { type: 'checkbox' }); cb.checked = selectedRoles.indexOf(role.name) !== -1;
        cb.addEventListener('change', function() { if (cb.checked) { if (selectedRoles.indexOf(role.name)===-1) selectedRoles.push(role.name); } else { selectedRoles = selectedRoles.filter(function(r){return r!==role.name;}); } });
        lbl.appendChild(cb); lbl.appendChild(document.createTextNode(role.name)); rl.appendChild(lbl);
      });
      return rl;
    };
    var makeTribunalList = function() {
      var tl = el('div', { style: { maxHeight: '120px', overflowY: 'auto', marginTop: '4px' } });
      activeSol.tribunals.forEach(function(trib) {
        var lbl = el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', cursor: 'pointer', fontSize: '12px' } });
        var cb = el('input', { type: 'checkbox' }); cb.checked = selectedIds.indexOf(trib.id) !== -1;
        cb.addEventListener('change', function() { if (cb.checked) { if (selectedIds.indexOf(trib.id)===-1) selectedIds.push(trib.id); } else { selectedIds = selectedIds.filter(function(id){return id!==trib.id;}); } });
        lbl.appendChild(cb); lbl.appendChild(document.createTextNode(trib.name)); tl.appendChild(lbl);
      });
      return tl;
    };
    var makeDayList = function() {
      var wrap = el('div', { style: { marginTop: '4px' } });
      var cbs = [];
      var toggleAll = el('button', { className: 'btn btn-sm', style: { marginBottom: '6px', fontSize: '10px' }, textContent: t('common.all'), onClick: function() {
        selectedDayIds = days.map(function(d) { return d.id; });
        cbs.forEach(function(c) { c.checked = true; });
      }});
      var toggleNone = el('button', { className: 'btn btn-sm', style: { marginBottom: '6px', marginLeft: '4px', fontSize: '10px' }, textContent: t('common.none'), onClick: function() {
        selectedDayIds = [];
        cbs.forEach(function(c) { c.checked = false; });
      }});
      wrap.appendChild(toggleAll);
      wrap.appendChild(toggleNone);
      var dl = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
      days.forEach(function(day) {
        var lbl = el('label', { style: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', cursor: 'pointer' } });
        var cb = el('input', { type: 'checkbox' }); cb.checked = selectedDayIds.indexOf(day.id) !== -1;
        cb.addEventListener('change', function() { if (cb.checked) { if (selectedDayIds.indexOf(day.id)===-1) selectedDayIds.push(day.id); } else { selectedDayIds = selectedDayIds.filter(function(id){return id!==day.id;}); } });
        cbs.push(cb);
        lbl.appendChild(cb); lbl.appendChild(document.createTextNode(Tribunator.Time.formatDate(day.date))); dl.appendChild(lbl);
      });
      wrap.appendChild(dl);
      return wrap;
    };

    var renderOptions = function() {
      Tribunator.Utils.clearElement(optionsArea);
      if (pdfType === 'tribunals') {
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.roles') }), makeRoleList()]));
        var stCb = el('input', { type: 'checkbox' }); stCb.checked = showTitular; stCb.addEventListener('change', function() { showTitular = stCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [stCb, document.createTextNode(t('pdf.showTitular'))])]));
        var spCb = el('input', { type: 'checkbox' }); spCb.checked = showSpecialty; spCb.addEventListener('change', function() { showSpecialty = spCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [spCb, document.createTextNode(t('pdf.showSpecialty'))])]));
        var ftCb = el('input', { type: 'checkbox' }); ftCb.checked = showFullTime; ftCb.addEventListener('change', function() { showFullTime = ftCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [ftCb, document.createTextNode(t('pdf.showFullTime'))])]));
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.tribunals') }), makeTribunalList()]));
      } else if (pdfType === 'daily') {
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('time.days') }), makeDayList()]));
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.tribunals') }), makeTribunalList()]));
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.roles') }), makeRoleList()]));
      } else if (pdfType === 'plans') {
        var floorList = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' } });
        allFloors.forEach(function(f) {
          var lbl = el('label', { style: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', cursor: 'pointer' } });
          var cb = el('input', { type: 'checkbox' }); cb.checked = selectedFloorIds.indexOf(f.floor.id) !== -1;
          cb.addEventListener('change', function() { if (cb.checked) { if (selectedFloorIds.indexOf(f.floor.id)===-1) selectedFloorIds.push(f.floor.id); } else { selectedFloorIds = selectedFloorIds.filter(function(id){return id!==f.floor.id;}); } });
          lbl.appendChild(cb); lbl.appendChild(document.createTextNode(f.campus.name + ' — ' + f.floor.name)); floorList.appendChild(lbl);
        });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('space.floors') }), floorList]));
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('time.days') }), makeDayList()]));
      } else if (pdfType === 'signs') {
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('time.days') }), makeDayList()]));
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('tribunals.roles') }), makeRoleList()]));
        var hpCb = el('input', { type: 'checkbox' }); hpCb.checked = halfPage; hpCb.addEventListener('change', function() { halfPage = hpCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [hpCb, document.createTextNode(t('pdf.halfPage'))])]));
        var ieCb = el('input', { type: 'checkbox' }); ieCb.checked = includeEmpty; ieCb.addEventListener('change', function() { includeEmpty = ieCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [ieCb, document.createTextNode(t('pdf.includeEmpty'))])]));
      } else if (pdfType === 'directory') {
        var dspCb = el('input', { type: 'checkbox' }); dspCb.checked = showSpecialty; dspCb.addEventListener('change', function() { showSpecialty = dspCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [dspCb, document.createTextNode(t('pdf.showSpecialty'))])]));
        var dstCb = el('input', { type: 'checkbox' }); dstCb.checked = showTitular; dstCb.addEventListener('change', function() { showTitular = dstCb.checked; });
        optionsArea.appendChild(el('div', { className: 'form-group' }, [el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' } }, [dstCb, document.createTextNode(t('pdf.showTitular'))])]));
      }
    };
    renderOptions();

    var buildOpts = function(callback) {
      var opts = {
        filename: filenameInput.value.trim() || 'tribunator',
        headerText: headerInput.value, subHeaderText: subHeaderInput.value, customText: pdfType === 'tribunals' ? (activeSol.publishText || '') : '',
        accentColor: self._hexToRgb(colorInput.value),
        solutionId: activeSol.id, tribunalIds: selectedIds.slice(), selectedRoles: selectedRoles.slice(),
        showTitular: showTitular, showSpecialty: showSpecialty, showFullTime: showFullTime, dayIds: selectedDayIds.slice(), floorIds: selectedFloorIds.slice(),
        planDayId: planDayId, signDayId: signDayId, halfPage: halfPage, includeEmpty: includeEmpty
      };
      var logoFile = logoInput.files[0];
      if (logoFile) { var reader = new FileReader(); reader.onload = function(e) { opts.logo = e.target.result; callback(opts); }; reader.readAsDataURL(logoFile); }
      else callback(opts);
    };

    // Footer buttons that update based on type
    var footerArea = el('div', { id: 'pdf-footer-buttons', style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } });
    var renderFooterButtons = function() {
      Tribunator.Utils.clearElement(footerArea);
      footerArea.appendChild(el('button', { className: 'btn btn-secondary', textContent: t('common.cancel'), onClick: function() { var ov = footerArea.closest('.modal-overlay'); if (ov) ov.remove(); } }));
      if (pdfType === 'tribunals') {
        footerArea.appendChild(el('button', { className: 'btn btn-primary', textContent: t('pdf.membersOnly'), onClick: function() { buildOpts(function(o) { o.membersOnly = true; self.generateTribunals(o); }); } }));
      }
      footerArea.appendChild(el('button', { className: 'btn btn-primary', textContent: t('pdf.generate'), onClick: function() {
        buildOpts(function(o) {
          if (pdfType === 'tribunals') self.generateTribunals(o);
          else if (pdfType === 'daily') self.generateDailyPlanning(o);
          else if (pdfType === 'plans') self.generateFloorPlans(o);
          else if (pdfType === 'signs') self.generateRoomSigns(o);
          else if (pdfType === 'directory') self.generateDirectory(o);
        });
      }}));
    };
    renderFooterButtons();

    Tribunator.Utils.showModal({
      title: t('tribunals.pdf'),
      body: el('div', {}, [
        typeArea,
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.filename') }), el('div', { style: { display: 'flex', gap: '6px' } }, [filenameInput, copyTitleBtn])]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.headerText') }), headerInput]),
        el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.subHeaderText') }), subHeaderInput]),
        el('div', { className: 'form-inline', style: { marginBottom: '12px' } }, [
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.logo') }), logoInput, el('span', { style: { fontSize: '10px', color: 'var(--text-muted)' }, textContent: t('pdf.logoHint') })]),
          el('div', { className: 'form-group' }, [el('label', { className: 'form-label', textContent: t('pdf.accentColor') }), colorInput])
        ]),
        optionsArea,
        footerArea
      ]),
      buttons: []
    });
  }
};

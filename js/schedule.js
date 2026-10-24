/**
 * Music Festival Management System - Performance Scheduling & Timeline Module
 * Handles scheduling CRUD, table view, interactive visual timeline swimlanes,
 * date switching, filtering, and real-time stage rider compatibility checks.
 */

window.FMS = window.FMS || {};

FMS.Schedule = (function () {
  let performancesList = [];
  let currentDateFilter = "2026-08-15";
  let currentStageFilter = "all";
  let currentArtistFilter = "all";
  let currentSearch = "";
  let currentViewMode = "timeline"; // 'timeline' or 'table'

  // Timeline boundaries (12:00 noon to 02:00 next day = 14 hours = 840 mins)
  const TIMELINE_START_HOUR = 12; // 12:00 PM
  const TIMELINE_TOTAL_HOURS = 14; // 12:00 to 02:00
  const TIMELINE_TOTAL_MINUTES = TIMELINE_TOTAL_HOURS * 60; // 840 mins

  function init() {
    performancesList = FMS.Storage.getPerformances();
    bindEvents();
    populateFilters();
    render();
  }

  function getPerformances() {
    return performancesList;
  }

  function bindEvents() {
    // View Switcher Buttons
    const btnTimeline = document.getElementById("btn-view-timeline");
    const btnTable = document.getElementById("btn-view-table");
    if (btnTimeline && btnTable) {
      btnTimeline.addEventListener("click", () => switchView("timeline"));
      btnTable.addEventListener("click", () => switchView("table"));
    }

    // Schedule Add Button
    const btnAdd = document.getElementById("btn-add-performance");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => openPerformanceModal(null));
    }

    // Date Switchers
    const dateButtons = document.querySelectorAll(".schedule-date-btn");
    dateButtons.forEach(btn => {
      btn.addEventListener("click", function () {
        dateButtons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentDateFilter = this.getAttribute("data-date");
        render();
      });
    });

    // Filters
    const stageFilter = document.getElementById("schedule-stage-filter");
    if (stageFilter) {
      stageFilter.addEventListener("change", function (e) {
        currentStageFilter = e.target.value;
        render();
      });
    }

    const artistFilter = document.getElementById("schedule-artist-filter");
    if (artistFilter) {
      artistFilter.addEventListener("change", function (e) {
        currentArtistFilter = e.target.value;
        render();
      });
    }

    const searchInput = document.getElementById("schedule-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        currentSearch = e.target.value.trim().toLowerCase();
        render();
      });
    }

    // Performance Modal Dynamic Calculation & Live Warnings
    const artistSelect = document.getElementById("perf-form-artist");
    const stageSelect = document.getElementById("perf-form-stage");
    const startTimeInput = document.getElementById("perf-form-start-time");

    if (artistSelect) {
      artistSelect.addEventListener("change", function () {
        onArtistSelectionChange();
        checkStageCompatibility();
      });
    }

    if (stageSelect) {
      stageSelect.addEventListener("change", checkStageCompatibility);
    }

    if (startTimeInput) {
      startTimeInput.addEventListener("change", onStartTimeChange);
    }

    const form = document.getElementById("performance-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  }

  function switchView(mode) {
    currentViewMode = mode;
    const btnTimeline = document.getElementById("btn-view-timeline");
    const btnTable = document.getElementById("btn-view-table");
    const timelineContainer = document.getElementById("schedule-timeline-view");
    const tableContainer = document.getElementById("schedule-table-view");

    if (mode === "timeline") {
      btnTimeline.classList.add("active");
      btnTable.classList.remove("active");
      timelineContainer.style.display = "block";
      tableContainer.style.display = "none";
    } else {
      btnTable.classList.add("active");
      btnTimeline.classList.remove("active");
      timelineContainer.style.display = "none";
      tableContainer.style.display = "block";
    }
    render();
  }

  function populateFilters() {
    const stageSelect = document.getElementById("schedule-stage-filter");
    const artistSelect = document.getElementById("schedule-artist-filter");
    const modalArtistSelect = document.getElementById("perf-form-artist");
    const modalStageSelect = document.getElementById("perf-form-stage");

    const stages = FMS.Storage.getStages();
    const artists = FMS.Storage.getArtists();

    if (stageSelect) {
      stageSelect.innerHTML = `<option value="all">All Stages (${stages.length})</option>` +
        stages.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
      stageSelect.value = currentStageFilter;
    }

    if (artistSelect) {
      artistSelect.innerHTML = `<option value="all">All Artists (${artists.length})</option>` +
        artists.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
      artistSelect.value = currentArtistFilter;
    }

    if (modalArtistSelect) {
      modalArtistSelect.innerHTML = `<option value="">-- Select Festival Artist --</option>` +
        artists.map(a => `<option value="${a.id}">${a.name} (${a.genre})</option>`).join("");
    }

    if (modalStageSelect) {
      modalStageSelect.innerHTML = `<option value="">-- Select Stage --</option>` +
        stages.map(s => `<option value="${s.id}">${s.name} (Cap: ${Number(s.capacity).toLocaleString()})</option>`).join("");
    }
  }

  function onArtistSelectionChange() {
    const artistSelect = document.getElementById("perf-form-artist");
    const artistId = artistSelect ? artistSelect.value : "";
    if (!artistId) return;

    const artist = FMS.Storage.getArtists().find(a => a.id === artistId);
    if (!artist) return;

    const setDur = document.getElementById("perf-form-setup-duration");
    const tdDur = document.getElementById("perf-form-teardown-duration");

    // Suggest durations if empty or default
    if (setDur && !setDur.value) setDur.value = "20";
    if (tdDur && !tdDur.value) tdDur.value = "15";

    onStartTimeChange();
  }

  function onStartTimeChange() {
    const startTimeInput = document.getElementById("perf-form-start-time");
    const endTimeInput = document.getElementById("perf-form-end-time");
    const artistSelect = document.getElementById("perf-form-artist");

    if (!startTimeInput || !endTimeInput || !startTimeInput.value) return;

    const artistId = artistSelect ? artistSelect.value : "";
    let durationMins = 60;
    if (artistId) {
      const artist = FMS.Storage.getArtists().find(a => a.id === artistId);
      if (artist && artist.performanceDuration) {
        durationMins = artist.performanceDuration;
      }
    }

    const [sh, sm] = startTimeInput.value.split(":").map(Number);
    let endMinutesTotal = sh * 60 + sm + durationMins;
    let eh = Math.floor(endMinutesTotal / 60) % 24;
    let em = endMinutesTotal % 60;
    endTimeInput.value = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  }

  function checkStageCompatibility() {
    const artistId = document.getElementById("perf-form-artist")?.value;
    const stageId = document.getElementById("perf-form-stage")?.value;
    const warningBox = document.getElementById("perf-form-compatibility-warning");
    if (!warningBox) return;

    if (!artistId || !stageId) {
      warningBox.style.display = "none";
      return;
    }

    const artist = FMS.Storage.getArtists().find(a => a.id === artistId);
    const stage = FMS.Storage.getStages().find(s => s.id === stageId);

    if (!artist || !stage) {
      warningBox.style.display = "none";
      return;
    }

    const required = artist.requiredEquipment || [];
    const available = stage.equipment || [];
    const missing = required.filter(eq => !available.includes(eq));

    if (missing.length > 0) {
      const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));
      const missingNames = missing.map(id => catalogMap.get(id) || id);
      warningBox.style.display = "block";
      warningBox.innerHTML = `
        <div class="warning-callout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <strong>Technical Compatibility Warning:</strong>
            <p>Selected stage lacks <strong>${missing.length}</strong> required rider item(s): ${missingNames.join(", ")}.</p>
          </div>
        </div>
      `;
    } else {
      warningBox.style.display = "block";
      warningBox.innerHTML = `
        <div class="success-callout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <strong>Technical Rider Verified:</strong>
            <p>Stage "${escapeHtml(stage.name)}" satisfies all technical and backline requirements for ${escapeHtml(artist.name)}.</p>
          </div>
        </div>
      `;
    }
  }

  function getFilteredPerformances() {
    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();
    const artistMap = new Map(artists.map(a => [a.id, a]));
    const stageMap = new Map(stages.map(s => [s.id, s]));

    return performancesList.filter(p => {
      const matchesDate = currentDateFilter === "all" || p.date === currentDateFilter;
      const matchesStage = currentStageFilter === "all" || p.stageId === currentStageFilter;
      const matchesArtist = currentArtistFilter === "all" || p.artistId === currentArtistFilter;

      const artist = artistMap.get(p.artistId);
      const stage = stageMap.get(p.stageId);
      const matchesSearch = !currentSearch ||
        (artist && artist.name.toLowerCase().includes(currentSearch)) ||
        (stage && stage.name.toLowerCase().includes(currentSearch)) ||
        p.id.toLowerCase().includes(currentSearch);

      return matchesDate && matchesStage && matchesArtist && matchesSearch;
    }).sort((a, b) => {
      // Sort chronologically by date and startTime
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }

  function render() {
    populateFilters();
    const filtered = getFilteredPerformances();
    const conflicts = FMS.Conflicts.detectAllConflicts(
      performancesList,
      FMS.Storage.getArtists(),
      FMS.Storage.getStages()
    );

    const countBadge = document.getElementById("schedule-count-badge");
    if (countBadge) {
      countBadge.textContent = `${filtered.length} Scheduled Sets`;
    }

    if (currentViewMode === "timeline") {
      renderTimelineView(filtered, conflicts);
    } else {
      renderTableView(filtered, conflicts);
    }
  }

  /**
   * Converts "HH:MM" to minutes relative to TIMELINE_START_HOUR (12:00)
   */
  function timeToTimelineMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    let totalMinutes = h * 60 + m;
    const startMinutes = TIMELINE_START_HOUR * 60; // 12 * 60 = 720

    // If time is past midnight (00:00 - 04:00), add 24 hours
    if (h < TIMELINE_START_HOUR) {
      totalMinutes += 24 * 60;
    }
    return Math.max(0, totalMinutes - startMinutes);
  }

  function renderTimelineView(filteredPerfs, conflicts) {
    const container = document.getElementById("timeline-stages-swimlanes");
    const headerGrid = document.getElementById("timeline-hour-markers");
    if (!container || !headerGrid) return;

    // 1. Render Hour Headers
    let headerHtml = "";
    for (let i = 0; i < TIMELINE_TOTAL_HOURS; i++) {
      let hour24 = (TIMELINE_START_HOUR + i) % 24;
      let displayHour = hour24 === 0 ? "12 AM" : hour24 === 12 ? "12 PM" : hour24 > 12 ? `${hour24 - 12} PM` : `${hour24} AM`;
      headerHtml += `<div class="timeline-hour-col"><span class="hour-tag">${displayHour}</span></div>`;
    }
    headerGrid.innerHTML = headerHtml;

    // 2. Render Stage Swimlanes
    const stages = FMS.Storage.getStages();
    const artists = FMS.Storage.getArtists();
    const artistMap = new Map(artists.map(a => [a.id, a]));

    const stagesToRender = currentStageFilter === "all"
      ? stages
      : stages.filter(s => s.id === currentStageFilter);

    if (stagesToRender.length === 0) {
      container.innerHTML = `<div class="empty-state-card"><p>No stages found.</p></div>`;
      return;
    }

    // Map conflicts by performance ID
    const perfConflictMap = new Map();
    conflicts.forEach(c => {
      c.performanceIds.forEach(pid => {
        if (!perfConflictMap.has(pid)) perfConflictMap.set(pid, []);
        perfConflictMap.get(pid).push(c);
      });
    });

    let lanesHtml = "";
    stagesToRender.forEach(stage => {
      const stagePerfs = filteredPerfs.filter(p => p.stageId === stage.id && p.status !== "Cancelled");

      const blocksHtml = stagePerfs.map(perf => {
        const artist = artistMap.get(perf.artistId) || { name: perf.artistId, genre: "Artist" };
        const perfConflicts = perfConflictMap.get(perf.id) || [];
        const isConflicted = perfConflicts.length > 0;

        const startMins = timeToTimelineMinutes(perf.startTime);
        let endMins = timeToTimelineMinutes(perf.endTime);
        if (endMins <= startMins) endMins += 60; // Safety
        const durationMins = endMins - startMins;

        const leftPct = ((startMins / TIMELINE_TOTAL_MINUTES) * 100).toFixed(2);
        const widthPct = Math.max(2.5, (durationMins / TIMELINE_TOTAL_MINUTES) * 100).toFixed(2);

        const conflictBadge = isConflicted
          ? `<span class="timeline-conflict-flag" title="${perfConflicts.length} conflict(s) detected!">⚠️ ${perfConflicts.length}</span>`
          : "";

        const conflictClass = isConflicted ? "timeline-block-conflicted" : "";

        return `
          <div class="timeline-perf-block ${conflictClass}"
               style="left: ${leftPct}%; width: ${widthPct}%;"
               onclick="FMS.Schedule.openPerformanceModal('${perf.id}')"
               title="${escapeHtml(artist.name)} (${perf.startTime} - ${perf.endTime})&#10;${isConflicted ? perfConflicts.map(c => c.type).join(', ') : 'No conflicts'}">
            <div class="timeline-block-inner">
              <span class="timeline-artist-name truncate">${escapeHtml(artist.name)}</span>
              <span class="timeline-set-time">${perf.startTime} - ${perf.endTime}</span>
            </div>
            ${conflictBadge}
          </div>
        `;
      }).join("");

      lanesHtml += `
        <div class="timeline-swimlane-row">
          <div class="timeline-stage-info">
            <h4 class="stage-swimlane-name truncate">${escapeHtml(stage.name)}</h4>
            <span class="stage-swimlane-cap">Cap: ${Number(stage.capacity).toLocaleString()}</span>
          </div>
          <div class="timeline-track-lane">
            <!-- Hour grid background lines -->
            <div class="track-grid-lines">
              ${Array(TIMELINE_TOTAL_HOURS).fill(0).map(() => '<div class="track-hour-cell"></div>').join("")}
            </div>
            <!-- Performance Blocks -->
            <div class="track-blocks-container">
              ${blocksHtml || '<div class="no-sets-placeholder">No sets scheduled on this date</div>'}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = lanesHtml;
  }

  function renderTableView(filteredPerfs, conflicts) {
    const tbody = document.getElementById("schedule-table-tbody");
    const emptyState = document.getElementById("schedule-empty-state");
    if (!tbody) return;

    if (filteredPerfs.length === 0) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();
    const artistMap = new Map(artists.map(a => [a.id, a]));
    const stageMap = new Map(stages.map(s => [s.id, s]));

    const perfConflictMap = new Map();
    conflicts.forEach(c => {
      c.performanceIds.forEach(pid => {
        if (!perfConflictMap.has(pid)) perfConflictMap.set(pid, []);
        perfConflictMap.get(pid).push(c);
      });
    });

    tbody.innerHTML = filteredPerfs.map(perf => {
      const artist = artistMap.get(perf.artistId) || { name: perf.artistId, genre: "N/A" };
      const stage = stageMap.get(perf.stageId) || { name: perf.stageId };
      const perfConflicts = perfConflictMap.get(perf.id) || [];
      const isConflicted = perfConflicts.length > 0;

      const statusBadge = isConflicted
        ? `<span class="badge badge-danger">⚠️ ${perfConflicts.length} Conflict(s)</span>`
        : perf.status === "Cancelled"
          ? `<span class="badge badge-subtle">Cancelled</span>`
          : `<span class="badge badge-success">Valid</span>`;

      return `
        <tr class="${isConflicted ? 'row-conflicted' : ''}">
          <td>
            <strong>${perf.date}</strong>
            <div class="text-xs text-muted">${perf.id}</div>
          </td>
          <td>
            <div class="font-semibold">${perf.startTime} - ${perf.endTime}</div>
            <div class="text-xs text-muted">Set: ${perf.raw?.duration || ''}</div>
          </td>
          <td>
            <div class="font-semibold">${escapeHtml(artist.name)}</div>
            <div class="text-xs text-muted">${artist.genre}</div>
          </td>
          <td>
            <div>${escapeHtml(stage.name)}</div>
          </td>
          <td>
            ${perf.soundcheckStartTime && perf.soundcheckEndTime ? `${perf.soundcheckStartTime} - ${perf.soundcheckEndTime}` : '<span class="text-muted">None</span>'}
          </td>
          <td>
            <span class="text-xs">${perf.setupDuration || 15}m setup / ${perf.teardownDuration || 15}m teardown</span>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon" title="Edit Performance" onclick="FMS.Schedule.openPerformanceModal('${perf.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete Performance" onclick="FMS.Schedule.deletePerformance('${perf.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function openPerformanceModal(perfOrId = null) {
    const modal = document.getElementById("performance-modal");
    const modalTitle = document.getElementById("performance-modal-title");
    const form = document.getElementById("performance-form");
    if (!modal || !form) return;

    form.reset();
    populateFilters();

    let perf = null;
    if (typeof perfOrId === "string") {
      perf = performancesList.find(p => p.id === perfOrId);
    } else if (perfOrId && typeof perfOrId === "object") {
      perf = perfOrId;
    }

    const isEdit = !!perf;
    modalTitle.textContent = isEdit ? `Edit Scheduled Performance: ${perf.id}` : "Schedule Festival Performance";

    document.getElementById("perf-form-mode").value = isEdit ? "edit" : "add";
    document.getElementById("perf-form-id").value = isEdit ? perf.id : generatePerfId();

    if (isEdit) {
      document.getElementById("perf-form-artist").value = perf.artistId;
      document.getElementById("perf-form-stage").value = perf.stageId;
      document.getElementById("perf-form-date").value = perf.date;
      document.getElementById("perf-form-start-time").value = perf.startTime;
      document.getElementById("perf-form-end-time").value = perf.endTime;
      document.getElementById("perf-form-sc-start").value = perf.soundcheckStartTime || "";
      document.getElementById("perf-form-sc-end").value = perf.soundcheckEndTime || "";
      document.getElementById("perf-form-setup-duration").value = perf.setupDuration || 20;
      document.getElementById("perf-form-teardown-duration").value = perf.teardownDuration || 15;
      document.getElementById("perf-form-status").value = perf.status || "Confirmed";
      document.getElementById("perf-form-notes").value = perf.notes || "";
    } else {
      document.getElementById("perf-form-date").value = currentDateFilter !== "all" ? currentDateFilter : "2026-08-15";
      document.getElementById("perf-form-start-time").value = "18:00";
      document.getElementById("perf-form-end-time").value = "19:00";
      document.getElementById("perf-form-setup-duration").value = "20";
      document.getElementById("perf-form-teardown-duration").value = "15";
      document.getElementById("perf-form-status").value = "Confirmed";
    }

    checkStageCompatibility();
    modal.classList.add("open");
  }

  function generatePerfId() {
    let nextNum = 1;
    const existingNums = performancesList.map(p => {
      const match = p.id.match(/^PERF-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    }
    return `PERF-${String(nextNum).padStart(3, "0")}`;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById("perf-form-mode").value;
    const id = document.getElementById("perf-form-id").value.trim().toUpperCase();
    const artistId = document.getElementById("perf-form-artist").value;
    const stageId = document.getElementById("perf-form-stage").value;
    const date = document.getElementById("perf-form-date").value;
    const startTime = document.getElementById("perf-form-start-time").value;
    const endTime = document.getElementById("perf-form-end-time").value;
    const soundcheckStartTime = document.getElementById("perf-form-sc-start").value || null;
    const soundcheckEndTime = document.getElementById("perf-form-sc-end").value || null;
    const setupDuration = parseInt(document.getElementById("perf-form-setup-duration").value, 10) || 15;
    const teardownDuration = parseInt(document.getElementById("perf-form-teardown-duration").value, 10) || 15;
    const status = document.getElementById("perf-form-status").value;
    const notes = document.getElementById("perf-form-notes").value.trim();

    if (!id || !artistId || !stageId || !date || !startTime || !endTime) {
      alert("Please fill in all required scheduling fields (Artist, Stage, Date, Start Time, and End Time).");
      return;
    }

    const perfData = {
      id,
      artistId,
      stageId,
      date,
      startTime,
      endTime,
      soundcheckStartTime,
      soundcheckEndTime,
      setupDuration,
      teardownDuration,
      status,
      notes
    };

    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();
    const artist = artists.find(a => a.id === artistId);
    const stage = stages.find(s => s.id === stageId);

    if (mode === "add") {
      performancesList.push(perfData);
      FMS.Storage.logActivity(`Scheduled ${artist ? artist.name : artistId} on ${stage ? stage.name : stageId} at ${startTime}.`, "success");
      FMS.App.showToast(`Performance scheduled successfully.`, "success");
    } else {
      const idx = performancesList.findIndex(p => p.id === id);
      if (idx !== -1) {
        performancesList[idx] = perfData;
        FMS.Storage.logActivity(`Updated schedule for ${artist ? artist.name : artistId} (${id}).`, "info");
        FMS.App.showToast(`Performance updated.`, "success");
      }
    }

    FMS.Storage.savePerformances(performancesList);
    closePerformanceModal();
    render();
    FMS.App.refreshAll();
  }

  function closePerformanceModal() {
    const modal = document.getElementById("performance-modal");
    if (modal) modal.classList.remove("open");
  }

  function deletePerformance(id) {
    const perf = performancesList.find(p => p.id === id);
    if (!perf) return;

    if (confirm(`Cancel and delete performance ${perf.id}?`)) {
      performancesList = performancesList.filter(p => p.id !== id);
      FMS.Storage.savePerformances(performancesList);
      FMS.Storage.logActivity(`Removed performance ${id} from schedule.`, "warning");
      FMS.App.showToast(`Performance removed.`, "info");
      render();
      FMS.App.refreshAll();
    }
  }

  return {
    init,
    getPerformances,
    openPerformanceModal,
    closePerformanceModal,
    deletePerformance,
    switchView,
    render
  };
})();

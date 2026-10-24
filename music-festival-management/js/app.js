/**
 * Music Festival Management System - Main Application Controller
 * Handles Navigation Routing, Dashboard Analytics, Dedicated Conflict Center,
 * Technical Matrix, Modal Event Delegation, and Toast Notification Dispatcher.
 */

window.FMS = window.FMS || {};

FMS.App = (function () {
  let currentTab = "dashboard";
  let conflictFilterType = "all";
  let conflictSearchTerm = "";

  function init() {
    // 1. Initialize persistent storage layer
    FMS.Storage.init();

    // 2. Initialize sub-modules
    FMS.Artists.init();
    FMS.Stages.init();
    FMS.Schedule.init();

    // 3. Setup global DOM events
    bindNavigation();
    bindGlobalModals();
    bindConflictPanelEvents();
    bindTechnicalMatrixEvents();
    bindReportsEvents();

    // 4. Initial render of current tab
    renderDashboard();
    renderConflictCenter();
    renderTechnicalMatrix();

    console.log("Festival Management System initialized successfully.");
  }

  /**
   * Refreshes all dependent views when data changes
   */
  function refreshAll() {
    renderDashboard();
    renderConflictCenter();
    renderTechnicalMatrix();
    FMS.Artists.render();
    FMS.Stages.render();
    FMS.Schedule.render();
  }

  // --- NAVIGATION ROUTER ---
  function bindNavigation() {
    const navLinks = document.querySelectorAll(".nav-link[data-tab]");
    navLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const tab = this.getAttribute("data-tab");
        switchTab(tab);
      });
    });

    // Mobile sidebar hamburger toggle
    const menuBtn = document.getElementById("mobile-menu-toggle");
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        if (overlay) overlay.classList.toggle("visible");
      });
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("open");
        overlay.classList.remove("visible");
      });
    }

    // Reset Demo Data Button
    const btnResetDemo = document.getElementById("btn-reset-demo-data");
    if (btnResetDemo) {
      btnResetDemo.addEventListener("click", () => {
        if (confirm("Reset festival data to original sample schedule? This will restore initial artists, stages, and intentional conflicts.")) {
          FMS.Storage.resetToDemoData(true);
          refreshAll();
          showToast("Sample demo data has been restored.", "info");
        }
      });
    }
  }

  function switchTab(tabName) {
    currentTab = tabName;

    // Update active nav links
    document.querySelectorAll(".nav-link[data-tab]").forEach(link => {
      if (link.getAttribute("data-tab") === tabName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update tab view visibility
    document.querySelectorAll(".tab-view").forEach(view => {
      if (view.id === `view-${tabName}`) {
        view.style.display = "block";
      } else {
        view.style.display = "none";
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.querySelector(".app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("visible");

    // Tab-specific refreshes
    if (tabName === "dashboard") renderDashboard();
    if (tabName === "conflicts") renderConflictCenter();
    if (tabName === "technical") renderTechnicalMatrix();
    if (tabName === "schedule") FMS.Schedule.render();
    if (tabName === "artists") FMS.Artists.render();
    if (tabName === "stages") FMS.Stages.render();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- DASHBOARD ANALYTICS ---
  function renderDashboard() {
    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();
    const perfs = FMS.Storage.getPerformances();
    const conflicts = FMS.Conflicts.detectAllConflicts(perfs, artists, stages);

    // Update KPI Counters
    const kpiArtists = document.getElementById("stat-total-artists");
    const kpiStages = document.getElementById("stat-total-stages");
    const kpiPerfs = document.getElementById("stat-total-perfs");
    const kpiConflicts = document.getElementById("stat-total-conflicts");
    const navConflictBadge = document.getElementById("nav-conflict-badge");

    if (kpiArtists) kpiArtists.textContent = artists.length;
    if (kpiStages) kpiStages.textContent = stages.length;
    if (kpiPerfs) kpiPerfs.textContent = perfs.filter(p => p.status !== "Cancelled").length;
    if (kpiConflicts) {
      kpiConflicts.textContent = conflicts.length;
      kpiConflicts.className = conflicts.length > 0 ? "stat-val text-danger" : "stat-val text-success";
    }

    if (navConflictBadge) {
      navConflictBadge.textContent = conflicts.length;
      navConflictBadge.style.display = conflicts.length > 0 ? "inline-flex" : "none";
    }

    // Conflict Alert Banner on Dashboard
    const conflictAlertBanner = document.getElementById("dashboard-conflict-alert");
    if (conflictAlertBanner) {
      if (conflicts.length > 0) {
        conflictAlertBanner.style.display = "flex";
        conflictAlertBanner.innerHTML = `
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">
            <h4>${conflicts.length} Active Schedule Conflict(s) Detected</h4>
            <p>Direct stage overlaps, artist collisions, or technical incompatibilities require organizer attention.</p>
          </div>
          <button class="btn btn-danger btn-sm" onclick="FMS.App.switchTab('conflicts')">Inspect & Resolve</button>
        `;
      } else {
        conflictAlertBanner.style.display = "none";
      }
    }

    // Stage Distribution Chart
    const distContainer = document.getElementById("stage-distribution-chart");
    if (distContainer) {
      const activePerfs = perfs.filter(p => p.status !== "Cancelled");
      const total = activePerfs.length || 1;

      let distHtml = "";
      stages.forEach(st => {
        const count = activePerfs.filter(p => p.stageId === st.id).length;
        const pct = Math.round((count / total) * 100);
        distHtml += `
          <div class="dist-row">
            <div class="dist-labels">
              <span class="dist-stage-name truncate font-medium">${st.name}</span>
              <span class="dist-count">${count} set${count === 1 ? '' : 's'} (${pct}%)</span>
            </div>
            <div class="dist-bar-track">
              <div class="dist-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      });
      distContainer.innerHTML = distHtml || '<p class="text-muted">No stages configured.</p>';
    }

    // Upcoming Performances list
    const upcomingContainer = document.getElementById("dashboard-upcoming-list");
    if (upcomingContainer) {
      const activePerfs = perfs.filter(p => p.status !== "Cancelled").sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      }).slice(0, 5);

      const artistMap = new Map(artists.map(a => [a.id, a]));
      const stageMap = new Map(stages.map(s => [s.id, s]));

      if (activePerfs.length === 0) {
        upcomingContainer.innerHTML = '<p class="text-muted">No performances scheduled.</p>';
      } else {
        upcomingContainer.innerHTML = activePerfs.map(p => {
          const artist = artistMap.get(p.artistId) || { name: p.artistId, genre: "N/A" };
          const stage = stageMap.get(p.stageId) || { name: p.stageId };
          return `
            <div class="upcoming-perf-item">
              <div class="upcoming-time-badge">
                <span class="perf-date">${p.date.slice(5)}</span>
                <span class="perf-time font-bold">${p.startTime}</span>
              </div>
              <div class="upcoming-info truncate">
                <div class="upcoming-artist font-semibold truncate">${escapeHtml(artist.name)}</div>
                <div class="upcoming-stage text-xs text-muted truncate">${escapeHtml(stage.name)} &bull; ${artist.genre}</div>
              </div>
              <button class="btn btn-ghost btn-xs" onclick="FMS.Schedule.openPerformanceModal('${p.id}')">View</button>
            </div>
          `;
        }).join("");
      }
    }

    // Recent Activity Log
    const activityContainer = document.getElementById("dashboard-activity-list");
    if (activityContainer) {
      const logs = FMS.Storage.getActivityLogs().slice(0, 8);
      if (logs.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted">No recent activity recorded.</p>';
      } else {
        activityContainer.innerHTML = logs.map(l => {
          const time = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let badgeClass = "badge-subtle";
          if (l.type === "success") badgeClass = "badge-success";
          if (l.type === "warning") badgeClass = "badge-danger";

          return `
            <div class="activity-log-item">
              <span class="activity-time text-xs text-muted">${time}</span>
              <span class="activity-msg">${escapeHtml(l.message)}</span>
            </div>
          `;
        }).join("");
      }
    }
  }

  // --- DEDICATED CONFLICT RESOLUTION CENTER ---
  function bindConflictPanelEvents() {
    const filterSelect = document.getElementById("conflict-type-filter");
    if (filterSelect) {
      filterSelect.addEventListener("change", function (e) {
        conflictFilterType = e.target.value;
        renderConflictCenter();
      });
    }

    const searchInput = document.getElementById("conflict-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        conflictSearchTerm = e.target.value.trim().toLowerCase();
        renderConflictCenter();
      });
    }

    const btnRefresh = document.getElementById("btn-recalculate-conflicts");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => {
        renderConflictCenter();
        showToast("Conflict calculations refreshed.", "info");
      });
    }
  }

  function renderConflictCenter() {
    const container = document.getElementById("conflicts-list-container");
    const emptyState = document.getElementById("conflicts-empty-state");
    const summaryBadge = document.getElementById("conflicts-total-badge");
    if (!container) return;

    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();
    const perfs = FMS.Storage.getPerformances();

    const allConflicts = FMS.Conflicts.detectAllConflicts(perfs, artists, stages);

    if (summaryBadge) {
      summaryBadge.textContent = `${allConflicts.length} Conflict(s) Found`;
      summaryBadge.className = allConflicts.length > 0 ? "badge badge-danger" : "badge badge-success";
    }

    // Filter
    const filtered = allConflicts.filter(c => {
      const matchesType = conflictFilterType === "all" || c.type === conflictFilterType || c.category === conflictFilterType;
      const matchesSearch = !conflictSearchTerm ||
        c.type.toLowerCase().includes(conflictSearchTerm) ||
        (c.artistNames || []).some(n => n.toLowerCase().includes(conflictSearchTerm)) ||
        (c.stageNames || []).some(s => s.toLowerCase().includes(conflictSearchTerm)) ||
        c.explanation.toLowerCase().includes(conflictSearchTerm);
      return matchesType && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    container.innerHTML = filtered.map(conf => {
      const severityClass = conf.severity === "critical" ? "card-conflict-critical" : "card-conflict-warning";
      const sevBadge = conf.severity === "critical" ? '<span class="badge badge-danger">Critical Collision</span>' : '<span class="badge badge-warning">Turnaround / Warning</span>';

      const perfButtons = conf.performanceIds.map(pid => {
        return `<button class="btn btn-secondary btn-xs" onclick="FMS.Schedule.openPerformanceModal('${pid}')">Edit Set (${pid})</button>`;
      }).join(" ");

      return `
        <div class="card conflict-card ${severityClass}">
          <div class="conflict-card-header">
            <div>
              ${sevBadge}
              <span class="badge badge-subtle">${conf.type}</span>
              <span class="conflict-meta-date">${conf.date || ''} ${conf.timeRange ? `&bull; ${conf.timeRange}` : ''}</span>
            </div>
            <div class="conflict-quick-actions">
              ${perfButtons}
            </div>
          </div>
          <div class="conflict-card-body">
            <div class="conflict-parties">
              <div class="party-item">
                <span class="party-label">Artists:</span>
                <span class="party-value font-semibold">${escapeHtml((conf.artistNames || []).join(" & "))}</span>
              </div>
              <div class="party-item">
                <span class="party-label">Venue / Stage:</span>
                <span class="party-value">${escapeHtml((conf.stageNames || []).join(", "))}</span>
              </div>
            </div>
            <div class="conflict-explanation">
              <strong>Collision Reason:</strong>
              <p>${escapeHtml(conf.explanation)}</p>
            </div>
            <div class="conflict-resolution">
              <strong>Suggested Fix:</strong>
              <p>${escapeHtml(conf.suggestedResolution)}</p>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- TECHNICAL MATRIX VIEW ---
  function bindTechnicalMatrixEvents() {
    const artistSelect = document.getElementById("matrix-artist-select");
    const stageSelect = document.getElementById("matrix-stage-select");

    if (artistSelect) {
      artistSelect.addEventListener("change", updateTechnicalComparison);
    }
    if (stageSelect) {
      stageSelect.addEventListener("change", updateTechnicalComparison);
    }
  }

  function renderTechnicalMatrix() {
    const artistSelect = document.getElementById("matrix-artist-select");
    const stageSelect = document.getElementById("matrix-stage-select");
    if (!artistSelect || !stageSelect) return;

    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();

    const curArtist = artistSelect.value;
    const curStage = stageSelect.value;

    artistSelect.innerHTML = artists.map(a => `<option value="${a.id}">${a.name} (${a.genre})</option>`).join("");
    stageSelect.innerHTML = stages.map(s => `<option value="${s.id}">${s.name}</option>`).join("");

    if (curArtist && artists.some(a => a.id === curArtist)) artistSelect.value = curArtist;
    if (curStage && stages.some(s => s.id === curStage)) stageSelect.value = curStage;

    updateTechnicalComparison();
  }

  function updateTechnicalComparison() {
    const artistId = document.getElementById("matrix-artist-select")?.value;
    const stageId = document.getElementById("matrix-stage-select")?.value;
    const resultBox = document.getElementById("matrix-audit-result");
    if (!resultBox) return;

    const artist = FMS.Storage.getArtists().find(a => a.id === artistId);
    const stage = FMS.Storage.getStages().find(s => s.id === stageId);

    if (!artist || !stage) {
      resultBox.innerHTML = '<p class="text-muted">Select an artist and a stage to inspect technical compatibility.</p>';
      return;
    }

    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));
    const required = artist.requiredEquipment || [];
    const available = stage.equipment || [];

    const matched = required.filter(eq => available.includes(eq));
    const missing = required.filter(eq => !available.includes(eq));

    const is100Percent = missing.length === 0;

    let auditStatusHtml = is100Percent
      ? `<div class="audit-summary-badge audit-passed">✓ 100% Fully Compatible Stage</div>`
      : `<div class="audit-summary-badge audit-failed">⚠️ Incompatible - ${missing.length} Missing Equipment Item(s)</div>`;

    resultBox.innerHTML = `
      ${auditStatusHtml}
      <div class="matrix-grid-detail">
        <div class="matrix-column">
          <h4>Required by ${escapeHtml(artist.name)} (${required.length} items)</h4>
          <ul class="matrix-check-list">
            ${required.map(eq => {
              const hasIt = available.includes(eq);
              return `
                <li class="${hasIt ? 'has-item' : 'missing-item'}">
                  ${hasIt ? '✓' : '✗'} ${catalogMap.get(eq) || eq}
                </li>
              `;
            }).join("") || '<li class="text-muted">No specific backline requirements</li>'}
          </ul>
        </div>
        <div class="matrix-column">
          <h4>Available on ${escapeHtml(stage.name)} (${available.length} items)</h4>
          <p class="text-xs text-muted mb-2">Stage Turnaround: ${stage.turnaroundMinutes}m &bull; Cap: ${Number(stage.capacity).toLocaleString()}</p>
          <div class="pills-row">
            ${available.map(eq => `<span class="badge badge-subtle">${catalogMap.get(eq) || eq}</span>`).join(" ")}
          </div>
        </div>
      </div>
    `;
  }

  // --- REPORTS & EXPORT BINDINGS ---
  function bindReportsEvents() {
    const btnExpArtists = document.getElementById("btn-export-artists-csv");
    const btnExpSchedule = document.getElementById("btn-export-schedule-csv");
    const btnExpConflicts = document.getElementById("btn-export-conflicts-csv");
    const btnPrintD1 = document.getElementById("btn-print-timetable-day1");
    const btnPrintD2 = document.getElementById("btn-print-timetable-day2");

    if (btnExpArtists) btnExpArtists.addEventListener("click", FMS.Reports.exportArtistsCSV);
    if (btnExpSchedule) btnExpSchedule.addEventListener("click", FMS.Reports.exportScheduleCSV);
    if (btnExpConflicts) btnExpConflicts.addEventListener("click", FMS.Reports.exportConflictsCSV);

    if (btnPrintD1) btnPrintD1.addEventListener("click", () => FMS.Reports.printTimetable("2026-08-15"));
    if (btnPrintD2) btnPrintD2.addEventListener("click", () => FMS.Reports.printTimetable("2026-08-16"));
  }

  // --- MODAL CONTROLLER & BACKDROP CLICKS ---
  function bindGlobalModals() {
    // Backdrop click and close buttons
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", function (e) {
        if (e.target === this) {
          this.classList.remove("open");
        }
      });
    });

    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const modal = this.closest(".modal-backdrop");
        if (modal) modal.classList.remove("open");
      });
    });

    // Escape key closes modals
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3500);
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

  // Public API
  return {
    init,
    refreshAll,
    switchTab,
    showToast,
    renderDashboard,
    renderConflictCenter,
    renderTechnicalMatrix
  };
})();

// Bootstrap application on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  FMS.App.init();
});

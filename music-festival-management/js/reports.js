/**
 * Music Festival Management System - Reports & Export Module
 * Generates dynamic CSV exports for Artists, Schedules, and Conflict Reports.
 * Generates print-ready high-contrast festival timetables via native window.print().
 */

window.FMS = window.FMS || {};

FMS.Reports = (function () {
  /**
   * Helper: Escapes field values for standard RFC 4180 CSV format
   */
  function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  }

  /**
   * Triggers native browser file download using Blob URL
   */
  function triggerDownload(filename, csvContent) {
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * 1. Export Artists Roster as CSV
   */
  function exportArtistsCSV() {
    const artists = FMS.Storage.getArtists();
    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));

    const headers = [
      "Artist ID",
      "Artist / Band Name",
      "Genre",
      "Contact Person",
      "Email",
      "Phone",
      "Performers Count",
      "Set Duration (mins)",
      "Soundcheck (mins)",
      "Required Equipment",
      "Technical Rider Notes",
      "Additional Notes"
    ];

    const rows = artists.map(a => {
      const equipNames = (a.requiredEquipment || []).map(id => catalogMap.get(id) || id).join("; ");
      return [
        escapeCSV(a.id),
        escapeCSV(a.name),
        escapeCSV(a.genre),
        escapeCSV(a.contactPerson),
        escapeCSV(a.email),
        escapeCSV(a.phone),
        escapeCSV(a.performersCount),
        escapeCSV(a.performanceDuration),
        escapeCSV(a.soundcheckDuration),
        escapeCSV(equipNames),
        escapeCSV(a.technicalNotes),
        escapeCSV(a.notes)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    triggerDownload(`festival-artists-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    FMS.App.showToast("Artists CSV downloaded successfully.", "success");
    FMS.Storage.logActivity("Exported full Artists roster to CSV.", "info");
  }

  /**
   * 2. Export Festival Schedule as CSV
   */
  function exportScheduleCSV() {
    const perfs = FMS.Storage.getPerformances();
    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();

    const artistMap = new Map(artists.map(a => [a.id, a]));
    const stageMap = new Map(stages.map(s => [s.id, s]));

    const headers = [
      "Performance ID",
      "Date",
      "Stage ID",
      "Stage Name",
      "Artist ID",
      "Artist Name",
      "Genre",
      "Show Start Time",
      "Show End Time",
      "Soundcheck Window",
      "Setup (mins)",
      "Teardown (mins)",
      "Status",
      "Notes"
    ];

    const rows = perfs.map(p => {
      const artist = artistMap.get(p.artistId) || {};
      const stage = stageMap.get(p.stageId) || {};
      const scWindow = p.soundcheckStartTime && p.soundcheckEndTime
        ? `${p.soundcheckStartTime} - ${p.soundcheckEndTime}`
        : "None";

      return [
        escapeCSV(p.id),
        escapeCSV(p.date),
        escapeCSV(p.stageId),
        escapeCSV(stage.name || p.stageId),
        escapeCSV(p.artistId),
        escapeCSV(artist.name || p.artistId),
        escapeCSV(artist.genre || "N/A"),
        escapeCSV(p.startTime),
        escapeCSV(p.endTime),
        escapeCSV(scWindow),
        escapeCSV(p.setupDuration),
        escapeCSV(p.teardownDuration),
        escapeCSV(p.status),
        escapeCSV(p.notes)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    triggerDownload(`festival-schedule-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    FMS.App.showToast("Schedule CSV downloaded successfully.", "success");
    FMS.Storage.logActivity("Exported Festival Schedule to CSV.", "info");
  }

  /**
   * 3. Export Conflict Audit Report as CSV
   */
  function exportConflictsCSV() {
    const perfs = FMS.Storage.getPerformances();
    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();

    const conflicts = FMS.Conflicts.detectAllConflicts(perfs, artists, stages);

    const headers = [
      "Conflict ID",
      "Type",
      "Severity",
      "Date",
      "Time Window",
      "Affected Artists",
      "Affected Stages",
      "Affected Performance IDs",
      "Detailed Explanation",
      "Suggested Resolution"
    ];

    const rows = conflicts.map(c => [
      escapeCSV(c.id),
      escapeCSV(c.type),
      escapeCSV(c.severity.toUpperCase()),
      escapeCSV(c.date || "N/A"),
      escapeCSV(c.timeRange || "N/A"),
      escapeCSV((c.artistNames || []).join(", ")),
      escapeCSV((c.stageNames || []).join(", ")),
      escapeCSV((c.performanceIds || []).join(", ")),
      escapeCSV(c.explanation),
      escapeCSV(c.suggestedResolution)
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    triggerDownload(`festival-conflicts-report-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    FMS.App.showToast(`Exported ${conflicts.length} conflict(s) to CSV.`, "success");
    FMS.Storage.logActivity(`Exported Conflict Audit Report (${conflicts.length} items) to CSV.`, "info");
  }

  /**
   * 4. Native Browser Print Timetable
   */
  function printTimetable(date = "2026-08-15") {
    const printArea = document.getElementById("printable-timetable-area");
    if (!printArea) return;

    const perfs = FMS.Storage.getPerformances().filter(p => p.date === date && p.status !== "Cancelled");
    const artists = FMS.Storage.getArtists();
    const stages = FMS.Storage.getStages();

    const artistMap = new Map(artists.map(a => [a.id, a]));
    const stageMap = new Map(stages.map(s => [s.id, s]));

    // Group performances by stage
    const stageGroups = {};
    stages.forEach(st => {
      stageGroups[st.id] = [];
    });

    perfs.forEach(p => {
      if (stageGroups[p.stageId]) {
        stageGroups[p.stageId].push(p);
      }
    });

    // Sort each stage's perfs chronologically
    Object.keys(stageGroups).forEach(stId => {
      stageGroups[stId].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    let html = `
      <div class="print-header">
        <h1>${FMS.DATA.FESTIVAL_NAME}</h1>
        <h2>Official Stage Timetable & Daily Schedule &bull; Date: ${date}</h2>
        <p class="print-meta">Generated: ${new Date().toLocaleString()} &bull; Operational Master Schedule</p>
      </div>
      <div class="print-stages-grid">
    `;

    stages.forEach(stage => {
      const sets = stageGroups[stage.id] || [];
      html += `
        <div class="print-stage-column">
          <div class="print-stage-header">
            <h3>${stage.name}</h3>
            <span>${stage.location} &bull; Cap: ${Number(stage.capacity).toLocaleString()}</span>
          </div>
          <table class="print-stage-table">
            <thead>
              <tr>
                <th style="width: 25%;">Time</th>
                <th style="width: 45%;">Artist / Act</th>
                <th style="width: 30%;">Genre & Details</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (sets.length === 0) {
        html += `<tr><td colspan="3" class="text-center text-muted">No performances scheduled</td></tr>`;
      } else {
        sets.forEach(set => {
          const artist = artistMap.get(set.artistId) || { name: set.artistId, genre: "N/A" };
          html += `
            <tr>
              <td><strong>${set.startTime} - ${set.endTime}</strong></td>
              <td><strong>${escapeHtml(artist.name)}</strong></td>
              <td>${escapeHtml(artist.genre)}</td>
            </tr>
          `;
        });
      }

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
      </div>
      <div class="print-footer">
        <p>Aura Sound Festival &bull; Stage Management System &bull; Unauthorized alterations strictly prohibited.</p>
      </div>
    `;

    printArea.innerHTML = html;
    window.print();
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

  return {
    exportArtistsCSV,
    exportScheduleCSV,
    exportConflictsCSV,
    printTimetable
  };
})();

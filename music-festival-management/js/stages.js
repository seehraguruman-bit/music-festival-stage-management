/**
 * Music Festival Management System - Stage Management Module
 * Handles Stage CRUD, capacity, inventory, turnaround constraints, and technical audit.
 */

window.FMS = window.FMS || {};

FMS.Stages = (function () {
  let stagesList = [];
  let currentSearch = "";

  function init() {
    stagesList = FMS.Storage.getStages();
    bindEvents();
    render();
  }

  function getStages() {
    return stagesList;
  }

  function bindEvents() {
    const searchInput = document.getElementById("stage-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        currentSearch = e.target.value.trim().toLowerCase();
        render();
      });
    }

    const addBtn = document.getElementById("btn-add-stage");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openStageModal(null);
      });
    }

    const form = document.getElementById("stage-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  }

  function renderEquipmentCheckboxes(selectedIds = []) {
    const container = document.getElementById("stage-form-equipment-container");
    if (!container) return;

    const catalog = FMS.DATA.EQUIPMENT_CATALOG || [];
    const categories = {};
    catalog.forEach(item => {
      categories[item.category] = categories[item.category] || [];
      categories[item.category].push(item);
    });

    let html = "";
    Object.keys(categories).forEach(cat => {
      html += `<div class="equipment-category-group">
        <div class="equipment-cat-title">${cat}</div>
        <div class="equipment-grid">`;
      categories[cat].forEach(item => {
        const isChecked = selectedIds.includes(item.id) ? "checked" : "";
        html += `
          <label class="checkbox-pill">
            <input type="checkbox" name="stageEquipment" value="${item.id}" ${isChecked}>
            <span>${item.name}</span>
          </label>`;
      });
      html += `</div></div>`;
    });

    container.innerHTML = html;
  }

  function render() {
    const grid = document.getElementById("stages-grid");
    const emptyState = document.getElementById("stages-empty-state");
    const countBadge = document.getElementById("stages-count-badge");
    if (!grid) return;

    const filtered = stagesList.filter(s => {
      return !currentSearch ||
        s.name.toLowerCase().includes(currentSearch) ||
        s.location.toLowerCase().includes(currentSearch) ||
        s.id.toLowerCase().includes(currentSearch);
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${stagesList.length} Stages`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    const performances = FMS.Storage.getPerformances();
    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));

    grid.innerHTML = filtered.map(stage => {
      const stagePerfs = performances.filter(p => p.stageId === stage.id && p.status !== "Cancelled");
      const equipPills = (stage.equipment || []).slice(0, 4).map(eqId => {
        return `<span class="badge badge-subtle">${catalogMap.get(eqId) || eqId}</span>`;
      }).join("");
      const moreCount = (stage.equipment || []).length > 4 ? `<span class="badge badge-subtle">+${(stage.equipment || []).length - 4} more</span>` : "";

      const statusBadgeClass = stage.status === "Active" ? "badge-success" : "badge-warning";

      return `
        <div class="card stage-card" data-stage-id="${stage.id}">
          <div class="card-header">
            <div>
              <span class="badge badge-id">${stage.id}</span>
              <span class="badge ${statusBadgeClass}">${stage.status || "Active"}</span>
            </div>
            <div class="card-actions">
              <button class="btn-icon" title="View Details" onclick="FMS.Stages.viewDetails('${stage.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon" title="Edit Stage" onclick="FMS.Stages.editStage('${stage.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete Stage" onclick="FMS.Stages.deleteStage('${stage.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="card-body">
            <h3 class="stage-card-name">${escapeHtml(stage.name)}</h3>
            <p class="stage-card-loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${escapeHtml(stage.location || "Festival Grounds")}
            </p>

            <div class="stage-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Capacity</span>
                <span class="meta-val font-semibold">${Number(stage.capacity || 0).toLocaleString()} Pax</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Turnaround Buffer</span>
                <span class="meta-val">${stage.turnaroundMinutes || 20} min</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Dimensions</span>
                <span class="meta-val truncate">${escapeHtml(stage.dimensions || "Standard")}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Scheduled Sets</span>
                <span class="meta-val highlight">${stagePerfs.length} Performance${stagePerfs.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div class="card-rider-preview">
              <div class="meta-label">Available Stage Gear (${(stage.equipment || []).length} items)</div>
              <div class="pills-row">
                ${equipPills || '<span class="text-muted">No gear listed</span>'}
                ${moreCount}
              </div>
            </div>
          </div>
        </div>
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

  function openStageModal(stage = null) {
    const modal = document.getElementById("stage-modal");
    const modalTitle = document.getElementById("stage-modal-title");
    const form = document.getElementById("stage-form");
    if (!modal || !form) return;

    form.reset();

    const isEdit = !!stage;
    modalTitle.textContent = isEdit ? `Edit Stage: ${stage.name}` : "Create New Festival Stage";

    document.getElementById("stage-form-mode").value = isEdit ? "edit" : "add";
    document.getElementById("stage-form-id").value = isEdit ? stage.id : generateStageId();
    document.getElementById("stage-form-id").readOnly = isEdit;

    if (isEdit) {
      document.getElementById("stage-form-name").value = stage.name || "";
      document.getElementById("stage-form-location").value = stage.location || "";
      document.getElementById("stage-form-capacity").value = stage.capacity || 5000;
      document.getElementById("stage-form-turnaround").value = stage.turnaroundMinutes || 20;
      document.getElementById("stage-form-status").value = stage.status || "Active";
      document.getElementById("stage-form-dimensions").value = stage.dimensions || "";
      document.getElementById("stage-form-constraints").value = stage.setupConstraints || "";
      document.getElementById("stage-form-capabilities").value = Array.isArray(stage.capabilities) ? stage.capabilities.join("\n") : (stage.capabilities || "");
      renderEquipmentCheckboxes(stage.equipment || []);
    } else {
      renderEquipmentCheckboxes([]);
    }

    modal.classList.add("open");
  }

  function generateStageId() {
    let nextNum = 1;
    const existingNums = stagesList.map(s => {
      const match = s.id.match(/^STG-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    }
    return `STG-${String(nextNum).padStart(3, "0")}`;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById("stage-form-mode").value;
    const id = document.getElementById("stage-form-id").value.trim().toUpperCase();
    const name = document.getElementById("stage-form-name").value.trim();
    const location = document.getElementById("stage-form-location").value.trim();
    const capacity = parseInt(document.getElementById("stage-form-capacity").value, 10) || 1000;
    const turnaroundMinutes = parseInt(document.getElementById("stage-form-turnaround").value, 10) || 20;
    const status = document.getElementById("stage-form-status").value;
    const dimensions = document.getElementById("stage-form-dimensions").value.trim();
    const setupConstraints = document.getElementById("stage-form-constraints").value.trim();
    const rawCaps = document.getElementById("stage-form-capabilities").value.trim();
    const capabilities = rawCaps ? rawCaps.split("\n").map(s => s.trim()).filter(Boolean) : [];

    const checkboxes = document.querySelectorAll('#stage-form-equipment-container input[name="stageEquipment"]:checked');
    const equipment = Array.from(checkboxes).map(cb => cb.value);

    if (!id || !name) {
      alert("Stage ID and Stage Name are required fields.");
      return;
    }

    if (mode === "add") {
      if (stagesList.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        alert(`Duplicate Stage ID "${id}". Please choose a unique stage ID.`);
        return;
      }
    }

    const stageData = {
      id,
      name,
      location,
      capacity,
      turnaroundMinutes,
      status,
      dimensions,
      setupConstraints,
      capabilities,
      equipment
    };

    if (mode === "add") {
      stagesList.push(stageData);
      FMS.Storage.logActivity(`Created new stage "${name}" (${id}, cap: ${capacity.toLocaleString()}).`, "success");
      FMS.App.showToast(`Stage "${name}" created successfully.`, "success");
    } else {
      const idx = stagesList.findIndex(s => s.id === id);
      if (idx !== -1) {
        stagesList[idx] = stageData;
        FMS.Storage.logActivity(`Updated stage specifications for "${name}" (${id}).`, "info");
        FMS.App.showToast(`Stage "${name}" updated.`, "success");
      }
    }

    FMS.Storage.saveStages(stagesList);
    closeStageModal();
    render();
    FMS.App.refreshAll();
  }

  function closeStageModal() {
    const modal = document.getElementById("stage-modal");
    if (modal) modal.classList.remove("open");
  }

  function editStage(id) {
    const stage = stagesList.find(s => s.id === id);
    if (stage) openStageModal(stage);
  }

  function viewDetails(id) {
    const stage = stagesList.find(s => s.id === id);
    if (!stage) return;

    const modal = document.getElementById("stage-detail-modal");
    const container = document.getElementById("stage-detail-content");
    if (!modal || !container) return;

    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));
    const performances = FMS.Storage.getPerformances().filter(p => p.stageId === stage.id && p.status !== "Cancelled");
    const artists = FMS.Storage.getArtists();
    const artistMap = new Map(artists.map(a => [a.id, a.name]));

    const equipItems = (stage.equipment || []).length > 0
      ? stage.equipment.map(eq => `<span class="badge badge-accent">${catalogMap.get(eq) || eq}</span>`).join(" ")
      : '<span class="text-muted">No equipment configured.</span>';

    const capabilitiesList = Array.isArray(stage.capabilities) && stage.capabilities.length > 0
      ? `<ul class="capabilities-bullet-list">${stage.capabilities.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
      : '<p class="text-muted">Standard outdoor/indoor stage production.</p>';

    const perfRows = performances.length > 0
      ? performances.map(p => `
          <div class="perf-compact-item">
            <span class="perf-badge-date">${p.date}</span>
            <span class="perf-badge-time">${p.startTime} - ${p.endTime}</span>
            <span class="perf-badge-artist font-semibold">${artistMap.get(p.artistId) || p.artistId}</span>
            <span class="badge badge-status">${p.status}</span>
          </div>
        `).join("")
      : '<p class="text-muted">No festival performances currently scheduled on this stage.</p>';

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <h2>${escapeHtml(stage.name)}</h2>
          <div class="pills-row">
            <span class="badge badge-id">${stage.id}</span>
            <span class="badge badge-success">${stage.status}</span>
            <span class="badge badge-subtle">Capacity: ${Number(stage.capacity).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="detail-grid-two">
        <div class="detail-section">
          <h4>Venue & Specifications</h4>
          <p><strong>Location:</strong> ${escapeHtml(stage.location)}</p>
          <p><strong>Dimensions:</strong> ${escapeHtml(stage.dimensions || "Not specified")}</p>
          <p><strong>Min Turnaround Buffer:</strong> ${stage.turnaroundMinutes || 20} minutes</p>
        </div>
        <div class="detail-section">
          <h4>Setup Constraints & Policies</h4>
          <p>${escapeHtml(stage.setupConstraints || "Standard changeover protocols apply.")}</p>
        </div>
      </div>

      <div class="detail-section">
        <h4>Technical Capabilities & Rigging</h4>
        ${capabilitiesList}
      </div>

      <div class="detail-section">
        <h4>Available Gear & Equipment (${(stage.equipment || []).length})</h4>
        <div class="pills-row">${equipItems}</div>
      </div>

      <div class="detail-section">
        <h4>Scheduled Performances on this Stage (${performances.length})</h4>
        <div class="perf-compact-list">${perfRows}</div>
      </div>
    `;

    modal.classList.add("open");
  }

  function deleteStage(id) {
    const stage = stagesList.find(s => s.id === id);
    if (!stage) return;

    const perfs = FMS.Storage.getPerformances().filter(p => p.stageId === id && p.status !== "Cancelled");
    let warning = `Are you sure you want to delete stage "${stage.name}" (${stage.id})?`;
    if (perfs.length > 0) {
      warning += `\n\nWARNING: There are ${perfs.length} scheduled performance(s) on this stage! Deleting the stage will remove or affect those scheduled sets.`;
    }

    if (confirm(warning)) {
      stagesList = stagesList.filter(s => s.id !== id);
      FMS.Storage.saveStages(stagesList);

      if (perfs.length > 0) {
        let allPerfs = FMS.Storage.getPerformances().filter(p => p.stageId !== id);
        FMS.Storage.savePerformances(allPerfs);
      }

      FMS.Storage.logActivity(`Deleted stage "${stage.name}" (${id}).`, "warning");
      FMS.App.showToast(`Stage "${stage.name}" deleted.`, "info");
      render();
      FMS.App.refreshAll();
    }
  }

  return {
    init,
    getStages,
    openStageModal,
    closeStageModal,
    editStage,
    viewDetails,
    deleteStage,
    render
  };
})();

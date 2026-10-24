/**
 * Music Festival Management System - Artist Management Module
 * Handles Artist CRUD, technical rider requirements, search, filtering, and detail modal.
 */

window.FMS = window.FMS || {};

FMS.Artists = (function () {
  let artistsList = [];
  let currentSearch = "";
  let currentGenreFilter = "all";

  function init() {
    artistsList = FMS.Storage.getArtists();
    bindEvents();
    render();
  }

  function getArtists() {
    return artistsList;
  }

  function bindEvents() {
    const searchInput = document.getElementById("artist-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        currentSearch = e.target.value.trim().toLowerCase();
        render();
      });
    }

    const genreFilter = document.getElementById("artist-genre-filter");
    if (genreFilter) {
      genreFilter.addEventListener("change", function (e) {
        currentGenreFilter = e.target.value;
        render();
      });
    }

    const addBtn = document.getElementById("btn-add-artist");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openArtistModal(null);
      });
    }

    const form = document.getElementById("artist-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  }

  function populateGenreOptions() {
    const filter = document.getElementById("artist-genre-filter");
    const formSelect = document.getElementById("artist-form-genre");
    if (!filter && !formSelect) return;

    const genres = FMS.DATA.GENRES || [];
    if (filter) {
      filter.innerHTML = `<option value="all">All Genres (${artistsList.length})</option>` +
        genres.map(g => `<option value="${g}">${g}</option>`).join("");
      filter.value = currentGenreFilter;
    }

    if (formSelect) {
      formSelect.innerHTML = genres.map(g => `<option value="${g}">${g}</option>`).join("");
    }
  }

  function renderEquipmentCheckboxes(selectedIds = []) {
    const container = document.getElementById("artist-form-equipment-container");
    if (!container) return;

    const catalog = FMS.DATA.EQUIPMENT_CATALOG || [];
    // Group by category
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
            <input type="checkbox" name="requiredEquipment" value="${item.id}" ${isChecked}>
            <span>${item.name}</span>
          </label>`;
      });
      html += `</div></div>`;
    });

    container.innerHTML = html;
  }

  function render() {
    const grid = document.getElementById("artists-grid");
    const emptyState = document.getElementById("artists-empty-state");
    const countBadge = document.getElementById("artists-count-badge");
    if (!grid) return;

    populateGenreOptions();

    // Filter
    const filtered = artistsList.filter(a => {
      const matchesSearch = !currentSearch ||
        a.name.toLowerCase().includes(currentSearch) ||
        a.id.toLowerCase().includes(currentSearch) ||
        (a.contactPerson && a.contactPerson.toLowerCase().includes(currentSearch));
      const matchesGenre = currentGenreFilter === "all" || a.genre === currentGenreFilter;
      return matchesSearch && matchesGenre;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${artistsList.length} Artists`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    const performances = FMS.Storage.getPerformances();
    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));

    grid.innerHTML = filtered.map(artist => {
      const bookedCount = performances.filter(p => p.artistId === artist.id && p.status !== "Cancelled").length;
      const equipPills = (artist.requiredEquipment || []).slice(0, 3).map(eqId => {
        return `<span class="badge badge-subtle">${catalogMap.get(eqId) || eqId}</span>`;
      }).join("");
      const moreCount = (artist.requiredEquipment || []).length > 3 ? `<span class="badge badge-subtle">+${(artist.requiredEquipment || []).length - 3}</span>` : "";

      return `
        <div class="card artist-card" data-artist-id="${artist.id}">
          <div class="card-header">
            <div>
              <span class="badge badge-id">${artist.id}</span>
              <span class="badge badge-genre">${artist.genre}</span>
            </div>
            <div class="card-actions">
              <button class="btn-icon" title="View Details" onclick="FMS.Artists.viewDetails('${artist.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-icon" title="Edit Artist" onclick="FMS.Artists.editArtist('${artist.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete Artist" onclick="FMS.Artists.deleteArtist('${artist.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="card-body">
            <h3 class="artist-card-name">${escapeHtml(artist.name)}</h3>
            <p class="artist-card-bio">${escapeHtml(artist.bio || "No biography provided.")}</p>
            
            <div class="artist-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Performers</span>
                <span class="meta-val">${artist.performersCount || 1} Person${artist.performersCount > 1 ? "s" : ""}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Set / Soundcheck</span>
                <span class="meta-val">${artist.performanceDuration}m / ${artist.soundcheckDuration}m</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Contact</span>
                <span class="meta-val truncate">${escapeHtml(artist.contactPerson || "N/A")}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Booked Sets</span>
                <span class="meta-val highlight">${bookedCount} Performance${bookedCount === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div class="card-rider-preview">
              <div class="meta-label">Required Backline & Production</div>
              <div class="pills-row">
                ${equipPills || '<span class="text-muted">Standard rider</span>'}
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

  function openArtistModal(artist = null) {
    const modal = document.getElementById("artist-modal");
    const modalTitle = document.getElementById("artist-modal-title");
    const form = document.getElementById("artist-form");
    if (!modal || !form) return;

    form.reset();

    const isEdit = !!artist;
    modalTitle.textContent = isEdit ? `Edit Artist: ${artist.name}` : "Add New Festival Artist";

    document.getElementById("artist-form-mode").value = isEdit ? "edit" : "add";
    document.getElementById("artist-form-id").value = isEdit ? artist.id : generateArtistId();
    document.getElementById("artist-form-id").readOnly = isEdit;

    if (isEdit) {
      document.getElementById("artist-form-name").value = artist.name || "";
      document.getElementById("artist-form-genre").value = artist.genre || FMS.DATA.GENRES[0];
      document.getElementById("artist-form-contact").value = artist.contactPerson || "";
      document.getElementById("artist-form-email").value = artist.email || "";
      document.getElementById("artist-form-phone").value = artist.phone || "";
      document.getElementById("artist-form-performers").value = artist.performersCount || 1;
      document.getElementById("artist-form-set-duration").value = artist.performanceDuration || 60;
      document.getElementById("artist-form-sc-duration").value = artist.soundcheckDuration || 30;
      document.getElementById("artist-form-bio").value = artist.bio || "";
      document.getElementById("artist-form-technical").value = artist.technicalNotes || "";
      document.getElementById("artist-form-notes").value = artist.notes || "";
      renderEquipmentCheckboxes(artist.requiredEquipment || []);
    } else {
      renderEquipmentCheckboxes([]);
    }

    modal.classList.add("open");
  }

  function generateArtistId() {
    let nextNum = 1;
    const existingNums = artistsList.map(a => {
      const match = a.id.match(/^ART-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    }
    return `ART-${String(nextNum).padStart(3, "0")}`;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById("artist-form-mode").value;
    const id = document.getElementById("artist-form-id").value.trim().toUpperCase();
    const name = document.getElementById("artist-form-name").value.trim();
    const genre = document.getElementById("artist-form-genre").value;
    const contactPerson = document.getElementById("artist-form-contact").value.trim();
    const email = document.getElementById("artist-form-email").value.trim();
    const phone = document.getElementById("artist-form-phone").value.trim();
    const performersCount = parseInt(document.getElementById("artist-form-performers").value, 10) || 1;
    const performanceDuration = parseInt(document.getElementById("artist-form-set-duration").value, 10) || 60;
    const soundcheckDuration = parseInt(document.getElementById("artist-form-sc-duration").value, 10) || 30;
    const bio = document.getElementById("artist-form-bio").value.trim();
    const technicalNotes = document.getElementById("artist-form-technical").value.trim();
    const notes = document.getElementById("artist-form-notes").value.trim();

    // Collect checked equipment
    const checkboxes = document.querySelectorAll('#artist-form-equipment-container input[name="requiredEquipment"]:checked');
    const requiredEquipment = Array.from(checkboxes).map(cb => cb.value);

    // Validation
    if (!id || !name) {
      alert("Artist ID and Artist/Band Name are required fields.");
      return;
    }

    if (mode === "add") {
      if (artistsList.some(a => a.id.toLowerCase() === id.toLowerCase())) {
        alert(`Duplicate Artist ID "${id}". Please provide a unique artist ID.`);
        return;
      }
    }

    const artistData = {
      id,
      name,
      genre,
      contactPerson,
      email,
      phone,
      performersCount,
      performanceDuration,
      soundcheckDuration,
      bio,
      requiredEquipment,
      technicalNotes,
      notes
    };

    if (mode === "add") {
      artistsList.push(artistData);
      FMS.Storage.logActivity(`Added new artist "${name}" (${id}, ${genre}).`, "success");
      FMS.App.showToast(`Artist "${name}" added successfully.`, "success");
    } else {
      const idx = artistsList.findIndex(a => a.id === id);
      if (idx !== -1) {
        artistsList[idx] = artistData;
        FMS.Storage.logActivity(`Updated artist details for "${name}" (${id}).`, "info");
        FMS.App.showToast(`Artist "${name}" updated.`, "success");
      }
    }

    FMS.Storage.saveArtists(artistsList);
    closeArtistModal();
    render();
    FMS.App.refreshAll();
  }

  function closeArtistModal() {
    const modal = document.getElementById("artist-modal");
    if (modal) modal.classList.remove("open");
  }

  function editArtist(id) {
    const artist = artistsList.find(a => a.id === id);
    if (artist) openArtistModal(artist);
  }

  function viewDetails(id) {
    const artist = artistsList.find(a => a.id === id);
    if (!artist) return;

    const modal = document.getElementById("artist-detail-modal");
    const container = document.getElementById("artist-detail-content");
    if (!modal || !container) return;

    const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));
    const performances = FMS.Storage.getPerformances().filter(p => p.artistId === artist.id && p.status !== "Cancelled");
    const stages = FMS.Storage.getStages();
    const stageMap = new Map(stages.map(s => [s.id, s.name]));

    const equipItems = (artist.requiredEquipment || []).length > 0
      ? artist.requiredEquipment.map(eq => `<span class="badge badge-accent">${catalogMap.get(eq) || eq}</span>`).join(" ")
      : '<span class="text-muted">No specific backline requirements requested.</span>';

    const perfRows = performances.length > 0
      ? performances.map(p => `
          <div class="perf-compact-item">
            <span class="perf-badge-date">${p.date}</span>
            <span class="perf-badge-time">${p.startTime} - ${p.endTime}</span>
            <span class="perf-badge-stage">${stageMap.get(p.stageId) || p.stageId}</span>
            <span class="badge badge-status">${p.status}</span>
          </div>
        `).join("")
      : '<p class="text-muted">No festival performances currently scheduled for this artist.</p>';

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <h2>${escapeHtml(artist.name)}</h2>
          <div class="pills-row">
            <span class="badge badge-id">${artist.id}</span>
            <span class="badge badge-genre">${artist.genre}</span>
            <span class="badge badge-subtle">${artist.performersCount || 1} Performer(s)</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Biography</h4>
        <p>${escapeHtml(artist.bio || "No biography provided.")}</p>
      </div>

      <div class="detail-grid-two">
        <div class="detail-section">
          <h4>Contact Information</h4>
          <p><strong>Contact:</strong> ${escapeHtml(artist.contactPerson || "N/A")}</p>
          <p><strong>Email:</strong> ${escapeHtml(artist.email || "N/A")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(artist.phone || "N/A")}</p>
        </div>
        <div class="detail-section">
          <h4>Show Timings</h4>
          <p><strong>Performance Duration:</strong> ${artist.performanceDuration} minutes</p>
          <p><strong>Soundcheck Duration:</strong> ${artist.soundcheckDuration} minutes</p>
          <p><strong>Additional Notes:</strong> ${escapeHtml(artist.notes || "None")}</p>
        </div>
      </div>

      <div class="detail-section">
        <h4>Technical Rider & Required Equipment</h4>
        <div class="pills-row">${equipItems}</div>
        <div class="technical-callout">
          <strong>Technical Rider Specifications:</strong>
          <p>${escapeHtml(artist.technicalNotes || "Standard stage plot applies.")}</p>
        </div>
      </div>

      <div class="detail-section">
        <h4>Festival Bookings (${performances.length})</h4>
        <div class="perf-compact-list">${perfRows}</div>
      </div>
    `;

    modal.classList.add("open");
  }

  function deleteArtist(id) {
    const artist = artistsList.find(a => a.id === id);
    if (!artist) return;

    const perfs = FMS.Storage.getPerformances().filter(p => p.artistId === id && p.status !== "Cancelled");
    let warning = `Are you sure you want to delete artist "${artist.name}" (${artist.id})?`;
    if (perfs.length > 0) {
      warning += `\n\nWARNING: This artist has ${perfs.length} scheduled performance(s). Deleting the artist will remove or affect those scheduled sets.`;
    }

    if (confirm(warning)) {
      artistsList = artistsList.filter(a => a.id !== id);
      FMS.Storage.saveArtists(artistsList);

      // If artist had performances, remove or cancel them
      if (perfs.length > 0) {
        let allPerfs = FMS.Storage.getPerformances().filter(p => p.artistId !== id);
        FMS.Storage.savePerformances(allPerfs);
      }

      FMS.Storage.logActivity(`Deleted artist "${artist.name}" (${id}).`, "warning");
      FMS.App.showToast(`Artist "${artist.name}" deleted.`, "info");
      render();
      FMS.App.refreshAll();
    }
  }

  return {
    init,
    getArtists,
    openArtistModal,
    closeArtistModal,
    editArtist,
    viewDetails,
    deleteArtist,
    render
  };
})();

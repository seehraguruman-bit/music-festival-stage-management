/**
 * Music Festival Management System - Storage Manager
 * Handles local persistence via browser localStorage with data validation,
 * error handling, audit activity logging, and demo data restoration.
 */

window.FMS = window.FMS || {};

FMS.Storage = (function () {
  const KEYS = {
    ARTISTS: "fms_artists_data",
    STAGES: "fms_stages_data",
    PERFORMANCES: "fms_performances_data",
    SETTINGS: "fms_settings_data",
    ACTIVITY: "fms_activity_log_data"
  };

  /**
   * Safe JSON parse with fallback
   */
  function safeParse(jsonString, fallback) {
    if (!jsonString) return fallback;
    try {
      const parsed = JSON.parse(jsonString);
      return parsed !== null ? parsed : fallback;
    } catch (e) {
      console.warn("FMS Storage: Failed to parse JSON, falling back to default.", e);
      return fallback;
    }
  }

  /**
   * Safe localStorage setItem with quota check
   */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`FMS Storage: Error writing key "${key}" to localStorage:`, e);
      if (e.name === "QuotaExceededError" || e.code === 22) {
        alert("Warning: Browser storage quota exceeded! Changes cannot be saved locally.");
      }
      return false;
    }
  }

  /**
   * Initializes storage. If empty, populates seed demo data.
   */
  function init() {
    try {
      const existingArtists = localStorage.getItem(KEYS.ARTISTS);
      const existingStages = localStorage.getItem(KEYS.STAGES);
      const existingPerformances = localStorage.getItem(KEYS.PERFORMANCES);

      if (!existingArtists || !existingStages || !existingPerformances) {
        console.log("FMS Storage: First launch detected or missing collections. Seeding sample festival data...");
        resetToDemoData(false);
      }
    } catch (err) {
      console.error("FMS Storage: LocalStorage access failed or blocked.", err);
    }
  }

  /**
   * Reset all data to default demo state
   */
  function resetToDemoData(logAction = true) {
    const defaultArtists = JSON.parse(JSON.stringify(FMS.DATA.DEFAULT_ARTISTS));
    const defaultStages = JSON.parse(JSON.stringify(FMS.DATA.DEFAULT_STAGES));
    const defaultPerformances = JSON.parse(JSON.stringify(FMS.DATA.DEFAULT_PERFORMANCES));

    safeSet(KEYS.ARTISTS, defaultArtists);
    safeSet(KEYS.STAGES, defaultStages);
    safeSet(KEYS.PERFORMANCES, defaultPerformances);

    const initialLogs = [
      {
        id: "ACT-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "system",
        message: "Festival management system initialized with demo dataset (12 artists, 4 stages, 14 performances)."
      }
    ];
    safeSet(KEYS.ACTIVITY, initialLogs);

    if (logAction) {
      logActivity("Demo data restored to initial festival schedule.");
    }
  }

  // --- Collection Getters & Setters ---

  function getArtists() {
    const data = safeParse(localStorage.getItem(KEYS.ARTISTS), []);
    return Array.isArray(data) ? data : [];
  }

  function saveArtists(artists) {
    safeSet(KEYS.ARTISTS, artists);
  }

  function getStages() {
    const data = safeParse(localStorage.getItem(KEYS.STAGES), []);
    return Array.isArray(data) ? data : [];
  }

  function saveStages(stages) {
    safeSet(KEYS.STAGES, stages);
  }

  function getPerformances() {
    const data = safeParse(localStorage.getItem(KEYS.PERFORMANCES), []);
    return Array.isArray(data) ? data : [];
  }

  function savePerformances(performances) {
    safeSet(KEYS.PERFORMANCES, performances);
  }

  function getActivityLogs() {
    const logs = safeParse(localStorage.getItem(KEYS.ACTIVITY), []);
    return Array.isArray(logs) ? logs : [];
  }

  function logActivity(message, type = "info") {
    const logs = getActivityLogs();
    logs.unshift({
      id: "ACT-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      type: type,
      message: message
    });
    // Keep last 40 logs
    if (logs.length > 40) logs.pop();
    safeSet(KEYS.ACTIVITY, logs);
  }

  // Public API
  return {
    init,
    resetToDemoData,
    getArtists,
    saveArtists,
    getStages,
    saveStages,
    getPerformances,
    savePerformances,
    getActivityLogs,
    logActivity
  };
})();

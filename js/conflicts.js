/**
 * Music Festival Management System - Conflict Detection Engine
 * 
 * Performs high-precision mathematical interval analysis on festival schedules.
 * Detects 6 distinct conflict types:
 * 1. Stage Overlap (Direct performance time collision)
 * 2. Artist Double-Booking (Artist booked simultaneously across any stages)
 * 3. Setup / Teardown Collision (Stage occupied during changeover)
 * 4. Insufficient Turnaround Time (Stage minimum buffer policy violated)
 * 5. Soundcheck Overlap (Soundcheck conflicts on stage or artist)
 * 6. Technical Incompatibility (Artist rider requirements vs stage gear)
 */

window.FMS = window.FMS || {};

FMS.Conflicts = (function () {
  /**
   * Helper: Parses "YYYY-MM-DD" and "HH:MM" into numeric millisecond epoch timestamp.
   * Gracefully handles late-night/overnight festival performances crossing midnight.
   */
  function parseToTimestamp(dateStr, timeStr, baseDateTimestamp = null) {
    if (!dateStr || !timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(hours, minutes, 0, 0);
    let ts = d.getTime();

    // If a base start time is provided and this time is numerically earlier, it crossed midnight (e.g. 23:30 to 01:00)
    if (baseDateTimestamp && ts < baseDateTimestamp) {
      ts += 24 * 60 * 60 * 1000;
    }
    return ts;
  }

  /**
   * Evaluates interval overlap: [A.start, A.end] and [B.start, B.end]
   * Overlaps strictly when A.start < B.end AND B.start < A.end
   */
  function intervalsOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
  }

  /**
   * Calculates difference in minutes between two timestamps
   */
  function diffMinutes(startTs, endTs) {
    return Math.round((endTs - startTs) / (60 * 1000));
  }

  /**
   * Formats a timestamp into HH:MM (24h)
   */
  function formatTime(timestamp) {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  /**
   * Enrich performance with exact timestamp intervals
   */
  function getEnrichedPerformance(p) {
    const perfStart = parseToTimestamp(p.date, p.startTime);
    const perfEnd = parseToTimestamp(p.date, p.endTime, perfStart);

    const setupMins = Number(p.setupDuration) || 0;
    const teardownMins = Number(p.teardownDuration) || 0;

    const occupancyStart = perfStart - setupMins * 60 * 1000;
    const occupancyEnd = perfEnd + teardownMins * 60 * 1000;

    let scStart = 0;
    let scEnd = 0;
    if (p.soundcheckStartTime && p.soundcheckEndTime) {
      scStart = parseToTimestamp(p.date, p.soundcheckStartTime);
      scEnd = parseToTimestamp(p.date, p.soundcheckEndTime, scStart);
    }

    return {
      raw: p,
      id: p.id,
      date: p.date,
      stageId: p.stageId,
      artistId: p.artistId,
      perfStart,
      perfEnd,
      setupMins,
      teardownMins,
      occupancyStart,
      occupancyEnd,
      scStart,
      scEnd
    };
  }

  /**
   * Main audit calculation routine.
   * Runs whenever schedule, artists, or stages update.
   */
  function detectAllConflicts(performances, artists, stages) {
    const conflicts = [];
    const artistMap = new Map(artists.map(a => [a.id, a]));
    const stageMap = new Map(stages.map(s => [s.id, s]));

    // Filter out any cancelled performances if applicable
    const activePerfs = performances.filter(p => p.status !== "Cancelled");
    const enriched = activePerfs.map(getEnrichedPerformance);

    // 1. Technical Incompatibility Checks (per individual performance)
    enriched.forEach(item => {
      const artist = artistMap.get(item.artistId);
      const stage = stageMap.get(item.stageId);

      if (artist && stage) {
        const required = artist.requiredEquipment || [];
        const available = stage.equipment || [];
        const missing = required.filter(eqId => !available.includes(eqId));

        if (missing.length > 0) {
          const catalogMap = new Map((FMS.DATA.EQUIPMENT_CATALOG || []).map(c => [c.id, c.name]));
          const missingNames = missing.map(id => catalogMap.get(id) || id);

          // Find alternate capable stages
          const alternateStages = stages
            .filter(st => st.id !== stage.id && required.every(eq => (st.equipment || []).includes(eq)))
            .map(st => st.name);

          let resolution = "Add the missing gear to this stage's rider inventory.";
          if (alternateStages.length > 0) {
            resolution = `Move ${artist.name} to ${alternateStages.join(" or ")} which has all required equipment.`;
          }

          conflicts.push({
            id: `CONF-TECH-${item.id}`,
            type: "Technical Incompatibility",
            severity: "warning",
            category: "technical",
            performanceIds: [item.id],
            artistIds: [artist.id],
            stageIds: [stage.id],
            artistNames: [artist.name],
            stageNames: [stage.name],
            date: item.date,
            timeRange: `${item.raw.startTime} - ${item.raw.endTime}`,
            explanation: `Stage "${stage.name}" lacks required equipment for ${artist.name}: ${missingNames.join(", ")}.`,
            suggestedResolution: resolution
          });
        }
      }
    });

    // 2. Pairwise checks between performances
    const n = enriched.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = enriched[i];
        const b = enriched[j];

        const artistA = artistMap.get(a.artistId) || { name: a.artistId };
        const artistB = artistMap.get(b.artistId) || { name: b.artistId };
        const stageA = stageMap.get(a.stageId) || { name: a.stageId };
        const stageB = stageMap.get(b.stageId) || { name: b.stageId };

        // --- A. ARTIST DOUBLE-BOOKING ---
        // Same artist booked for overlapping performances anywhere
        if (a.artistId === b.artistId && a.date === b.date) {
          if (intervalsOverlap(a.perfStart, a.perfEnd, b.perfStart, b.perfEnd)) {
            const overlapMins = diffMinutes(
              Math.max(a.perfStart, b.perfStart),
              Math.min(a.perfEnd, b.perfEnd)
            );
            conflicts.push({
              id: `CONF-ARTIST-${a.id}-${b.id}`,
              type: "Artist Double-Booking",
              severity: "critical",
              category: "artist",
              performanceIds: [a.id, b.id],
              artistIds: [a.artistId],
              stageIds: [a.stageId, b.stageId],
              artistNames: [artistA.name],
              stageNames: Array.from(new Set([stageA.name, stageB.name])),
              date: a.date,
              timeRange: `${formatTime(Math.max(a.perfStart, b.perfStart))} - ${formatTime(Math.min(a.perfEnd, b.perfEnd))}`,
              explanation: `${artistA.name} is booked simultaneously on ${stageA.name} (${a.raw.startTime}-${a.raw.endTime}) and ${stageB.name} (${b.raw.startTime}-${b.raw.endTime}) with a ${overlapMins}-minute collision.`,
              suggestedResolution: `Reassign one slot or shift ${artistA.name}'s performance on ${stageB.name} to after ${formatTime(a.perfEnd)}.`
            });
          }
        }

        // --- B. SAME STAGE CHECKS (Same Date & Stage) ---
        if (a.stageId === b.stageId && a.date === b.date) {
          // 1. Direct Stage Overlap (Showtime collision)
          if (intervalsOverlap(a.perfStart, a.perfEnd, b.perfStart, b.perfEnd)) {
            const overlapMins = diffMinutes(
              Math.max(a.perfStart, b.perfStart),
              Math.min(a.perfEnd, b.perfEnd)
            );
            conflicts.push({
              id: `CONF-STAGE-${a.id}-${b.id}`,
              type: "Stage Overlap",
              severity: "critical",
              category: "stage",
              performanceIds: [a.id, b.id],
              artistIds: [a.artistId, b.artistId],
              stageIds: [a.stageId],
              artistNames: [artistA.name, artistB.name],
              stageNames: [stageA.name],
              date: a.date,
              timeRange: `${formatTime(Math.max(a.perfStart, b.perfStart))} - ${formatTime(Math.min(a.perfEnd, b.perfEnd))}`,
              explanation: `Two performances overlap on ${stageA.name}: ${artistA.name} (${a.raw.startTime}-${a.raw.endTime}) and ${artistB.name} (${b.raw.startTime}-${b.raw.endTime}) overlap by ${overlapMins} minutes.`,
              suggestedResolution: `Adjust start time of ${artistB.name} to start after ${formatTime(a.perfEnd + (b.setupMins * 60 * 1000))}.`
            });
            continue; // Move on; direct overlap already dominates changeover conflicts
          }

          // 2. Setup & Teardown Conflict
          // Order them chronologically: first is earlier, second is later
          const [first, second] = a.perfStart <= b.perfStart ? [a, b] : [b, a];
          const firstArtist = first === a ? artistA : artistB;
          const secondArtist = first === a ? artistB : artistA;

          // First performance teardown finishes at: first.perfEnd + teardown
          const firstTeardownEnd = first.perfEnd + (first.teardownMins * 60 * 1000);
          // Second performance setup starts at: second.perfStart - setup
          const secondSetupStart = second.perfStart - (second.setupMins * 60 * 1000);

          if (firstTeardownEnd > secondSetupStart) {
            const collisionMins = diffMinutes(secondSetupStart, firstTeardownEnd);
            conflicts.push({
              id: `CONF-CHANGEOVER-${first.id}-${second.id}`,
              type: "Setup & Teardown Conflict",
              severity: "critical",
              category: "turnaround",
              performanceIds: [first.id, second.id],
              artistIds: [first.artistId, second.artistId],
              stageIds: [first.stageId],
              artistNames: [firstArtist.name, secondArtist.name],
              stageNames: [stageA.name],
              date: first.date,
              timeRange: `${formatTime(secondSetupStart)} - ${formatTime(firstTeardownEnd)}`,
              explanation: `Changeover collision on ${stageA.name}: ${firstArtist.name}'s ${first.teardownMins}m teardown ends at ${formatTime(firstTeardownEnd)}, but ${secondArtist.name}'s ${second.setupMins}m setup requires the stage starting at ${formatTime(secondSetupStart)} (${collisionMins}m collision).`,
              suggestedResolution: `Delay ${secondArtist.name}'s start time by at least ${collisionMins} minutes to ${formatTime(firstTeardownEnd + (second.setupMins * 60 * 1000))}.`
            });
          } else {
            // 3. Insufficient Turnaround Buffer (Policy violation)
            const gapBetweenOccupancy = diffMinutes(firstTeardownEnd, secondSetupStart);
            const stagePolicy = stageA.turnaroundMinutes || 20;

            if (gapBetweenOccupancy >= 0 && gapBetweenOccupancy < stagePolicy) {
              const shortfall = stagePolicy - gapBetweenOccupancy;
              conflicts.push({
                id: `CONF-BUFFER-${first.id}-${second.id}`,
                type: "Insufficient Turnaround Time",
                severity: "warning",
                category: "turnaround",
                performanceIds: [first.id, second.id],
                artistIds: [first.artistId, second.artistId],
                stageIds: [first.stageId],
                artistNames: [firstArtist.name, secondArtist.name],
                stageNames: [stageA.name],
                date: first.date,
                timeRange: `${formatTime(firstTeardownEnd)} - ${formatTime(secondSetupStart)}`,
                explanation: `${stageA.name} requires a minimum ${stagePolicy}-minute changeover buffer, but there is only a ${gapBetweenOccupancy}-minute gap between ${firstArtist.name} teardown and ${secondArtist.name} setup.`,
                suggestedResolution: `Increase the intermission between sets by ${shortfall} minutes.`
              });
            }
          }

          // 4. Soundcheck on same stage overlaps another performance or soundcheck
          if (a.scStart && a.scEnd && b.scStart && b.scEnd) {
            if (intervalsOverlap(a.scStart, a.scEnd, b.scStart, b.scEnd)) {
              conflicts.push({
                id: `CONF-SC-COLLISION-${a.id}-${b.id}`,
                type: "Soundcheck Conflict",
                severity: "warning",
                category: "soundcheck",
                performanceIds: [a.id, b.id],
                artistIds: [a.artistId, b.artistId],
                stageIds: [a.stageId],
                artistNames: [artistA.name, artistB.name],
                stageNames: [stageA.name],
                date: a.date,
                timeRange: `${a.raw.soundcheckStartTime} - ${a.raw.soundcheckEndTime}`,
                explanation: `Soundchecks for ${artistA.name} and ${artistB.name} overlap on ${stageA.name}.`,
                suggestedResolution: `Shift ${artistB.name}'s soundcheck window to a dedicated slot.`
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  return {
    detectAllConflicts,
    intervalsOverlap,
    parseToTimestamp,
    diffMinutes,
    formatTime
  };
})();

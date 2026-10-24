/**
 * Music Festival Management System - Default Data & Catalogs
 * Provides initial seed data, equipment catalogs, and festival constants.
 */

window.FMS = window.FMS || {};

FMS.DATA = {
  FESTIVAL_NAME: "Aura Sound & Arts Festival 2026",
  FESTIVAL_DATES: ["2026-08-15", "2026-08-16"],
  
  GENRES: [
    "Electronic / Dance",
    "Indie Rock",
    "Alternative / Post-Punk",
    "Hip-Hop / Rap",
    "Pop / R&B",
    "Metal / Hardcore",
    "Acoustic / Folk",
    "Ambient / Experimental",
    "Jazz / Neo-Soul"
  ],

  EQUIPMENT_CATALOG: [
    { id: "mic_wireless", name: "Wireless Vocal Microphones", category: "Audio" },
    { id: "mic_wired", name: "Wired Instrument Microphones", category: "Audio" },
    { id: "iem_system", name: "In-Ear Monitor (IEM) Transmitters", category: "Audio" },
    { id: "stage_monitors", name: "Stage Floor Monitor Wedges", category: "Audio" },
    { id: "di_boxes", name: "Multi-Channel Audio DI Boxes", category: "Audio" },
    { id: "drum_kit", name: "Pro Drum Kit (DW Collector's Series)", category: "Backline" },
    { id: "guitar_amps", name: "Tube Guitar & Bass Amplifiers", category: "Backline" },
    { id: "dj_cdj3000", name: "DJ Gear (4x Pioneer CDJ-3000 + DJM-A9)", category: "DJ Backline" },
    { id: "turntables", name: "Vinyl Turntables (Technics SL-1200)", category: "DJ Backline" },
    { id: "synth_stand", name: "Dual Tier Synthesizer Stand & MIDI Hub", category: "Backline" },
    { id: "led_wall", name: "High-Res P3 LED Video Wall", category: "Visuals" },
    { id: "moving_lights", name: "Automated Moving Lights Rig", category: "Lighting" },
    { id: "lasers", name: "30W Full-Color Stage Lasers", category: "Lighting" },
    { id: "pyro_cannons", name: "Pyrotechnics & CO2 Jet Cannons", category: "Special FX" },
    { id: "hazers", name: "Continuous Stage Hazers & Low Fog", category: "Special FX" },
    { id: "power_3phase", name: "3-Phase 63A Industrial Power", category: "Power" },
    { id: "grand_piano", name: "Concert Grand Acoustic Piano", category: "Backline" }
  ],

  // 12 Diverse Artists
  DEFAULT_ARTISTS: [
    {
      id: "ART-001",
      name: "The Neon Synthetics",
      genre: "Electronic / Dance",
      contactPerson: "Elena Vance (Manager)",
      email: "management@neonsynthetics.com",
      phone: "+1 (555) 234-8901",
      performersCount: 2,
      bio: "Internationally acclaimed synthwave duo featuring analog synthesizers, live vocal looping, and custom laser choreography.",
      requiredEquipment: ["dj_cdj3000", "synth_stand", "lasers", "iem_system", "power_3phase", "hazers"],
      technicalNotes: "Requires dedicated stereo line inputs for Roland Jupiter-X and Moog Sub 37. Laser safety perimeter must be verified prior to showtime.",
      soundcheckDuration: 45,
      performanceDuration: 75,
      notes: "Headlining electronic stage. Rider requires VIP greenroom and coconut water."
    },
    {
      id: "ART-002",
      name: "Velvet Horizon",
      genre: "Indie Rock",
      contactPerson: "Marcus Thorne",
      email: "marcus@velvethorizonband.com",
      phone: "+1 (555) 782-4419",
      performersCount: 5,
      bio: "Five-piece atmospheric indie rock band known for sweeping guitar swells, tight drums, and emotive anthemic vocals.",
      requiredEquipment: ["drum_kit", "guitar_amps", "mic_wired", "mic_wireless", "stage_monitors", "di_boxes"],
      technicalNotes: "Band travels with 3 guitars (custom tunings) and requires 4 mic stands. Drummer uses click track sent to channel 9.",
      soundcheckDuration: 45,
      performanceDuration: 60,
      notes: "Needs 15-minute warmup room before going live."
    },
    {
      id: "ART-003",
      name: "Solstice Eclipse",
      genre: "Metal / Hardcore",
      contactPerson: "Dmitri Volkov",
      email: "booking@solsticeeclipse.org",
      phone: "+1 (555) 901-3321",
      performersCount: 4,
      bio: "High-octane progressive metal outfit famed for intense wall-of-sound production, ferocious breakdowns, and elaborate pyro bursts.",
      requiredEquipment: ["drum_kit", "guitar_amps", "pyro_cannons", "power_3phase", "hazers", "iem_system", "moving_lights"],
      technicalNotes: "Heavy pyro cues at tracks 3, 7, and finale. Requires licensed pyrotechnician on stage wing at all times. Minimum stage width 15m.",
      soundcheckDuration: 50,
      performanceDuration: 60,
      notes: "Extensive equipment load-in; heavy teardown requires full 30 minutes minimum."
    },
    {
      id: "ART-004",
      name: "Kira & The Resonance",
      genre: "Acoustic / Folk",
      contactPerson: "Kira Sterling",
      email: "contact@kirasterlingmusic.com",
      phone: "+1 (555) 432-1190",
      performersCount: 3,
      bio: "Intimate acoustic trio weaving delicate fingerstyle guitar, cello, upright bass, and three-part vocal harmonies.",
      requiredEquipment: ["mic_wired", "stage_monitors", "di_boxes"],
      technicalNotes: "Pure acoustic tone required. Stage sound must be kept warm and natural without harsh high-frequency EQ.",
      soundcheckDuration: 30,
      performanceDuration: 45,
      notes: "Prefers day or sunset performance slot with acoustic-friendly quiet perimeter."
    },
    {
      id: "ART-005",
      name: "CYBERPUNK COLLECTIVE",
      genre: "Electronic / Dance",
      contactPerson: "Zack Miller (Agent)",
      email: "zack@apexsoundagency.com",
      phone: "+1 (555) 678-9900",
      performersCount: 3,
      bio: "Cutting-edge drum & bass and neurofunk trio performing with live modular synths, electric bass guitar, and rapid-fire MC.",
      requiredEquipment: ["dj_cdj3000", "iem_system", "subwoofers", "power_3phase", "led_wall", "lasers"],
      technicalNotes: "Requires ultra-low bass response down to 28Hz. Live video feed must sync to their resolume arena timecode.",
      soundcheckDuration: 40,
      performanceDuration: 60,
      notes: "Requested high-output sub-bass stage."
    },
    {
      id: "ART-006",
      name: "Midnight Mirages",
      genre: "Pop / R&B",
      contactPerson: "Aaliyah Brooks",
      email: "aaliyah@miragesmanagement.com",
      phone: "+1 (555) 345-6677",
      performersCount: 6,
      bio: "Chart-topping R&B sensation backed by a live 4-piece rhythm section and two backup vocalists.",
      requiredEquipment: ["mic_wireless", "iem_system", "led_wall", "moving_lights", "drum_kit", "guitar_amps", "synth_stand"],
      technicalNotes: "Lead singer utilizes Shure Axient Digital wireless mic. All 6 performers require custom IEM stereo mixes.",
      soundcheckDuration: 50,
      performanceDuration: 75,
      notes: "High production value show with synchronized video visuals on LED wall."
    },
    {
      id: "ART-007",
      name: "Rust & Timber",
      genre: "Indie Rock",
      contactPerson: "Caleb Scott",
      email: "caleb@rustandtimber.net",
      phone: "+1 (555) 890-1234",
      performersCount: 4,
      bio: "Gritty alt-country and indie rock quartet featuring pedal steel guitar, thumping Telecasters, and raw vocals.",
      requiredEquipment: ["drum_kit", "guitar_amps", "mic_wired", "di_boxes", "stage_monitors"],
      technicalNotes: "Pedal steel requires isolated direct box and designated clean tube amplifier.",
      soundcheckDuration: 35,
      performanceDuration: 50,
      notes: "Quick changeover band; standard 4-piece stage plot."
    },
    {
      id: "ART-008",
      name: "Astral Drift",
      genre: "Ambient / Experimental",
      contactPerson: "Julian Kester",
      email: "julian@astraldrift.io",
      phone: "+1 (555) 654-7890",
      performersCount: 1,
      bio: "Solo sound artist and modular synth builder creating deep cinematic soundscapes with real-time generative quadraphonic audio.",
      requiredEquipment: ["synth_stand", "di_boxes", "stage_monitors", "hazers", "led_wall"],
      technicalNotes: "4 independent outputs (Quad sound L/R Front, L/R Rear). Zero talkover microphone required.",
      soundcheckDuration: 30,
      performanceDuration: 50,
      notes: "Needs pitch-dark stage setup with fog and low ambient lighting."
    },
    {
      id: "ART-009",
      name: "Apex Velocity",
      genre: "Hip-Hop / Rap",
      contactPerson: "Trevor 'Blade' Washington",
      email: "blade@velocityrecords.com",
      phone: "+1 (555) 332-8877",
      performersCount: 3,
      bio: "Dynamic rap icon accompanied by championship turntablist DJ and hype vocalist, delivering relentless energy and sharp lyrics.",
      requiredEquipment: ["mic_wireless", "turntables", "stage_monitors", "led_wall", "pyro_cannons"],
      technicalNotes: "Needs 2x Technics 1200 turntables with Rane 72 mixer. Heavy sub-bass monitor right at DJ riser.",
      soundcheckDuration: 30,
      performanceDuration: 60,
      notes: "Rider asks for wireless hand-held mic backups on stage left."
    },
    {
      id: "ART-010",
      name: "The Jazz Odyssey",
      genre: "Jazz / Neo-Soul",
      contactPerson: "Seraphina Lin",
      email: "seraphina@jazzodyssey.com",
      phone: "+1 (555) 443-2211",
      performersCount: 5,
      bio: "Modern virtuoso quintet combining modal jazz improvisation with neo-soul grooves, grand piano, upright bass, and saxophone.",
      requiredEquipment: ["grand_piano", "drum_kit", "mic_wired", "stage_monitors", "di_boxes"],
      technicalNotes: "Requires tuned 7-foot or 9-foot concert grand acoustic piano on stage. Microphones for tenor saxophone and upright bass.",
      soundcheckDuration: 45,
      performanceDuration: 65,
      notes: "Must have piano tuned 2 hours prior to soundcheck."
    },
    {
      id: "ART-011",
      name: "Echo & The Void",
      genre: "Alternative / Post-Punk",
      contactPerson: "Rowan Blackwood",
      email: "rowan@echoandthevoid.co.uk",
      phone: "+44 20 7946 0991",
      performersCount: 4,
      bio: "Gothic post-punk revivalists blending cold drum machines, chorus-drenched basslines, and dramatic baritone vocals.",
      requiredEquipment: ["guitar_amps", "drum_kit", "synth_stand", "hazers", "moving_lights", "stage_monitors"],
      technicalNotes: "Heavy haze needed throughout the set. Low blue and monochrome lighting aesthetics only.",
      soundcheckDuration: 40,
      performanceDuration: 55,
      notes: "Band strictly avoids warm incandescent lighting."
    },
    {
      id: "ART-012",
      name: "Aurora Beats",
      genre: "Electronic / Dance",
      contactPerson: "Chloe Nguyen",
      email: "chloe@aurorabeats.fm",
      phone: "+1 (555) 776-5544",
      performersCount: 1,
      bio: "Global melodic house and progressive techno DJ/producer delivering uplifting sunrise and sunset melodic journeys.",
      requiredEquipment: ["dj_cdj3000", "iem_system", "stage_monitors", "led_wall", "moving_lights"],
      technicalNotes: "4x CDJ-3000 linked with Pro DJ Link network hub. Record output sent to FOH archive recorder.",
      soundcheckDuration: 25,
      performanceDuration: 90,
      notes: "Special sunset set requested."
    }
  ],

  // 4 Stages with diverse equipment and capacities
  DEFAULT_STAGES: [
    {
      id: "STG-001",
      name: "Horizon Amphitheatre (Main Stage)",
      location: "North Festival Field",
      capacity: 35000,
      equipment: [
        "mic_wireless", "mic_wired", "iem_system", "stage_monitors", "di_boxes",
        "drum_kit", "guitar_amps", "dj_cdj3000", "turntables", "synth_stand",
        "led_wall", "moving_lights", "lasers", "pyro_cannons", "hazers",
        "power_3phase", "grand_piano"
      ],
      capabilities: [
        "Full outdoor stadium line array system (110dB C-weighted at FOH)",
        "Motorized roof grid rated for 40-tonne production rigs",
        "Certified pyrotechnic blast zones & automatic CO2 safety shutoff",
        "Dual 4K LED side IMAG screens plus 24x8m center P3 LED wall",
        "Redundant 400A 3-phase power drops"
      ],
      setupConstraints: "Requires minimum 25-minute turnaround buffer between live band changeovers.",
      turnaroundMinutes: 25,
      status: "Active",
      dimensions: "28m (W) x 18m (D) x 14m (H)"
    },
    {
      id: "STG-002",
      name: "Solar Dance Dome",
      location: "East Plaza Pavilion",
      capacity: 12000,
      equipment: [
        "mic_wireless", "iem_system", "stage_monitors", "di_boxes",
        "dj_cdj3000", "turntables", "synth_stand",
        "led_wall", "moving_lights", "lasers", "hazers",
        "power_3phase"
      ],
      capabilities: [
        "360-degree immersive surround sound rig with ultra-cardioid subwoofers",
        "Suspended kinetic lighting ceiling and synchronized laser matrix",
        "DJ booth with vibration-damped floating floor platform",
        "Continuous cryogenic smoke distribution system"
      ],
      setupConstraints: "Fast electronic changeovers supported (15-minute standard changeover). No open flame pyrotechnics.",
      turnaroundMinutes: 15,
      status: "Active",
      dimensions: "20m (W) x 14m (D) x 10m (H)"
    },
    {
      id: "STG-003",
      name: "The Acoustic Meadow",
      location: "South Orchard Glade",
      capacity: 4500,
      equipment: [
        "mic_wired", "mic_wireless", "stage_monitors", "di_boxes",
        "drum_kit", "guitar_amps", "synth_stand", "hazers"
      ],
      capabilities: [
        "Natural amphitheater slope with high-fidelity acoustic reinforcement",
        "Covered wooden timber canopy with warm natural aesthetics",
        "Quiet generator isolated 200m away to eliminate ambient hum",
        "Warm vintage theater lighting fixtures"
      ],
      setupConstraints: "Strict 95dB SPL sound limit. NO pyrotechnics or industrial 3-phase power available. 20-min turnaround.",
      turnaroundMinutes: 20,
      status: "Active",
      dimensions: "14m (W) x 10m (D) x 6m (H)"
    },
    {
      id: "STG-004",
      name: "Underground Bass Vault",
      location: "West Industrial Warehouse",
      capacity: 6500,
      equipment: [
        "mic_wireless", "mic_wired", "stage_monitors", "di_boxes",
        "dj_cdj3000", "turntables", "synth_stand", "drum_kit", "guitar_amps",
        "moving_lights", "lasers", "hazers", "power_3phase"
      ],
      capabilities: [
        "Reinforced concrete acoustics tailored for high-SPL bass music",
        "Industrial grid with low-profile strobe arrays and blinders",
        "Heavy ventilation system for continuous haze distribution"
      ],
      setupConstraints: "15-minute turnaround buffer. Ceiling height 5.5m max.",
      turnaroundMinutes: 15,
      status: "Active",
      dimensions: "16m (W) x 12m (D) x 5.5m (H)"
    }
  ],

  // 14 Performances over Aug 15 & Aug 16, 2026
  // Includes INTENTIONAL DELIBERATE CONFLICTS to demonstrate the engine on launch:
  // Conflict 1 (Stage Overlap): PERF-001 & PERF-002 on Horizon Amphitheatre overlap between 20:30 and 21:00.
  // Conflict 2 (Artist Double-Booking): ART-005 (CYBERPUNK COLLECTIVE) booked at Solar Dance Dome (PERF-005) & Underground Bass Vault (PERF-006) at 22:00.
  // Conflict 3 (Turnaround Collision): PERF-003 ends at 17:30 with 25m teardown (until 17:55); PERF-004 starts at 18:00 with 20m setup (from 17:40), colliding and violating stage turnaround!
  // Conflict 4 (Technical Incompatibility): PERF-008 assigns Solstice Eclipse (ART-003, requires pyro & 3-phase power) to Acoustic Meadow (STG-003, which lacks both!).
  DEFAULT_PERFORMANCES: [
    // --- DAY 1: 2026-08-15 ---
    {
      id: "PERF-001",
      artistId: "ART-001", // The Neon Synthetics
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-15",
      startTime: "19:30",
      endTime: "20:45",
      soundcheckStartTime: "17:00",
      soundcheckEndTime: "17:45",
      setupDuration: 25,
      teardownDuration: 20,
      status: "Confirmed",
      notes: "Main Stage Co-Headliner set."
    },
    {
      id: "PERF-002",
      artistId: "ART-006", // Midnight Mirages
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-15",
      startTime: "20:30",  // INTENTIONAL STAGE OVERLAP with PERF-001 (19:30 - 20:45)!
      endTime: "21:45",
      soundcheckStartTime: "15:45",
      soundcheckEndTime: "16:35",
      setupDuration: 20,
      teardownDuration: 20,
      status: "Confirmed",
      notes: "Co-Headliner show. Conflicts with The Neon Synthetics on Main Stage."
    },
    {
      id: "PERF-003",
      artistId: "ART-002", // Velvet Horizon
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-15",
      startTime: "16:30",
      endTime: "17:30",
      soundcheckStartTime: "14:30",
      soundcheckEndTime: "15:15",
      setupDuration: 20,
      teardownDuration: 25, // Teardown finishes at 17:55
      status: "Confirmed",
      notes: "Sunset indie showcase."
    },
    {
      id: "PERF-004",
      artistId: "ART-011", // Echo & The Void
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-15",
      startTime: "18:00",  // Setup starts at 17:40, which overlaps with PERF-003 teardown ending at 17:55!
      endTime: "18:55",
      soundcheckStartTime: "13:30",
      soundcheckEndTime: "14:10",
      setupDuration: 20,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Post-punk evening slot. Changeover turnaround conflict with Velvet Horizon."
    },
    {
      id: "PERF-005",
      artistId: "ART-005", // CYBERPUNK COLLECTIVE
      stageId: "STG-002",  // Solar Dance Dome
      date: "2026-08-15",
      startTime: "21:30",
      endTime: "22:45",
      soundcheckStartTime: "18:00",
      soundcheckEndTime: "18:40",
      setupDuration: 15,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Solar Dance Dome midnight prime slot."
    },
    {
      id: "PERF-006",
      artistId: "ART-005", // CYBERPUNK COLLECTIVE - INTENTIONAL ARTIST DOUBLE-BOOKING!
      stageId: "STG-004",  // Underground Bass Vault
      date: "2026-08-15",
      startTime: "22:00",  // Overlaps with PERF-005 (21:30 - 22:45) on Stage 2!
      endTime: "23:00",
      soundcheckStartTime: "19:00",
      soundcheckEndTime: "19:40",
      setupDuration: 15,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Double booked on two stages simultaneously!"
    },
    {
      id: "PERF-007",
      artistId: "ART-012", // Aurora Beats
      stageId: "STG-002",  // Solar Dance Dome
      date: "2026-08-15",
      startTime: "19:45",
      endTime: "21:15",
      soundcheckStartTime: "17:00",
      soundcheckEndTime: "17:25",
      setupDuration: 10,
      teardownDuration: 10,
      status: "Confirmed",
      notes: "Sunset progressive set."
    },
    {
      id: "PERF-008",
      artistId: "ART-003", // Solstice Eclipse (Heavy Metal with Pyrotechnics)
      stageId: "STG-003",  // The Acoustic Meadow - INTENTIONAL TECHNICAL INCOMPATIBILITY!
      date: "2026-08-15",
      startTime: "20:00",
      endTime: "21:00",
      soundcheckStartTime: "18:30",
      soundcheckEndTime: "19:20",
      setupDuration: 25,
      teardownDuration: 30,
      status: "Confirmed",
      notes: "Requires Pyro Cannons and 3-Phase power, which Acoustic Meadow lacks!"
    },
    {
      id: "PERF-009",
      artistId: "ART-004", // Kira & The Resonance
      stageId: "STG-003",  // The Acoustic Meadow
      date: "2026-08-15",
      startTime: "16:00",
      endTime: "16:45",
      soundcheckStartTime: "15:00",
      soundcheckEndTime: "15:30",
      setupDuration: 15,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Afternoon acoustic set."
    },

    // --- DAY 2: 2026-08-16 ---
    {
      id: "PERF-010",
      artistId: "ART-009", // Apex Velocity
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-16",
      startTime: "21:00",
      endTime: "22:00",
      soundcheckStartTime: "17:30",
      soundcheckEndTime: "18:00",
      setupDuration: 20,
      teardownDuration: 20,
      status: "Confirmed",
      notes: "Day 2 Main Stage Headliner."
    },
    {
      id: "PERF-011",
      artistId: "ART-007", // Rust & Timber
      stageId: "STG-001",  // Horizon Amphitheatre
      date: "2026-08-16",
      startTime: "19:00",
      endTime: "19:50",
      soundcheckStartTime: "16:30",
      soundcheckEndTime: "17:05",
      setupDuration: 20,
      teardownDuration: 20,
      status: "Confirmed",
      notes: "Golden hour rock set. Sufficient 50-minute changeover before Apex Velocity."
    },
    {
      id: "PERF-012",
      artistId: "ART-008", // Astral Drift
      stageId: "STG-004",  // Underground Bass Vault
      date: "2026-08-16",
      startTime: "20:00",
      endTime: "20:50",
      soundcheckStartTime: "18:45",
      soundcheckEndTime: "19:15",
      setupDuration: 15,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Quadraphonic ambient modular performance."
    },
    {
      id: "PERF-013",
      artistId: "ART-010", // The Jazz Odyssey
      stageId: "STG-003",  // The Acoustic Meadow
      date: "2026-08-16",
      startTime: "18:00",
      endTime: "19:05",
      soundcheckStartTime: "16:30",
      soundcheckEndTime: "17:15",
      setupDuration: 20,
      teardownDuration: 20,
      status: "Confirmed",
      notes: "Twilight jazz ensemble."
    },
    {
      id: "PERF-014",
      artistId: "ART-001", // The Neon Synthetics (Encore DJ Set)
      stageId: "STG-002",  // Solar Dance Dome
      date: "2026-08-16",
      startTime: "22:30",
      endTime: "23:45",
      soundcheckStartTime: "21:00",
      soundcheckEndTime: "21:45",
      setupDuration: 15,
      teardownDuration: 15,
      status: "Confirmed",
      notes: "Closing festival club set. Valid, no conflicts."
    }
  ]
};

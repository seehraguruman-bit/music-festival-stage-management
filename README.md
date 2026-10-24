# Aura Sound & Arts Festival - Artist Management System (FMS)

A centralized, responsive, production-ready Festival Management and Artist Scheduling Dashboard engineered strictly using **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**.

---

## 1. Project Overview

Festival organizers face extreme logistics challenges: coordinating dozens of artists, multi-stage turnarounds, strict noise curfews, soundchecks, and technical equipment rider requirements.

The **Aura Music Festival Artist Management System** replaces error-prone spreadsheets with an interactive, automated web application featuring:
- **Centralized Dashboard**: Dynamic KPI counters, stage distribution load charts, upcoming performance queue, and audit activity feed.
- **Complete Artist CRUD**: Unique ID validation, contact dossiers, genre classification, performer counts, set durations, and full backline rider specifications.
- **Complete Stage CRUD**: Capacity tracking, location, audio/production inventory checklists, turnaround buffer constraints, and technical capabilities.
- **Interactive Visual Timeline (Swimlanes)**: Visual representation with horizontal hour tracks (12:00 PM to 02:00 AM) and dedicated swimlanes per stage, with color-coded conflict warnings and hover inspection.
- **6-Way Conflict Detection Engine**: Interval-based mathematical overlap detection with real-time recalculation and actionable resolution recommendations.
- **Dedicated Conflict Resolution Center**: Direct links to edit affected performances and immediate conflict recalculation.
- **Technical Rider Matrix**: Live compatibility verification comparing artist riders against stage inventories with missing equipment alerts.
- **Reports & Native Export**: Client-side CSV generation for artists, timetable schedules, and conflict logs; plus high-contrast, print-ready daily festival timetables.
- **Local Persistence**: Browser `localStorage` persistence with seed demo data, graceful error recovery, and demo data reset.

---

## 2. Technology Constraints & Compliance

This project complies 100% with all strict technology restrictions:
- **No JavaScript frameworks** (No React, Vue, Angular, Svelte, etc.).
- **No CSS frameworks** (No Tailwind, Bootstrap, Bulma, etc.).
- **No TypeScript or build tooling** (No npm, Vite, Webpack, Parcel, Babel, etc.).
- **No backend servers or database engines** (No Node.js, Python, PHP, Java, SQLite, etc.).
- **Zero external dependencies**: Runs natively in any modern browser directly via the `file://` protocol or any local static server.

---

## 3. How to Run the Application

### Option A: Direct Browser File Opening (Zero Setup)
1. Navigate to the project directory:
   `V:\STAGE MAMAGMENT SYSTEM\music-festival-management\` (or root `V:\STAGE MAMAGMENT SYSTEM\`)
2. Double-click `index.html` to open it in your browser (Chrome, Firefox, Edge, Safari, Brave, etc.).
3. The application will launch instantly with the pre-seeded demo dataset!

### Option B: Local Static Server (Optional)
If you prefer running through `http://localhost`:
```bash
# Using Python
python -m http.server 8000

# Open in browser:
http://localhost:8000
```

---

## 4. Conflict Detection Engine: Mathematical Formulation

Bookings are represented mathematically as numeric millisecond time intervals:

$$\text{Interval} = [\text{Start}_{\text{ms}}, \text{End}_{\text{ms}}]$$

Two intervals $A$ and $B$ strictly collide if and only if:

$$A_{\text{start}} < B_{\text{end}} \land B_{\text{start}} < A_{\text{end}}$$

Valid adjacent performances (where $A_{\text{end}} = B_{\text{start}}$) do not conflict unless stage occupancy, teardown, or turnaround buffers make them incompatible.

### The 6 Conflict Types Detected:
1. **Stage Overlap (Critical)**: Two performances on the same stage occupy overlapping performance time windows.
2. **Artist Double-Booking (Critical)**: The same artist is booked for overlapping performances across identical or different stages.
3. **Setup and Teardown Conflict (Critical)**: A preceding act's teardown window overlaps with the succeeding act's required stage setup window on the same stage:
   $$\text{Occupancy}_A = [\text{Start}_A - \text{Setup}_A, \text{End}_A + \text{Teardown}_A]$$
4. **Insufficient Turnaround Time (Warning)**: Gap between performance teardown and the next setup is less than the stage's configured minimum turnaround buffer policy.
5. **Soundcheck Conflict (Warning)**: Two soundcheck windows overlap on the same stage, or an artist is scheduled for a soundcheck while performing elsewhere.
6. **Technical Incompatibility (Warning)**: Stage inventory lacks one or more equipment items specified in the artist's technical rider (e.g. pyrotechnics, 3-phase power, concert grand piano).

---

## 5. Seed Demo Data & Intentional Conflicts

On the first launch, the system automatically seeds:
- **12 Diverse Artists**: Electronic, Indie Rock, Heavy Metal, Acoustic Folk, Hip-Hop, Pop/R&B, Ambient, Post-Punk, Jazz/Neo-Soul.
- **4 Festival Stages**:
  - *Horizon Amphitheatre (Main Stage)*: 35,000 capacity, line array, pyrotechnics, grand piano, 25-min turnaround.
  - *Solar Dance Dome*: 12,000 capacity, 4x CDJ-3000, 360-degree subwoofers, lasers, 15-min turnaround.
  - *The Acoustic Meadow*: 4,500 capacity, natural timber acoustic canopy, strict 95dB limit, no pyrotechnics, 20-min turnaround.
  - *Underground Bass Vault*: 6,500 capacity, concrete warehouse bass setup, 15-min turnaround.
- **14 Pre-Scheduled Performances**:
  Featuring **4 deliberate conflicts** to demonstrate automatic detection immediately:
  1. **Stage Overlap**: *The Neon Synthetics* (19:30–20:45) and *Midnight Mirages* (20:30–21:45) both booked on *Horizon Amphitheatre* on Day 1.
  2. **Artist Double-Booking**: *CYBERPUNK COLLECTIVE* booked simultaneously on *Solar Dance Dome* (21:30–22:45) and *Underground Bass Vault* (22:00–23:00) on Day 1.
  3. **Turnaround Collision**: *Velvet Horizon* teardown finishes at 17:55, while *Echo & The Void* setup starts at 17:40 on Main Stage (15-min collision).
  4. **Technical Incompatibility**: *Solstice Eclipse* (Metal act requiring pyrotechnics and 3-phase power) booked on *The Acoustic Meadow*, which lacks both.

---

## 6. Acceptance Criteria Walkthrough

1. **Add an artist**: Click **Artists & Bands** &rarr; **Add New Artist** &rarr; fill in name, genre, rider items &rarr; Save. Appears instantly in roster.
2. **Add a stage**: Click **Festival Stages** &rarr; **Create New Stage** &rarr; fill in name, capacity, equipment &rarr; Save.
3. **Schedule an artist on that stage**: Click **Schedule Performance** &rarr; select artist & stage &rarr; choose time &rarr; Confirm. Blocks appear on timeline swimlane and table.
4. **Create an intentional scheduling conflict**: Book an artist overlapping another showtime on the same stage.
5. **See conflict detected automatically**: Conflict counter in sidebar and dashboard increments. The Conflict Resolution Center displays the exact collision reason and suggested fix.
6. **Edit the schedule to resolve conflict**: Click **Edit Set** on the conflict card or click the red block in the timeline &rarr; adjust time &rarr; Save.
7. **See updated conflict count**: Conflicts recalculate in real-time, badge decrements, and resolution is confirmed.
8. **Refresh the page without losing saved data**: Press F5 or reload; all modifications persist via browser `localStorage`.
9. **Export timetable and conflict report**: Navigate to **Reports & CSV Export** &rarr; click **Download Schedule CSV** and **Print Timetable**.

---

## 7. Project File Structure

```
music-festival-management/
│
├── index.html                           # Main application HTML5 single-page interface
├── README.md                            # Complete technical documentation & operational manual
├── css/
│   └── style.css                        # Pure CSS3 design system, responsive grid, swimlanes, & print styles
└── js/
    ├── data.js                          # Initial seed data (12 artists, 4 stages, 14 performances, equipment catalog)
    ├── storage.js                       # LocalStorage persistence, validation, error handling, audit logger
    ├── conflicts.js                     # 6-way mathematical Conflict Detection Engine & resolution generator
    ├── artists.js                       # Artist CRUD, rider checklists, search/filter, and dossier modal
    ├── stages.js                        # Stage CRUD, capacity, turnaround rules, and equipment inventories
    ├── schedule.js                      # Performance scheduling, visual timeline swimlanes, table view
    ├── reports.js                       # Client-side RFC 4180 CSV export and native browser print formatting
    └── app.js                           # Dashboard analytics, tab navigation router, toast notifications
```

---

*Engineered with precision for festival directors, stage managers, and audio production teams.*

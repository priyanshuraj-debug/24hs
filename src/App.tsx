import { useEffect, useMemo, useRef, useState } from "react";

type Role = "citizen" | "rescue";
type Priority = "CRITICAL" | "HIGH" | "MEDIUM";
type Status = "NEW" | "ASSIGNED" | "IN PROGRESS" | "RESOLVED";
type SyncStatus = "SYNCED" | "PENDING";

type Incident = {
  id: string;
  type: string;
  priority: Priority;
  location: string;
  latitude: number;
  longitude: number;
  peopleAffected: number;
  description: string;
  reportedAt: string;
  status: Status;
  reportedBy: string;
  assignedTeam: string | null;
  verifiedReports: number;
  syncStatus: SyncStatus;
  resolvedAt?: string;
};

type IconName =
  | "alert"
  | "arrow"
  | "bell"
  | "check"
  | "chevron"
  | "clipboard"
  | "dashboard"
  | "droplet"
  | "fire"
  | "food"
  | "home"
  | "hospital"
  | "location"
  | "logout"
  | "map"
  | "medical"
  | "menu"
  | "people"
  | "plus"
  | "profile"
  | "radio"
  | "rescue"
  | "road"
  | "search"
  | "shield"
  | "team"
  | "time"
  | "wifi"
  | "wifiOff";

const iconPaths: Record<IconName, React.ReactNode> = {
  alert: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/></>,
  arrow: <><path d="m9 18 6-6-6-6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6m-6 4h6m-6 4h4"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  droplet: <path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>,
  fire: <path d="M12 22c4 0 7-3 7-7 0-3-1-5-4-8 0 3-2 4-3 4 1-4-1-7-4-9 0 5-3 7-3 12 0 5 3 8 7 8Z"/>,
  food: <><path d="M4 3v7a3 3 0 0 0 3 3V3m-3 4h3m0 6v8M17 3v18m0-18c-3 2-4 7 0 9"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-6h6v6"/></>,
  hospital: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M9 5V2h6v3m-3 4v8m-4-4h8"/></>,
  location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3"/><path d="M14 3h7v18h-7"/></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/></>,
  medical: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M9 12h6m-3-3v6"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  people: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0m1-15a4 4 0 0 1 0 8m1 3a6 6 0 0 1 4 4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  radio: <><circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7M5 5a10 10 0 0 0 0 14m14-14a10 10 0 0 1 0 14"/></>,
  rescue: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12h6m-3-3v6"/></>,
  road: <><path d="m8 3-3 18m11-18 3 18M12 5v3m0 3v3m0 3v2"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></>,
  team: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 20a6 6 0 0 1 12 0m0-4a5 5 0 0 1 8 4"/></>,
  time: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r=".5"/></>,
  wifiOff: <><path d="m3 3 18 18M5 12.5a10 10 0 0 1 4-2.4m5.5.3a10 10 0 0 1 4.5 2.1M8.5 16a5 5 0 0 1 3-1.4M12 20h.01"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

const types = [
  { name: "Need Rescue", icon: "rescue" as IconName, tone: "red", help: "Trapped or in immediate danger" },
  { name: "Medical Emergency", icon: "medical" as IconName, tone: "rose", help: "Urgent injury or health crisis" },
  { name: "Fire", icon: "fire" as IconName, tone: "orange", help: "Active fire or smoke" },
  { name: "Flood", icon: "droplet" as IconName, tone: "blue", help: "Rising water or flooding" },
  { name: "Blocked Road", icon: "road" as IconName, tone: "amber", help: "Impassable or unsafe route" },
  { name: "Food / Water", icon: "food" as IconName, tone: "teal", help: "Essential supply request" },
];

const starterIncidents: Incident[] = [
  { id: "DM-1039", type: "Medical Emergency", priority: "CRITICAL", location: "Sector 22, North Ward", latitude: 48, longitude: 68, peopleAffected: 1, description: "Elderly resident requires urgent medical support.", reportedAt: new Date(Date.now() - 4 * 60000).toISOString(), status: "NEW", reportedBy: "Aisha Khan", assignedTeam: null, verifiedReports: 2, syncStatus: "SYNCED" },
  { id: "DM-1037", type: "Fire", priority: "HIGH", location: "Sector 35, Market Road", latitude: 63, longitude: 38, peopleAffected: 8, description: "Heavy smoke visible from a warehouse.", reportedAt: new Date(Date.now() - 8 * 60000).toISOString(), status: "ASSIGNED", reportedBy: "Rohan Das", assignedTeam: "Rescue Team Bravo", verifiedReports: 3, syncStatus: "SYNCED" },
  { id: "DM-1034", type: "Food / Water", priority: "MEDIUM", location: "Sector 44, Relief Camp", latitude: 30, longitude: 46, peopleAffected: 20, description: "Drinking water supplies are running low.", reportedAt: new Date(Date.now() - 15 * 60000).toISOString(), status: "NEW", reportedBy: "Camp Volunteer", assignedTeam: null, verifiedReports: 1, syncStatus: "SYNCED" },
  { id: "DM-1031", type: "Flood", priority: "HIGH", location: "Riverside Colony", latitude: 72, longitude: 73, peopleAffected: 14, description: "Water level above the ground floor.", reportedAt: new Date(Date.now() - 42 * 60000).toISOString(), status: "IN PROGRESS", reportedBy: "Community Lead", assignedTeam: "Rescue Team Delta", verifiedReports: 5, syncStatus: "SYNCED" },
];

const teams = [
  { name: "Rescue Team Alpha", detail: "3 members · Water rescue", available: true },
  { name: "Medical Team One", detail: "4 members · Trauma unit", available: true },
  { name: "Rescue Team Bravo", detail: "5 members · Fire response", available: false },
  { name: "Rescue Team Delta", detail: "4 members · Flood response", available: false },
];

const shelters = [
  { name: "Central Community Hall", area: "Sector 18", capacity: "142 / 220", x: 20, y: 28 },
  { name: "North Ward School", area: "Sector 12", capacity: "86 / 180", x: 78, y: 24 },
];

function loadIncidents() {
  try {
    const saved = localStorage.getItem("disastermesh-incidents");
    return saved ? (JSON.parse(saved) as Incident[]) : starterIncidents;
  } catch {
    return starterIncidents;
  }
}

function getPriority(type: string, description: string): Priority {
  const text = description.toLowerCase();
  if (["Need Rescue", "Medical Emergency", "Fire"].includes(type) || text.includes("trapped")) return "CRITICAL";
  if (["Flood", "Blocked Road"].includes(type)) return "HIGH";
  return "MEDIUM";
}

function formatTime(iso: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return new Date(iso).toLocaleDateString();
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-lockup">
      <span className="logo-mark"><Icon name="radio" size={compact ? 18 : 22} /></span>
      <span className="logo-word">Disaster<span>Mesh</span></span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority ${priority.toLowerCase()}`}><span />{priority}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
}

function Login({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <Logo />
          <div className="brand-message">
            <span className="eyebrow light">RESILIENT BY DESIGN</span>
            <h1>When networks fail,<br />help stays connected.</h1>
            <p>Critical emergency information is stored safely and delivered to rescue teams the moment connectivity returns.</p>
          </div>
          <div className="mesh-visual" aria-hidden="true">
            <span className="mesh-ring ring-one" />
            <span className="mesh-ring ring-two" />
            <span className="mesh-node node-one" />
            <span className="mesh-node node-two" />
            <span className="mesh-node node-three" />
            <Icon name="radio" size={54} />
          </div>
          <div className="brand-proof"><Icon name="shield" /><span><strong>Offline-first protection</strong>Emergency reports remain on this device until safely synced.</span></div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <div className="mobile-logo"><Logo /></div>
          <span className="eyebrow">EMERGENCY RESPONSE NETWORK</span>
          <h2>Choose your access</h2>
          <p className="subtle">No account needed for this demonstration.</p>
          <div className="role-cards">
            <button className="role-card" onClick={() => onSelect("citizen")}>
              <span className="role-icon citizen"><Icon name="profile" size={26} /></span>
              <span className="role-copy"><strong>Continue as Citizen</strong><small>Report emergencies, send SOS and track help</small></span>
              <Icon name="arrow" />
            </button>
            <button className="role-card" onClick={() => onSelect("rescue")}>
              <span className="role-icon rescue"><Icon name="shield" size={26} /></span>
              <span className="role-copy"><strong>Continue as Rescue Team</strong><small>Manage incidents and coordinate response</small></span>
              <Icon name="arrow" />
            </button>
          </div>
          <div className="network-note"><span className="pulse-dot" /><div><strong>Network operational</strong><small>Offline protection is active on this device</small></div></div>
        </div>
        <p className="login-footer">DisasterMesh prototype · Emergency coordination platform</p>
      </section>
    </main>
  );
}

type CitizenView = "home" | "report" | "success" | "reports" | "queue" | "map" | "profile";

function ConnectionPill({ online, onToggle }: { online: boolean; onToggle: () => void }) {
  return (
    <button className={`connection-pill ${online ? "online" : "offline"}`} onClick={onToggle} title="Toggle demo network state">
      <Icon name={online ? "wifi" : "wifiOff"} size={17} />
      <span><strong>{online ? "ONLINE" : "OFFLINE"}</strong><small>{online ? "Connected" : "No Internet"}</small></span>
      <Icon name="chevron" size={14} />
    </button>
  );
}

function CitizenHeader({ online, pending, onNetworkToggle, onQueue, onExit }: { online: boolean; pending: number; onNetworkToggle: () => void; onQueue: () => void; onExit: () => void }) {
  return (
    <header className="citizen-header">
      <Logo compact />
      <div className="header-actions">
        <ConnectionPill online={online} onToggle={onNetworkToggle} />
        <button className="icon-button notification" aria-label="Notifications"><Icon name="bell" />{pending > 0 && <span>{pending}</span>}</button>
        <button className="avatar-button" onClick={onQueue} aria-label="Open offline queue">AK</button>
        <button className="icon-button desktop-only" onClick={onExit} aria-label="Log out"><Icon name="logout" /></button>
      </div>
    </header>
  );
}

function OfflineBanner({ pending }: { pending: number }) {
  return (
    <div className="offline-banner">
      <span className="offline-symbol"><Icon name="wifiOff" /></span>
      <div><strong>OFFLINE MODE</strong><p>Your emergency information will be saved on this device and synced automatically when the connection returns.</p></div>
      {pending > 0 && <span className="queue-count">{pending} waiting</span>}
    </div>
  );
}

function CitizenHome({ online, onReport, onSOS, pending }: { online: boolean; onReport: (type: string) => void; onSOS: () => void; pending: number }) {
  return (
    <div className="citizen-content home-content">
      {!online && <OfflineBanner pending={pending} />}
      <div className="citizen-intro">
        <span className="eyebrow">EMERGENCY ASSISTANCE</span>
        <h1>How can we help?</h1>
        <p>Select the kind of support you need. We will capture your location and alert the nearest response team.</p>
      </div>
      <button className="sos-button" onClick={onSOS}>
        <span className="sos-icon"><Icon name="radio" size={28} /></span>
        <span><strong>SEND SOS</strong><small>Immediate life-threatening danger</small></span>
        <Icon name="arrow" />
      </button>
      <div className="emergency-grid">
        {types.map((type) => (
          <button key={type.name} className="emergency-card" onClick={() => onReport(type.name)}>
            <span className={`emergency-icon ${type.tone}`}><Icon name={type.icon} size={25} /></span>
            <span><strong>{type.name}</strong><small>{type.help}</small></span>
            <Icon name="arrow" size={18} />
          </button>
        ))}
      </div>
      <div className="prepared-card">
        <span><Icon name="shield" /></span>
        <div><strong>Your reports are protected offline</strong><p>Even without internet, every emergency is securely saved and queued for delivery.</p></div>
        <span className="protected-label">DEVICE PROTECTED</span>
      </div>
    </div>
  );
}

function ReportForm({ initialType, online, onCancel, onSubmit }: { initialType: string; online: boolean; onCancel: () => void; onSubmit: (data: Omit<Incident, "id" | "reportedAt" | "status" | "reportedBy" | "assignedTeam" | "verifiedReports" | "syncStatus" | "priority">) => void }) {
  const [type, setType] = useState(initialType || "Need Rescue");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState(5);
  const [description, setDescription] = useState(initialType === "Need Rescue" ? "5 people are trapped inside a building." : "");
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState("");

  const useLocation = () => {
    setLocating(true);
    const fallback = () => { setLocation("Sector 45, East District"); setLocating(false); };
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`); setLocating(false); },
      fallback,
      { timeout: 2500 },
    );
  };

  return (
    <div className="citizen-content form-content">
      {!online && <OfflineBanner pending={0} />}
      <button className="back-button" onClick={onCancel}><span><Icon name="arrow" /></span>Back to emergency options</button>
      <div className="form-heading">
        <span className="eyebrow">CREATE INCIDENT</span>
        <h1>Report an Emergency</h1>
        <p>Share clear details so the right team can respond quickly.</p>
      </div>
      <form className="report-form" onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type, location: location || "Sector 45, East District", latitude: 42, longitude: 56, peopleAffected: people, description: description || `${people} people need assistance.` });
      }}>
        <div className="form-section">
          <div className="section-number">1</div>
          <div className="section-body">
            <label className="field-label">Incident type <span>Required</span></label>
            <div className="type-selector">
              {types.map((item) => (
                <button type="button" key={item.name} onClick={() => setType(item.name)} className={type === item.name ? "selected" : ""}>
                  <Icon name={item.icon} /><span>{item.name}</span>{type === item.name && <span className="selected-check"><Icon name="check" size={12} /></span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-number">2</div>
          <div className="section-body">
            <label className="field-label">Location <span>Required</span></label>
            <button type="button" className="location-button" onClick={useLocation}><span><Icon name="location" /></span><div><strong>{locating ? "Finding your location…" : "Use Current Location"}</strong><small>Allow DisasterMesh to locate you</small></div><Icon name="arrow" /></button>
            <div className="divider"><span>OR ENTER MANUALLY</span></div>
            <div className="input-wrap"><Icon name="map" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sector 45, near City Hospital" /></div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-number">3</div>
          <div className="section-body two-column">
            <div>
              <label className="field-label">People affected</label>
              <div className="stepper"><button type="button" onClick={() => setPeople(Math.max(1, people - 1))}>−</button><strong>{people}</strong><button type="button" onClick={() => setPeople(people + 1)}>+</button></div>
            </div>
            <div>
              <label className="field-label">Description <span>Required</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what is happening and any immediate danger…" rows={5} />
              <small className="helper">Include hazards, injuries and access details.</small>
            </div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-number">4</div>
          <div className="section-body">
            <label className="field-label">Add a photo <span className="optional">Optional</span></label>
            <label className="photo-upload"><Icon name={photo ? "check" : "plus"} /><span><strong>{photo || "Upload an image"}</strong><small>Helps teams assess the scene · JPG or PNG</small></span><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0]?.name || "")} /></label>
          </div>
        </div>
        <div className="submit-area">
          <div className={`submission-note ${online ? "" : "offline"}`}><Icon name={online ? "shield" : "wifiOff"} /><span><strong>{online ? "Secure emergency transmission" : "Offline protection active"}</strong><small>{online ? "Your report will be sent immediately." : "This report will be saved and sent automatically later."}</small></span></div>
          <button className="primary-submit" type="submit"><Icon name="radio" />SEND EMERGENCY REPORT</button>
        </div>
      </form>
    </div>
  );
}

function SubmissionSuccess({ incident, online, pending, onView, onQueue, onHome }: { incident: Incident; online: boolean; pending: number; onView: () => void; onQueue: () => void; onHome: () => void }) {
  return (
    <div className="citizen-content success-content">
      {!online && <OfflineBanner pending={pending} />}
      <div className={`success-card ${online ? "sent" : "saved"}`}>
        <div className="success-emblem"><Icon name={online ? "check" : "shield"} size={34} /></div>
        <span className="eyebrow">{online ? "REPORT TRANSMITTED" : "OFFLINE PROTECTION ACTIVE"}</span>
        <h1>{online ? "Emergency Report Sent" : "Emergency Saved Locally"}</h1>
        <p>{online ? "Rescue coordinators have received your report and will review it immediately." : "The system lost connectivity, but it did not lose your emergency information."}</p>
        <div className="incident-reference"><small>INCIDENT ID</small><strong>{incident.id}</strong><button onClick={() => navigator.clipboard?.writeText(incident.id)}>Copy</button></div>
        {!online && (
          <div className="saved-checks">
            <span><Icon name="check" />Emergency details saved</span><span><Icon name="check" />Location saved</span><span><Icon name="check" />Incident ID generated</span>
          </div>
        )}
        <div className="success-summary">
          <div><small>STATUS</small><strong className={online ? "green-text" : "amber-text"}>{online ? "SENT TO RESCUE TEAM" : "WAITING FOR NETWORK"}</strong></div>
          <div><small>PRIORITY</small><PriorityBadge priority={incident.priority} /></div>
          <div><small>LOCATION</small><strong>{incident.location}</strong></div>
          <div><small>PEOPLE</small><strong>{incident.peopleAffected} affected</strong></div>
        </div>
        {!online && <div className="queue-alert"><Icon name="time" /><div><strong>{pending} emergency waiting to sync</strong><small>No need to submit again. We will send it automatically.</small></div></div>}
        <div className="success-actions">
          <button className="primary-dark" onClick={onView}>VIEW REPORT</button>
          {!online && <button className="secondary-button" onClick={onQueue}>OPEN OFFLINE QUEUE</button>}
          <button className="text-button" onClick={onHome}>Return home</button>
        </div>
      </div>
    </div>
  );
}

function ReportsList({ incidents, pending, onSelect, onQueue }: { incidents: Incident[]; pending: number; onSelect: (incident: Incident) => void; onQueue: () => void }) {
  const mine = incidents.filter((i) => i.reportedBy === "Aisha Khan");
  return (
    <div className="citizen-content list-content">
      <div className="page-title-row"><div><span className="eyebrow">INCIDENT HISTORY</span><h1>My Emergency Reports</h1><p>Track every report and its current response status.</p></div>{pending > 0 && <button className="pending-button" onClick={onQueue}><Icon name="time" />{pending} waiting to sync</button>}</div>
      {mine.length === 0 ? <div className="empty-state"><span><Icon name="clipboard" size={30} /></span><h2>No reports yet</h2><p>Your submitted emergencies will appear here.</p></div> :
        <div className="report-list">{mine.sort((a, b) => +new Date(b.reportedAt) - +new Date(a.reportedAt)).map((incident) => (
          <button className="citizen-report-card" key={incident.id} onClick={() => onSelect(incident)}>
            <span className={`report-type-icon ${incident.priority.toLowerCase()}`}><Icon name={types.find((t) => t.name === incident.type)?.icon || "alert"} /></span>
            <span className="report-main"><span><strong>{incident.id}</strong><PriorityBadge priority={incident.priority} /></span><b>{incident.type}</b><small><Icon name="location" size={14} />{incident.location} · {formatTime(incident.reportedAt)}</small></span>
            <span className="report-state">{incident.syncStatus === "PENDING" ? <span className="sync-pending"><Icon name="time" />WAITING TO SYNC</span> : <StatusBadge status={incident.status} />}<small>{incident.peopleAffected} people</small></span>
            <Icon name="arrow" />
          </button>
        ))}</div>
      }
    </div>
  );
}

function OfflineQueue({ incidents, online, syncing, onRetry, onDelete, onView }: { incidents: Incident[]; online: boolean; syncing: boolean; onRetry: () => void; onDelete: (id: string) => void; onView: (i: Incident) => void }) {
  const pending = incidents.filter((i) => i.syncStatus === "PENDING");
  const synced = incidents.filter((i) => i.reportedBy === "Aisha Khan" && i.syncStatus === "SYNCED");
  return (
    <div className="citizen-content list-content">
      <div className="page-title-row"><div><span className="eyebrow">LOCAL DEVICE STORAGE</span><h1>Offline Emergency Queue</h1><p>Reports are safely stored here until a connection is available.</p></div><span className={`queue-network ${online ? "online" : ""}`}><Icon name={online ? "wifi" : "wifiOff"} />{online ? "Network available" : "Waiting for connection"}</span></div>
      {syncing && <div className="sync-progress"><span className="spinner" /><div><strong>Syncing emergency reports…</strong><small>Securely transmitting local reports to rescue coordination.</small><div className="progress-track"><span /></div></div></div>}
      {pending.length === 0 ? <div className="queue-empty"><span><Icon name="check" size={28} /></span><h2>All reports are synchronized</h2><p>There are no emergencies waiting on this device.</p></div> :
        <div className="queue-section"><div className="queue-section-title"><h2>Waiting to sync</h2><span>{pending.length}</span></div>{pending.map((incident) => (
          <div className="queue-card" key={incident.id}>
            <span className="queue-card-icon"><Icon name="time" /></span><div className="queue-card-main"><span><strong>{incident.id}</strong><PriorityBadge priority={incident.priority} /></span><h3>{incident.type}</h3><p><Icon name="people" size={14} />{incident.peopleAffected} people <i /> <Icon name="location" size={14} />{incident.location}</p><small>Saved {formatTime(incident.reportedAt)} · Waiting for connection</small></div>
            <div className="queue-card-actions"><button onClick={() => onView(incident)}>View details</button><button className="delete" onClick={() => onDelete(incident.id)}>Delete draft</button></div>
          </div>
        ))}<button className="retry-button" disabled={!online || syncing} onClick={onRetry}><Icon name="radio" />{online ? "RETRY SYNC NOW" : "RETRY WHEN CONNECTED"}</button></div>
      }
      {synced.length > 0 && <div className="queue-section synced-section"><div className="queue-section-title"><h2>Recently synced</h2></div>{synced.slice(0, 3).map((incident) => <div className="synced-row" key={incident.id}><span><Icon name="check" /></span><div><strong>{incident.id} · {incident.type}</strong><small>{incident.location}</small></div><b>SYNCED</b></div>)}</div>}
    </div>
  );
}

function MapView({ incidents, rescue = false, onSelect }: { incidents: Incident[]; rescue?: boolean; onSelect: (i: Incident) => void }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Incident | null>(null);
  const filtered = incidents.filter((i) => i.syncStatus === "SYNCED" && (filter === "All" || filter === i.priority || filter === i.type));
  const choose = (incident: Incident) => { setSelected(incident); };
  return (
    <div className={rescue ? "rescue-map-page" : "citizen-content map-page"}>
      <div className="map-heading"><div><span className="eyebrow">LIVE SITUATION</span><h1>Disaster Map</h1><p>Verified incidents, routes and safe shelter locations.</p></div><div className="map-updated"><span className="pulse-dot" />Live · Updated now</div></div>
      <div className="filter-row">{["All", "CRITICAL", "Medical Emergency", "Fire", "Flood", "Blocked Road"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "CRITICAL" ? "Critical" : item}</button>)}</div>
      <div className="map-shell">
        <div className="map-canvas">
          <div className="road road-a" /><div className="road road-b" /><div className="road road-c" /><div className="river" />
          <span className="map-label label-a">NORTH WARD</span><span className="map-label label-b">SECTOR 45</span><span className="map-label label-c">RIVERSIDE</span>
          {filtered.map((incident) => <button key={incident.id} style={{ left: `${incident.latitude}%`, top: `${incident.longitude}%` }} className={`map-marker ${incident.priority.toLowerCase()} ${selected?.id === incident.id ? "active" : ""}`} onClick={() => choose(incident)} aria-label={`View ${incident.id}`}><Icon name={types.find((t) => t.name === incident.type)?.icon || "alert"} size={16} /></button>)}
          {shelters.map((s) => <button key={s.name} style={{ left: `${s.x}%`, top: `${s.y}%` }} className="map-marker shelter" aria-label={s.name}><Icon name="home" size={16} /></button>)}
          {selected && <div className="map-popup">
            <button className="popup-close" onClick={() => setSelected(null)}>×</button><span><strong>{selected.id}</strong><PriorityBadge priority={selected.priority} /></span><h3>{selected.type}</h3><p>{selected.peopleAffected} people · {selected.location}</p><button className="popup-view" onClick={() => onSelect(selected)}>View incident <Icon name="arrow" size={14} /></button>
          </div>}
          <div className="map-controls"><button>+</button><button>−</button><button><Icon name="location" size={16} /></button></div>
          <div className="map-legend"><span><i className="critical" />Critical</span><span><i className="high" />High</span><span><i className="medium" />Medium</span><span><i className="shelter" />Shelter</span></div>
        </div>
        {!rescue && <aside className="map-side"><h2>Active nearby</h2><span>{filtered.length} incidents</span>{filtered.slice(0, 4).map((i) => <button key={i.id} onClick={() => choose(i)}><i className={i.priority.toLowerCase()} /><div><strong>{i.type}</strong><small>{i.location}</small></div><span>{formatTime(i.reportedAt)}</span></button>)}</aside>}
      </div>
    </div>
  );
}

function IncidentDetail({ incident, citizen = false, onBack, onAssign, onStatus }: { incident: Incident; citizen?: boolean; onBack: () => void; onAssign?: () => void; onStatus?: (s: Status) => void }) {
  return (
    <div className={citizen ? "citizen-content detail-page" : "detail-page rescue-detail"}>
      <button className="back-button" onClick={onBack}><span><Icon name="arrow" /></span>Back to {citizen ? "reports" : "incidents"}</button>
      <div className="detail-header">
        <div><span className="eyebrow">INCIDENT DETAILS</span><h1>Incident #{incident.id}</h1><p>Reported {formatTime(incident.reportedAt)} by {incident.reportedBy}</p></div><div><PriorityBadge priority={incident.priority} /><StatusBadge status={incident.status} /></div>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-card incident-overview"><div className={`overview-icon ${incident.priority.toLowerCase()}`}><Icon name={types.find((t) => t.name === incident.type)?.icon || "alert"} size={28} /></div><div><small>INCIDENT TYPE</small><h2>{incident.type}</h2></div><div><small>PEOPLE AFFECTED</small><h2>{incident.peopleAffected}</h2></div></section>
          <section className="detail-card"><h3>Situation report</h3><p className="description">{incident.description}</p><div className="detail-facts"><span><Icon name="location" /><div><small>LOCATION</small><strong>{incident.location}</strong></div></span><span><Icon name="time" /><div><small>REPORTED</small><strong>{new Date(incident.reportedAt).toLocaleString()}</strong></div></span></div></section>
          <section className="detail-card location-card"><div><h3>Incident location</h3><p>{incident.location}</p></div><div className="mini-map"><div className="road road-a" /><div className="river" /><span className={`map-marker static ${incident.priority.toLowerCase()}`}><Icon name="location" size={15} /></span></div></section>
          {!citizen && incident.verifiedReports > 1 && <section className="verification-card"><span className="verification-icon"><Icon name="shield" /></span><div><span className="eyebrow">MULTIPLE REPORTS DETECTED</span><h3>{incident.verifiedReports} citizens reported an emergency from this location</h3><p><span><Icon name="check" />Location match</span><span><Icon name="check" />Incident type match</span><span><Icon name="check" />Independent reports</span></p></div><strong>HIGH CONFIDENCE</strong></section>}
        </div>
        <aside className="detail-sidebar">
          <section className="detail-card"><h3>Response status</h3><div className="timeline">{(["NEW", "ASSIGNED", "IN PROGRESS", "RESOLVED"] as Status[]).map((s, index) => {
            const order = ["NEW", "ASSIGNED", "IN PROGRESS", "RESOLVED"];
            const active = order.indexOf(incident.status) >= index;
            return <div className={active ? "active" : ""} key={s}><span>{active ? <Icon name="check" size={12} /> : index + 1}</span><div><strong>{s}</strong><small>{s === incident.status ? "Current status" : active ? "Completed" : "Pending"}</small></div></div>;
          })}</div></section>
          {incident.assignedTeam && <section className="assigned-card"><span><Icon name="team" /></span><div><small>ASSIGNED TEAM</small><strong>{incident.assignedTeam}</strong></div></section>}
          {!citizen && incident.status !== "RESOLVED" && <section className="action-card">
            {incident.status === "NEW" && <button className="primary-dark" onClick={onAssign}><Icon name="team" />ASSIGN TEAM</button>}
            {incident.status === "ASSIGNED" && <button className="action-progress" onClick={() => onStatus?.("IN PROGRESS")}><Icon name="radio" />MARK IN PROGRESS</button>}
            {incident.status === "IN PROGRESS" && <button className="action-resolve" onClick={() => onStatus?.("RESOLVED")}><Icon name="check" />MARK RESOLVED</button>}
          </section>}
          {incident.status === "RESOLVED" && <section className="resolved-card"><span><Icon name="check" /></span><div><strong>INCIDENT RESOLVED</strong><small>{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : "Response complete"}</small></div></section>}
        </aside>
      </div>
    </div>
  );
}

function CitizenNav({ view, setView, pending }: { view: CitizenView; setView: (v: CitizenView) => void; pending: number }) {
  const nav: { key: CitizenView; label: string; icon: IconName }[] = [
    { key: "home", label: "Home", icon: "home" }, { key: "reports", label: "My Reports", icon: "clipboard" }, { key: "map", label: "Map", icon: "map" }, { key: "queue", label: "Sync Queue", icon: "radio" }, { key: "profile", label: "Profile", icon: "profile" },
  ];
  return <nav className="citizen-nav">{nav.map((n) => <button className={view === n.key ? "active" : ""} key={n.key} onClick={() => setView(n.key)}><span><Icon name={n.icon} />{n.key === "queue" && pending > 0 && <i>{pending}</i>}</span><small>{n.label}</small></button>)}</nav>;
}

function ProfilePage({ onExit }: { onExit: () => void }) {
  return <div className="citizen-content list-content"><div className="page-title-row"><div><span className="eyebrow">ACCOUNT</span><h1>Your Profile</h1><p>Personal and emergency contact information.</p></div></div><div className="profile-card"><span>AK</span><div><h2>Aisha Khan</h2><p>Citizen responder · East District</p></div></div><div className="profile-settings"><div><span><Icon name="shield" /></span><div><strong>Offline protection</strong><small>Active on this device</small></div><b>ON</b></div><div><span><Icon name="bell" /></span><div><strong>Emergency notifications</strong><small>Incident and sync updates</small></div><b>ON</b></div><button onClick={onExit}><Icon name="logout" />Sign out of DisasterMesh</button></div></div>;
}

function CitizenApp({ incidents, setIncidents, online, setForcedOffline, syncing, syncNow, onExit }: { incidents: Incident[]; setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>; online: boolean; setForcedOffline: React.Dispatch<React.SetStateAction<boolean>>; syncing: boolean; syncNow: () => void; onExit: () => void }) {
  const [view, setView] = useState<CitizenView>("home");
  const [selectedType, setSelectedType] = useState("");
  const [selected, setSelected] = useState<Incident | null>(null);
  const pending = incidents.filter((i) => i.syncStatus === "PENDING").length;

  const openReport = (type: string) => { setSelectedType(type); setView("report"); };
  const submit = (data: Omit<Incident, "id" | "reportedAt" | "status" | "reportedBy" | "assignedTeam" | "verifiedReports" | "syncStatus" | "priority">) => {
    const highest = incidents.reduce((max, i) => Math.max(max, Number(i.id.replace("DM-", "")) || 1040), 1041);
    const incident: Incident = { ...data, id: `DM-${highest + 1}`, priority: getPriority(data.type, data.description), reportedAt: new Date().toISOString(), status: "NEW", reportedBy: "Aisha Khan", assignedTeam: null, verifiedReports: data.type === "Need Rescue" ? 4 : 1, syncStatus: online ? "SYNCED" : "PENDING" };
    setIncidents((old) => [incident, ...old]);
    setSelected(incident);
    setView("success");
  };
  const deletePending = (id: string) => setIncidents((old) => old.filter((i) => !(i.id === id && i.syncStatus === "PENDING")));
  const normalNav = !["report", "success"].includes(view);
  return (
    <div className="citizen-app">
      <CitizenHeader online={online} pending={pending} onNetworkToggle={() => setForcedOffline((v) => !v)} onQueue={() => setView("queue")} onExit={onExit} />
      <main>
        {view === "home" && <CitizenHome online={online} pending={pending} onReport={openReport} onSOS={() => openReport("Need Rescue")} />}
        {view === "report" && <ReportForm initialType={selectedType} online={online} onCancel={() => setView("home")} onSubmit={submit} />}
        {view === "success" && selected && <SubmissionSuccess incident={selected} online={selected.syncStatus === "SYNCED"} pending={pending} onView={() => setView("reports")} onQueue={() => setView("queue")} onHome={() => setView("home")} />}
        {view === "reports" && (selected && selected.id === "__detail" ? null : <ReportsList incidents={incidents} pending={pending} onQueue={() => setView("queue")} onSelect={(i) => { setSelected(i); setView("profile"); }} />)}
        {view === "queue" && <OfflineQueue incidents={incidents} online={online} syncing={syncing} onRetry={syncNow} onDelete={deletePending} onView={(i) => { setSelected(i); setView("profile"); }} />}
        {view === "map" && <MapView incidents={incidents} onSelect={(i) => { setSelected(i); setView("profile"); }} />}
        {view === "profile" && (selected ? <IncidentDetail incident={selected} citizen onBack={() => { setSelected(null); setView("reports"); }} /> : <ProfilePage onExit={onExit} />)}
      </main>
      {normalNav && <CitizenNav view={view} setView={(v) => { setSelected(null); setView(v); }} pending={pending} />}
    </div>
  );
}

type RescueView = "overview" | "incidents" | "map" | "teams" | "shelters" | "reports";

function RescueSidebar({ view, setView, onExit, open }: { view: RescueView; setView: (v: RescueView) => void; onExit: () => void; open: boolean }) {
  const nav: { key: RescueView; label: string; icon: IconName }[] = [
    { key: "overview", label: "Overview", icon: "dashboard" }, { key: "incidents", label: "Incidents", icon: "alert" }, { key: "map", label: "Live Map", icon: "map" }, { key: "teams", label: "Rescue Teams", icon: "team" }, { key: "shelters", label: "Shelters", icon: "home" }, { key: "reports", label: "Reports", icon: "clipboard" },
  ];
  return <aside className={`rescue-sidebar ${open ? "open" : ""}`}><div className="sidebar-logo"><Logo /><span>COMMAND CENTER</span></div><nav>{nav.map((n) => <button key={n.key} className={view === n.key ? "active" : ""} onClick={() => setView(n.key)}><Icon name={n.icon} /><span>{n.label}</span>{n.key === "incidents" && <i>4</i>}</button>)}</nav><div className="sidebar-bottom"><div><span>RS</span><div><strong>Raj Sharma</strong><small>Operations Lead</small></div></div><button onClick={onExit}><Icon name="logout" /></button></div></aside>;
}

function RescueTopbar({ onMenu, online }: { onMenu: () => void; online: boolean }) {
  return <header className="rescue-topbar"><button className="menu-button" onClick={onMenu}><Icon name="menu" /></button><div className="command-status"><span className={online ? "pulse-dot" : "red-dot"} /><div><strong>{online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}</strong><small>{online ? "All response services operational" : "Local command data available"}</small></div></div><div className="topbar-right"><div className="search-box"><Icon name="search" /><input placeholder="Search incident ID or location" /></div><button className="icon-button"><Icon name="bell" /><span>3</span></button><button className="top-avatar">RS</button></div></header>;
}

function Overview({ incidents, onSelect, setView }: { incidents: Incident[]; onSelect: (i: Incident) => void; setView: (v: RescueView) => void }) {
  const synced = incidents.filter((i) => i.syncStatus === "SYNCED");
  const active = synced.filter((i) => i.status !== "RESOLVED");
  const ordered = [...active].sort((a, b) => ["CRITICAL", "HIGH", "MEDIUM"].indexOf(a.priority) - ["CRITICAL", "HIGH", "MEDIUM"].indexOf(b.priority));
  const stats = [
    { label: "Critical Incidents", value: Math.max(12, active.filter((i) => i.priority === "CRITICAL").length), change: "Requires attention", icon: "alert" as IconName, tone: "critical" },
    { label: "High Priority", value: Math.max(28, active.filter((i) => i.priority === "HIGH").length), change: "Across 9 sectors", icon: "fire" as IconName, tone: "high" },
    { label: "Unresolved", value: Math.max(47, active.length), change: "6 assigned now", icon: "time" as IconName, tone: "blue" },
    { label: "People Affected", value: Math.max(184, active.reduce((sum, i) => sum + i.peopleAffected, 0)), change: "In active incidents", icon: "people" as IconName, tone: "purple" },
    { label: "Available Teams", value: teams.filter((t) => t.available).length + 6, change: "4 currently deployed", icon: "team" as IconName, tone: "green" },
    { label: "Resolved Today", value: 64 + synced.filter((i) => i.status === "RESOLVED").length, change: "89% response rate", icon: "check" as IconName, tone: "teal" },
  ];
  return <div className="rescue-page"><div className="rescue-page-title"><div><span className="eyebrow">SITUATION OVERVIEW</span><h1>Emergency Command Dashboard</h1><p>Live operational picture across all active response zones.</p></div><div className="last-updated"><Icon name="time" /><span><small>LAST UPDATED</small><strong>Just now</strong></span></div></div>
    <div className="stat-grid">{stats.map((s) => <div className={`stat-card ${s.tone}`} key={s.label}><span><Icon name={s.icon} /></span><div><small>{s.label}</small><strong>{s.value}</strong><p>{s.change}</p></div></div>)}</div>
    <div className="dashboard-grid">
      <section className="dashboard-panel incoming-panel"><div className="panel-header"><div><h2>Priority Incidents</h2><p>Latest incidents requiring action</p></div><button onClick={() => setView("incidents")}>View all <Icon name="arrow" size={15} /></button></div>
        <div className="compact-incidents">{ordered.slice(0, 4).map((i) => <button key={i.id} onClick={() => onSelect(i)}><span className={`severity-bar ${i.priority.toLowerCase()}`} /><span className={`compact-icon ${i.priority.toLowerCase()}`}><Icon name={types.find((t) => t.name === i.type)?.icon || "alert"} /></span><span className="compact-main"><span><strong>{i.id}</strong><PriorityBadge priority={i.priority} /></span><b>{i.type}</b><small><Icon name="location" size={13} />{i.location}</small></span><span className="compact-meta"><strong>{i.peopleAffected} {i.peopleAffected === 1 ? "person" : "people"}</strong><small>{formatTime(i.reportedAt)}</small><StatusBadge status={i.status} /></span><Icon name="arrow" /></button>)}</div>
      </section>
      <section className="dashboard-panel operations-panel"><div className="panel-header"><div><h2>Team Availability</h2><p>Current response capacity</p></div></div><div className="donut-wrap"><div className="donut"><span><strong>8</strong><small>AVAILABLE</small></span></div><div className="donut-legend"><span><i className="available" />Available <strong>8</strong></span><span><i className="deployed" />Deployed <strong>4</strong></span><span><i className="resting" />Resting <strong>2</strong></span></div></div><button className="manage-teams" onClick={() => setView("teams")}>Manage response teams <Icon name="arrow" /></button></section>
    </div>
    <div className="command-message"><span><Icon name="radio" /></span><div><strong>Network resilience active</strong><p>Citizen reports submitted offline will appear here automatically when their connection is restored.</p></div><small>OFFLINE-FIRST SYSTEM</small></div>
  </div>;
}

function IncidentManagement({ incidents, onSelect }: { incidents: Incident[]; onSelect: (i: Incident) => void }) {
  const [filter, setFilter] = useState("ALL");
  const list = [...incidents].filter((i) => i.syncStatus === "SYNCED" && (filter === "ALL" || i.priority === filter || i.status === filter)).sort((a, b) => ["CRITICAL", "HIGH", "MEDIUM"].indexOf(a.priority) - ["CRITICAL", "HIGH", "MEDIUM"].indexOf(b.priority));
  return <div className="rescue-page"><div className="rescue-page-title"><div><span className="eyebrow">RESPONSE QUEUE</span><h1>Incident Management</h1><p>Prioritized by severity and time reported.</p></div><button className="export-button"><Icon name="clipboard" />Export report</button></div>
    <div className="incident-toolbar"><div>{["ALL", "CRITICAL", "HIGH", "NEW", "ASSIGNED"].map((f) => <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f}>{f === "ALL" ? `All incidents (${incidents.filter((i) => i.syncStatus === "SYNCED").length})` : f}</button>)}</div><span><Icon name="search" /><input placeholder="Search incidents…" /></span></div>
    <div className="incident-table"><div className="table-head"><span>PRIORITY / INCIDENT</span><span>LOCATION</span><span>PEOPLE</span><span>REPORTED</span><span>STATUS</span><span>ACTION</span></div>{list.map((i) => <div className="table-row" key={i.id}><span className="table-incident"><i className={i.priority.toLowerCase()} /><span><small>{i.id}</small><strong>{i.type}</strong><PriorityBadge priority={i.priority} /></span></span><span><Icon name="location" />{i.location}</span><span><Icon name="people" />{i.peopleAffected}</span><span>{formatTime(i.reportedAt)}</span><span><StatusBadge status={i.status} /></span><span><button onClick={() => onSelect(i)}>VIEW</button>{i.status === "NEW" && <button className="assign-small" onClick={() => onSelect(i)}>ASSIGN</button>}</span></div>)}</div>
  </div>;
}

function TeamPage() {
  return <div className="rescue-page"><div className="rescue-page-title"><div><span className="eyebrow">FIELD RESOURCES</span><h1>Rescue Teams</h1><p>Deployment status and response capability.</p></div></div><div className="team-grid">{teams.map((team, i) => <div className="team-card" key={team.name}><span className={`team-vehicle ${team.available ? "" : "busy"}`}><Icon name={i === 1 ? "medical" : "rescue"} /></span><div><h2>{team.name}</h2><p>{team.detail}</p></div><span className={`availability ${team.available ? "" : "busy"}`}><i />{team.available ? "AVAILABLE" : "DEPLOYED"}</span><div className="team-footer"><span><Icon name="radio" />Radio linked</span><button>View team</button></div></div>)}</div></div>;
}

function ShelterPage() {
  return <div className="rescue-page"><div className="rescue-page-title"><div><span className="eyebrow">SAFE LOCATIONS</span><h1>Emergency Shelters</h1><p>Capacity and supply overview for active shelters.</p></div></div><div className="team-grid">{shelters.map((s) => <div className="team-card shelter-card" key={s.name}><span className="team-vehicle"><Icon name="home" /></span><div><h2>{s.name}</h2><p>{s.area}</p></div><span className="availability"><i />OPEN</span><div className="capacity"><span><small>OCCUPANCY</small><strong>{s.capacity}</strong></span><div><i style={{ width: s.name.includes("Central") ? "65%" : "48%" }} /></div></div></div>)}</div></div>;
}

function ReportsPage({ incidents }: { incidents: Incident[] }) {
  return <div className="rescue-page"><div className="rescue-page-title"><div><span className="eyebrow">OPERATIONAL INTELLIGENCE</span><h1>Situation Reports</h1><p>Daily summaries and response performance.</p></div><button className="export-button"><Icon name="clipboard" />Generate new report</button></div><div className="report-summary"><div><span><Icon name="check" /></span><div><small>RESOLUTION RATE</small><strong>89%</strong><p>+4.2% from yesterday</p></div></div><div><span><Icon name="time" /></span><div><small>AVG. RESPONSE TIME</small><strong>8m 42s</strong><p>1m faster than target</p></div></div><div><span><Icon name="people" /></span><div><small>TOTAL PEOPLE ASSISTED</small><strong>{incidents.reduce((s, i) => s + i.peopleAffected, 219)}</strong><p>Across 64 resolutions</p></div></div></div><div className="dashboard-panel report-docs"><div className="panel-header"><div><h2>Recent reports</h2><p>Generated command summaries</p></div></div>{["Daily Situation Report · East District", "Flood Response Operations Summary", "Medical Response Allocation"].map((r, i) => <button key={r}><span><Icon name="clipboard" /></span><div><strong>{r}</strong><small>{i + 1} day{i ? "s" : ""} ago · PDF</small></div><Icon name="arrow" /></button>)}</div></div>;
}

function AssignmentModal({ incident, onClose, onAssign }: { incident: Incident; onClose: () => void; onAssign: (team: string) => void }) {
  const [choice, setChoice] = useState("Rescue Team Alpha");
  return <div className="modal-backdrop"><div className="assignment-modal"><div className="modal-header"><span><Icon name="team" /></span><div><span className="eyebrow">DISPATCH RESPONSE</span><h2>Assign a Rescue Team</h2><p>{incident.id} · {incident.type}</p></div><button onClick={onClose}>×</button></div><div className="modal-incident"><PriorityBadge priority={incident.priority} /><strong>{incident.location}</strong><span>{incident.peopleAffected} people affected</span></div><div className="team-options">{teams.map((team) => <button disabled={!team.available} className={choice === team.name ? "selected" : ""} key={team.name} onClick={() => setChoice(team.name)}><span><Icon name={team.name.includes("Medical") ? "medical" : "rescue"} /></span><div><strong>{team.name}</strong><small>{team.detail}</small></div><i>{team.available ? "AVAILABLE" : "BUSY"}</i>{choice === team.name && <b><Icon name="check" size={13} /></b>}</button>)}</div><div className="modal-actions"><button onClick={onClose}>Cancel</button><button onClick={() => onAssign(choice)}><Icon name="radio" />ASSIGN {choice.replace("Rescue ", "").toUpperCase()}</button></div></div></div>;
}

function ResolutionModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  return <div className="modal-backdrop"><div className="resolution-modal"><span className="resolution-check"><Icon name="check" size={34} /></span><span className="eyebrow">RESPONSE COMPLETE</span><h2>Incident Resolved</h2><strong>{incident.id}</strong><p>The incident has been closed and the citizen report has been updated.</p><div><span><Icon name="check" />Rescue team assigned</span><span><Icon name="check" />Incident handled</span><span><Icon name="check" />Report resolved</span></div><StatusBadge status="RESOLVED" /><button className="primary-dark" onClick={onClose}>RETURN TO INCIDENTS</button></div></div>;
}

function RescueApp({ incidents, setIncidents, online, onExit }: { incidents: Incident[]; setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>; online: boolean; onExit: () => void }) {
  const [view, setView] = useState<RescueView>("overview");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [resolved, setResolved] = useState<Incident | null>(null);
  const [menu, setMenu] = useState(false);

  const updateStatus = (status: Status) => {
    if (!selected) return;
    const updated = { ...selected, status, ...(status === "RESOLVED" ? { resolvedAt: new Date().toISOString() } : {}) };
    setIncidents((old) => old.map((i) => i.id === selected.id ? updated : i));
    setSelected(updated);
    if (status === "RESOLVED") setResolved(updated);
  };
  const assign = (team: string) => {
    if (!selected) return;
    const updated: Incident = { ...selected, assignedTeam: team, status: "ASSIGNED" };
    setIncidents((old) => old.map((i) => i.id === selected.id ? updated : i));
    setSelected(updated); setAssigning(false);
  };
  const select = (i: Incident) => setSelected(i);
  return <div className="rescue-app"><RescueSidebar view={view} setView={(v) => { setView(v); setSelected(null); setMenu(false); }} onExit={onExit} open={menu} /><div className="rescue-workspace"><RescueTopbar onMenu={() => setMenu((v) => !v)} online={online} /><main>
    {selected ? <IncidentDetail incident={selected} onBack={() => setSelected(null)} onAssign={() => setAssigning(true)} onStatus={updateStatus} /> : <>
      {view === "overview" && <Overview incidents={incidents} onSelect={select} setView={setView} />}
      {view === "incidents" && <IncidentManagement incidents={incidents} onSelect={select} />}
      {view === "map" && <MapView incidents={incidents} rescue onSelect={select} />}
      {view === "teams" && <TeamPage />}
      {view === "shelters" && <ShelterPage />}
      {view === "reports" && <ReportsPage incidents={incidents} />}
    </>}
  </main></div>{assigning && selected && <AssignmentModal incident={selected} onClose={() => setAssigning(false)} onAssign={assign} />}{resolved && <ResolutionModal incident={resolved} onClose={() => { setResolved(null); setSelected(null); setView("incidents"); }} />}</div>;
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(loadIncidents);
  const [browserOnline, setBrowserOnline] = useState(navigator.onLine);
  const [forcedOffline, setForcedOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState("");
  const syncTimer = useRef<number | null>(null);
  const online = browserOnline && !forcedOffline;
  const pending = useMemo(() => incidents.filter((i) => i.syncStatus === "PENDING").length, [incidents]);

  useEffect(() => { localStorage.setItem("disastermesh-incidents", JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => {
    const goOnline = () => setBrowserOnline(true);
    const goOffline = () => setBrowserOnline(false);
    window.addEventListener("online", goOnline); window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);
  const syncNow = () => {
    if (!online || pending === 0 || syncing) return;
    setSyncing(true); setToast("Connection restored · Syncing emergency reports…");
    syncTimer.current = window.setTimeout(() => {
      setIncidents((old) => old.map((i) => i.syncStatus === "PENDING" ? { ...i, syncStatus: "SYNCED" } : i));
      setSyncing(false); setToast("Emergency synced successfully");
      window.setTimeout(() => setToast(""), 4500);
    }, 1800);
  };
  useEffect(() => { if (online && pending > 0) syncNow(); }, [online]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (syncTimer.current) clearTimeout(syncTimer.current); }, []);

  if (!role) return <Login onSelect={setRole} />;
  return <>
    {role === "citizen" ? <CitizenApp incidents={incidents} setIncidents={setIncidents} online={online} setForcedOffline={setForcedOffline} syncing={syncing} syncNow={syncNow} onExit={() => setRole(null)} /> : <RescueApp incidents={incidents} setIncidents={setIncidents} online={online} onExit={() => setRole(null)} />}
    {toast && <div className={`global-toast ${syncing ? "syncing" : ""}`}><span>{syncing ? <span className="spinner" /> : <Icon name="check" />}</span><div><strong>{syncing ? "Connection Restored" : "Synced Successfully"}</strong><small>{toast}</small></div></div>}
  </>;
}

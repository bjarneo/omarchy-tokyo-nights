export const SECURITY = Object.freeze({ x: 0, z: 21, width: 18, depth: 14, doorWidth: 3.4, doorZ: 14, source: 'https://omarchy.org/teams/' });

export const SECURITY_CREW = Object.freeze([
  { id: 'adrian-rangel', name: 'Adrian Rangel', country: 'Mexico', x: -4.5, z: 18.9, gesture: 'glasses',
    appearance: { skin: '#d9a68b', shade: '#ad755d', hair: '#41372f', top: '#344e79', trim: '#587baa', glasses: true, beard: true, style: 'tee' },
    greeting: 'Welcome to the security room. The pentest bench has a small practice network. Pick a scope, inspect the evidence, and verify the fix.', topics: [
      ['Meet Adrian', 'This cameo represents Adrian Rangel from Mexico, listed on the Omarchy security team. The club conversations are fictional.'],
      ['Start a pentest', 'Start at the red-team bench. Define the target scope, check access controls, and retest the repair. Each choice updates the lab screen.'],
      ['Red and blue teams', 'Red teams test defenses. Blue teams detect and respond to threats. The wall diagrams show how their work connects.'],
    ] },
  { id: 'mehmet-ince', name: 'Mehmet İnce', country: 'UK/Türkiye', x: -4.5, z: 23.5, gesture: 'explain',
    appearance: { skin: '#d4a07a', shade: '#a97250', hair: '#382d29', top: '#9b4653', trim: '#492e3b', glasses: true, beard: true, style: 'plaid', beanie: true },
    greeting: 'The zero-day bench follows a fictional parser bug from discovery to repair. Reproduce it, reduce the test case, and check the patch.', topics: [
      ['Meet Mehmet', 'This cameo represents Mehmet İnce from UK/Türkiye, listed on the Omarchy security team. The club conversations are fictional.'],
      ['What is a zero-day?', 'A zero-day vulnerability is a flaw that defenders cannot yet address with an available fix. Discovery, impact, and a reliable repair matter.'],
      ['Research the bug', 'The local exercise starts with a parser crash. Find the smallest input that reproduces it, inspect the boundary, and verify the repair.'],
    ] },
  { id: 'erik-melton', name: 'Erik Melton', country: 'Norway', x: 4.5, z: 18.9, gesture: 'disk',
    appearance: { skin: '#d6ac92', shade: '#ad806c', hair: '#342c28', top: '#645a4c', trim: '#b3a48a', beard: true, style: 'coat', hat: 'fox-fur' },
    greeting: 'The blue-team bench has an incident to investigate. Correlate the alerts, contain the lab virus, and verify recovery.', topics: [
      ['Meet Erik', 'This cameo represents Erik Melton from Norway, listed on the Omarchy security team. The club conversations are fictional.'],
      ['Respond to an incident', 'Keep a timeline and preserve the evidence. Contain affected systems, find the cause, and verify recovery before you close the incident.'],
      ['That roaming virus', 'BYTE is the room’s simulated computer virus. Meet it in the central aisle. Quarantine it there or complete the blue-team containment step.'],
    ] },
  { id: 'sayem-chowdhury', name: 'Sayem Chowdhury', country: 'Bangladesh', x: 4.5, z: 23.5, gesture: 'hands',
    appearance: { skin: '#b58b62', shade: '#896445', hair: '#222a2d', top: '#7faac2', trim: '#c0d6de', glasses: true, style: 'stripes' },
    greeting: 'The forensics bench keeps a disk image and an event timeline. Compare the evidence, find the first change, and record the result.', topics: [
      ['Meet Sayem', 'This cameo represents Sayem Chowdhury from Bangladesh, listed on the Omarchy security team. The club conversations are fictional.'],
      ['Preserve the evidence', 'Analyze a copy and record its hash. Keep the original evidence intact. A timeline connects events that separate logs cannot explain.'],
      ['Read the network', 'The blue wall shows a monitored network. Compare an alert with process and network records before you decide what happened.'],
    ] },
  { id: 'sebastian-stange', name: 'Sebastian Stange', country: 'Germany', x: 1.8, z: 25, gesture: 'wave',
    appearance: { skin: '#d4a088', shade: '#a27360', hair: '#45302b', top: '#628c82', trim: '#9fb4a0', glasses: true, style: 'hoodie', spikes: true },
    greeting: 'The reverse-engineering bench has a tiny fictional program. Trace its branches, find the check, and compare the corrected version.', topics: [
      ['Meet Sebastian', 'This cameo represents Sebastian Stange from Germany, listed on the Omarchy security team. The club conversations are fictional.'],
      ['Trace the program', 'A disassembler shows instructions. A debugger shows how a program runs. Follow the data and compare each branch with its intended behavior.'],
      ['Report a vulnerability', 'A useful report describes the affected version, reproduction steps, impact, and evidence. Omarchy’s official security page explains its report process.'],
    ] },
].map((npc) => Object.freeze({ ...npc, yaw: Math.PI, role: 'Omarchy security', team: 'security', source: SECURITY.source, imageSource: `https://omarchy.org/assets/images/team/${npc.id}.webp` })));

const step = (text, choices, correct, result, evidence, effect) => ({ text, choices, correct, result, evidence, effect });

export const SECURITY_LABS = Object.freeze({
  pentest: { title: 'Pentest bench', accent: '#f7768e', x: -6.7, z: 17, yaw: Math.PI / 2,
    intro: 'A practice network contains a web app and an admin service. Define the scope, inspect access, and verify the repair.',
    steps: [
      step('The lab brief names one web app. What belongs in the test scope?', ['The named lab app', 'Every connected host'], 0, 'Scope set. The lab app is the agreed target.', ['SCOPE: lab-app', 'ASSETS: web + admin']),
      step('A guest session can open the admin page. What does this evidence show?', ['A slow network', 'A missing access check'], 1, 'The guest crosses an authorization boundary. Record the request and the affected role.', ['GUEST -> ADMIN: ALLOWED', 'FINDING: access control']),
      step('The app adds a role check. How do you verify the fix?', ['Retest guest and admin', 'Close after a reboot'], 0, 'Guest access fails. Admin access succeeds. The repair passes both checks.', ['GUEST: denied', 'ADMIN: allowed', 'RETEST: passed']),
    ], complete: 'Pentest complete. The report contains scope, evidence, impact, and a verified access-control repair.' },
  'zero-day': { title: 'Zero-day research', accent: '#e0af68', x: -6.7, z: 22, yaw: Math.PI / 2,
    intro: 'A fictional parser crashes on a malformed record. Reproduce the fault, locate the boundary error, and verify the patch.',
    steps: [
      step('A long sample crashes the parser. What makes the report reproducible?', ['Increase the sample size', 'Reduce the failing input'], 1, 'A minimal record still triggers the same fault. The reproduction is stable.', ['SAMPLE: 4096 -> 17 bytes', 'CRASH: reproducible']),
      step('The declared length exceeds the input buffer. Which check addresses the cause?', ['Validate the length', 'Hide the crash message'], 0, 'The parser rejects lengths beyond the available input. The boundary check runs before the read.', ['DECLARED: 64', 'AVAILABLE: 17', 'BOUNDARY: checked']),
      step('The malformed record no longer crashes. What comes next?', ['Publish only a screenshot', 'Test and prepare a report'], 1, 'Valid and malformed records pass regression checks. The report includes the minimal case and patch evidence.', ['VALID INPUT: accepted', 'BAD LENGTH: rejected', 'REGRESSION: passed']),
    ], complete: 'Research complete. The local case includes a reproducible flaw, a boundary check, and a verified patch.' },
  'blue-team': { title: 'Blue-team response', accent: '#7dcfff', x: 6.7, z: 17, yaw: -Math.PI / 2,
    intro: 'The lab sensor flags BYTE on a workstation. Investigate the alert, quarantine the simulated virus, and verify recovery.',
    steps: [
      step('A network alert names a workstation. Which evidence helps confirm the incident?', ['Process and network logs', 'The desktop wallpaper'], 0, 'The process record and network event share a timestamp. The lab alert has supporting evidence.', ['09:41 PROCESS: BYTE', '09:41 NETWORK: beacon']),
      step('The lab confirms BYTE activity. Choose a containment action.', ['Clear the alert list', 'Quarantine BYTE'], 1, 'BYTE enters the containment field in the center of the room. The evidence remains available.', ['HOST: isolated', 'BYTE: quarantined', 'EVIDENCE: retained'], 'quarantine'),
      step('The cause is removed. What confirms recovery?', ['Restore and monitor', 'Disable every sensor'], 0, 'The restored lab host passes its checks. Monitoring stays active to detect a recurrence.', ['HOST: restored', 'SENSOR: active', 'RECOVERY: verified']),
    ], complete: 'Incident complete. The timeline records detection, containment, and verified recovery. BYTE stays quarantined until you release it.' },
  forensics: { title: 'Forensics bench', accent: '#9ece6a', x: 6.7, z: 22, yaw: -Math.PI / 2,
    intro: 'Inspect a fictional disk image and an event timeline. Preserve the evidence, identify the first change, and document the result.',
    steps: [
      step('The lab supplies a disk image. How do you begin?', ['Edit the original', 'Hash and copy the image'], 1, 'The analysis copy matches the recorded hash. The original remains intact.', ['IMAGE: read-only', 'COPY HASH: matches']),
      step('A new startup entry precedes the first beacon. Which event deserves investigation?', ['The startup change', 'The later screen lock'], 0, 'The startup change precedes execution and network activity. The timeline connects the three events.', ['09:40 STARTUP: changed', '09:41 PROCESS: BYTE', '09:41 NETWORK: beacon']),
      step('The timeline is complete. What belongs in the handoff?', ['An unsupported conclusion', 'Evidence and timestamps'], 1, 'The handoff includes hashes, timestamps, and the records that support each conclusion.', ['HASHES: recorded', 'TIMELINE: attached', 'REPORT: complete']),
    ], complete: 'Forensics complete. The evidence remains intact and the report links each conclusion to a recorded event.' },
  reverse: { title: 'Reverse engineering', accent: '#bb9af7', x: 0, z: 26.3, yaw: Math.PI,
    intro: 'A small fictional program accepts a record and chooses a branch. Trace its control flow and compare a corrected version.',
    steps: [
      step('The program branches after it reads a length. What should you trace first?', ['The input and comparison', 'The window title'], 0, 'The trace connects the input length to the branch condition.', ['READ length', 'COMPARE length, limit', 'BRANCH accept / reject']),
      step('The original accepts a value equal to the buffer size. What reveals the boundary behavior?', ['Change the font', 'Compare boundary inputs'], 1, 'The three boundary cases expose the off-by-one error.', ['LIMIT - 1: accepted', 'LIMIT: wrong branch', 'LIMIT + 1: rejected']),
      step('The corrected branch rejects the invalid boundary. How do you finish?', ['Compare traces and tests', 'Assume every path works'], 0, 'The corrected trace and boundary tests agree. The valid path still works.', ['BRANCH: corrected', 'BOUNDARIES: passed', 'VALID PATH: passed']),
    ], complete: 'Analysis complete. The control-flow trace explains the defect and the boundary tests verify the corrected behavior.' },
});

export function createLabState() { return { step: 0, feedback: '', evidence: [], complete: false }; }

export function chooseLab(lab, state, choice) {
  const current = lab.steps[state.step];
  if (state.complete || !current || !Number.isInteger(choice) || !current.choices[choice]) return null;
  if (choice !== current.correct) { state.feedback = 'That choice misses the evidence. Review the case and try the other action.'; return null; }
  state.feedback = current.result; state.evidence = current.evidence; state.step++;
  state.complete = state.step === lab.steps.length;
  return current.effect || null;
}

export function labPanel(station, device) {
  const lab = SECURITY_LABS[station.lab]; const state = device.lab;
  const current = lab.steps[state.step];
  const options = state.complete ? [{ id: 'security:reset', label: 'RESTART EXERCISE' }] : current.choices.map((label, i) => ({ id: `security:choice:${i}`, label }));
  return { title: lab.title.toUpperCase(), layout: 'security', subtitle: `LOCAL SIMULATION · ${state.complete ? 'COMPLETE' : `STEP ${state.step + 1} OF ${lab.steps.length}`}`,
    text: `${state.feedback ? `${state.feedback} ` : ''}${state.complete ? lab.complete : current.text}`,
    options: [...options, { id: 'back', label: 'BACK TO THE ROOM' }] };
}

export function createVirus() {
  return { id: 'byte-virus', name: 'BYTE · lab virus', software: 'virus', detail: 'Meet BYTE, the simulated computer virus. Quarantine it or let it patrol the security room.', x: -2, z: 18, height: 1.1, clock: 0, yaw: Math.PI / 2, quarantined: false };
}

export function updateVirus(virus, dt, held = false, canStandAt = null) {
  if (held || virus.quarantined) return;
  virus.clock += Math.max(0, Math.min(.25, dt));
  const points = [[-2, 18], [2, 18], [2, 22], [-2, 22]];
  const phase = virus.clock * .22; const index = Math.floor(phase) % points.length;
  const from = points[index]; const to = points[(index + 1) % points.length]; const amount = phase % 1;
  const x = from[0] + (to[0] - from[0]) * amount; const z = from[1] + (to[1] - from[1]) * amount;
  if (typeof canStandAt === 'function' && !canStandAt(x, z)) return;
  virus.x = x; virus.z = z;
  virus.yaw = Math.atan2(to[0] - from[0], to[1] - from[1]);
}

export function quarantineVirus(virus) { virus.quarantined = true; virus.x = 0; virus.z = 21; }

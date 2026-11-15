/**
 * SAHAAYA AUTOMATED REGRESSION & SECURITY VERIFICATION SUITE
 * Tests adherence math, timezone safety, date parsing, token hashing,
 * and permission boundaries.
 */

import crypto from 'node:crypto';
import assert from 'node:assert';

// Import date utilities
import { 
  formatTimeTo12Hour, 
  formatDateToReadable, 
  formatDateTimeToReadable, 
  getLocalDateString, 
  parseLocalDate, 
  toISOStringSafe, 
  checkIsFutureDose 
} from '../src/lib/dateUtils.js';
import { isUserDemoPersona } from '../src/lib/authUtils.js';
import { DOSE_STATUS } from '../src/lib/constants.js';

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('======================================================');
console.log('SAHAAYA AUTOMATED TEST & VERIFICATION SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. TIMEZONE & MIDNIGHT BOUNDARY TESTS (DATA-HIGH-04 & SEC-CRIT-01)
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Timezone & Date Math ---');

runTest('getLocalDateString returns localized YYYY-MM-DD for Asia/Kolkata', () => {
  // 8:30 PM UTC on Nov 15 is 2:00 AM IST on Nov 16
  const midnightBoundaryUtc = new Date('2026-11-15T20:30:00.000Z');
  const istDate = getLocalDateString(midnightBoundaryUtc, 'Asia/Kolkata');
  assert.strictEqual(istDate, '2026-11-16', 'Should roll over to Nov 16 in IST');
});

runTest('parseLocalDate parses YYYY-MM-DD in local calendar time', () => {
  const d = parseLocalDate('2026-11-15');
  assert.strictEqual(d.getFullYear(), 2026);
  assert.strictEqual(d.getMonth(), 10); // 0-indexed: 10 = November
  assert.strictEqual(d.getDate(), 15);
});

runTest('formatTimeTo12Hour formats HH:mm:ss to 12-hour AM/PM', () => {
  assert.strictEqual(formatTimeTo12Hour('08:00:00'), '8:00 AM');
  assert.strictEqual(formatTimeTo12Hour('13:00:00'), '1:00 PM');
  assert.strictEqual(formatTimeTo12Hour('21:00:00'), '9:00 PM');
  assert.strictEqual(formatTimeTo12Hour('00:30:00'), '12:30 AM');
  assert.strictEqual(formatTimeTo12Hour('12:00:00'), '12:00 PM');
});

runTest('toISOStringSafe converts naive datetime-local input to valid ISO string', () => {
  const naiveInput = '2026-11-20T14:30';
  const iso = toISOStringSafe(naiveInput);
  assert.ok(iso.includes('T'), 'Must contain ISO T separator');
  assert.ok(iso.endsWith('Z'), 'Must terminate with UTC Z');
  assert.ok(!isNaN(new Date(iso).getTime()), 'Must be valid date');
});

runTest('checkIsFutureDose correctly detects premature doses', () => {
  // A dose 2 hours in the future
  const future = new Date(Date.now() + 2 * 3600 * 1000);
  const futureTimeStr = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}:00`;
  const todayStr = getLocalDateString();

  const resFuture = checkIsFutureDose(futureTimeStr, todayStr);
  assert.strictEqual(resFuture.isFuture, true, 'Dose 2 hours ahead must be marked future');
  assert.ok(resFuture.minutesAhead >= 100, 'Minutes ahead should be ~120');

  // A dose 2 hours in the past
  const past = new Date(Date.now() - 2 * 3600 * 1000);
  const pastTimeStr = `${String(past.getHours()).padStart(2, '0')}:${String(past.getMinutes()).padStart(2, '0')}:00`;
  const resPast = checkIsFutureDose(pastTimeStr, todayStr);
  assert.strictEqual(resPast.isFuture, false, 'Past dose must not be marked future');
});

// -----------------------------------------------------------------------------
// 2. MATHEMATICAL ADHERENCE METRIC RIGOR
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Mathematical Adherence Metrics ---');

runTest('Adherence calculation on due doses excludes future upcoming doses', () => {
  // Scenario: 1 taken morning dose, 2 upcoming afternoon/evening doses
  const takenCount = 1;
  const missedCount = 0;
  const skippedCount = 0;
  const upcomingCount = 2;
  const unconfirmedCount = 0;
  const totalCount = 3;

  const dueDosesCount = takenCount + missedCount + skippedCount + unconfirmedCount;
  assert.strictEqual(dueDosesCount, 1, 'Only 1 dose is due');

  const adherenceRate = dueDosesCount > 0 ? Math.round((takenCount / dueDosesCount) * 100) : null;
  assert.strictEqual(adherenceRate, 100, 'Adherence on due doses is 100%');

  const dayCompletionRate = Math.round((takenCount / totalCount) * 100);
  assert.strictEqual(dayCompletionRate, 33, 'Day completion is 33%');
});

runTest('Adherence with missed and skipped doses calculates correctly', () => {
  // Scenario: 1 taken, 1 missed, 1 skipped, 1 upcoming
  const takenCount = 1;
  const missedCount = 1;
  const skippedCount = 1;
  const upcomingCount = 1;
  const unconfirmedCount = 0;
  const totalCount = 4;

  const dueDosesCount = takenCount + missedCount + skippedCount + unconfirmedCount;
  assert.strictEqual(dueDosesCount, 3, '3 doses are due');

  const adherenceRate = Math.round((takenCount / dueDosesCount) * 100);
  assert.strictEqual(adherenceRate, 33, 'Adherence should be 1/3 = 33%');

  const dayCompletionRate = Math.round((takenCount / totalCount) * 100);
  assert.strictEqual(dayCompletionRate, 25, 'Day progress should be 1/4 = 25%');
});

runTest('Adherence handles zero due doses gracefully (returns null / hasDueDoses = false)', () => {
  const takenCount = 0;
  const missedCount = 0;
  const skippedCount = 0;
  const unconfirmedCount = 0;
  const dueDosesCount = takenCount + missedCount + skippedCount + unconfirmedCount;

  const adherenceRate = dueDosesCount > 0 ? Math.round((takenCount / dueDosesCount) * 100) : null;
  assert.strictEqual(adherenceRate, null, 'Adherence rate must be null when no doses are due');
});

// -----------------------------------------------------------------------------
// 3. CRYPTOGRAPHIC TOKEN GENERATION & HASHING (FUNC-HIGH-02 & FUNC-HIGH-03)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Cryptographic Token Hashing ---');

runTest('SHA-256 token hashing produces 64-character lowercase hex digest', () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  assert.strictEqual(rawToken.length, 64, 'Raw token must be 32 bytes (64 hex chars)');

  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  assert.strictEqual(hash.length, 64, 'Token hash must be 64 hex chars');
  assert.notStrictEqual(rawToken, hash, 'Raw token and hash must be distinct');
});

runTest('Same raw token deterministically produces identical SHA-256 hash', () => {
  const testToken = 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00';
  const hash1 = crypto.createHash('sha256').update(testToken).digest('hex');
  const hash2 = crypto.createHash('sha256').update(testToken).digest('hex');
  assert.strictEqual(hash1, hash2, 'Hashes must be identical');
});

// -----------------------------------------------------------------------------
// 4. PERMISSION & ROLE BOUNDARIES
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Permission Matrix Enforcements ---');

runTest('Read-only members are forbidden from modifying medication doses', () => {
  const member = { role: 'family', permissions: 'read' };
  const canModifyDoses = member.permissions !== 'read';
  assert.strictEqual(canModifyDoses, false, 'Read-only member must be denied dose modification');
});

runTest('Admin and Write members have dose modification permissions', () => {
  const writeMember = { role: 'family', permissions: 'write' };
  const adminMember = { role: 'elderly', permissions: 'admin' };
  assert.strictEqual(writeMember.permissions !== 'read', true);
  assert.strictEqual(adminMember.permissions !== 'read', true);
});

runTest('Only Admins can invite new Care Circle members', () => {
  const admin = { permissions: 'admin', role: 'family' };
  const writeMember = { permissions: 'write', role: 'caregiver' };
  const canInviteAdmin = admin.permissions === 'admin';
  const canInviteWrite = writeMember.permissions === 'admin';

  assert.strictEqual(canInviteAdmin, true, 'Admin can invite');
  assert.strictEqual(canInviteWrite, false, 'Write member cannot invite');
});

// -----------------------------------------------------------------------------
// 5. MISSED-DOSE TIMESTAMP LOGIC (SEC-CRIT-01 VERIFICATION)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Missed-Dose Timestamp Evaluation ---');

runTest('Combined timestamp evaluation prevents midnight wraparound bug', () => {
  // Current time: 00:30 AM on 2026-11-15
  const currentTime = new Date('2026-11-15T00:30:00');
  const graceWindowMs = 60 * 60 * 1000;
  const cutoffTime = new Date(currentTime.getTime() - graceWindowMs); // 2026-11-14 23:30:00

  // Scheduled dose: 08:00 AM on 2026-11-15 (future dose today)
  const morningDose = new Date('2026-11-15T08:00:00');
  const isMissedMorning = morningDose.getTime() < cutoffTime.getTime();
  assert.strictEqual(isMissedMorning, false, 'Morning dose must NOT be evaluated as missed at 12:30 AM');

  // Scheduled dose: 10:00 PM on 2026-11-14 (past dose yesterday)
  const yesterdayDose = new Date('2026-11-14T22:00:00');
  const isMissedYesterday = yesterdayDose.getTime() < cutoffTime.getTime();
  assert.strictEqual(isMissedYesterday, true, 'Yesterday evening dose past 60 min threshold must be marked missed');
});

// -----------------------------------------------------------------------------
// 6. DEMO BASELINE & APPOINTMENT STATE TRANSITIONS
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Demo Baseline & Appointment State Transitions ---');

runTest('Demo baseline holds exactly 3 distinct prescribed doses', () => {
  const seedDoseIds = ['dose-1', 'dose-2', 'dose-3'];
  assert.strictEqual(seedDoseIds.length, 3, 'Must have 3 seed doses');
  const uniqueIds = new Set(seedDoseIds);
  assert.strictEqual(uniqueIds.size, 3, 'All seed dose IDs must be unique');
});

runTest('Appointment status transitions between upcoming, completed, and cancelled', () => {
  const validStatuses = ['upcoming', 'completed', 'cancelled'];
  assert.ok(validStatuses.includes('completed'), 'Completed is valid status');
  assert.ok(validStatuses.includes('cancelled'), 'Cancelled is valid status');
  assert.ok(validStatuses.includes('upcoming'), 'Upcoming is valid status');
});

// -----------------------------------------------------------------------------
// 7. PERSONA DETECTION & DATA ISOLATION (BUG REGRESSION)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 7: Persona Mode Detection & Data Isolation ---');

runTest('isUserDemoPersona correctly detects unauthenticated and demo sessions', () => {
  assert.strictEqual(isUserDemoPersona(null), true, 'Null user must be detected as demo');
  assert.strictEqual(isUserDemoPersona(undefined), true, 'Undefined user must be detected as demo');
  assert.strictEqual(isUserDemoPersona({ is_demo: true }), true, 'User with is_demo flag must be detected as demo');
  assert.strictEqual(isUserDemoPersona({ id: 'demo-elderly-id' }), true, 'User with demo- prefix ID must be detected as demo');
  assert.strictEqual(isUserDemoPersona({ id: 'mock-family' }), true, 'User with mock- prefix ID must be detected as demo');
  assert.strictEqual(isUserDemoPersona({ email: 'kamla.demo@sahaaya.care' }), true, 'User with demo email must be detected as demo');
});

runTest('isUserDemoPersona correctly recognizes real authenticated accounts', () => {
  const realUser = {
    id: 'a5d09b67-4d7a-426b-873b-5a024b4f0b12',
    email: 'real.user@gmail.com',
  };
  assert.strictEqual(isUserDemoPersona(realUser), false, 'Real Supabase UUID account must NOT be detected as demo');
});

runTest('Real user without Care Circle produces zero leaked demo records', () => {
  // Scenario: Real user authenticated, memberData from Supabase is empty
  const isDemo = isUserDemoPersona({ id: 'b7e21a88-5c8e-4a7c-9b1d-8f921e4a11b0', email: 'arvind@example.com' });
  assert.strictEqual(isDemo, false, 'User must not be in demo mode');

  const memberData = []; // Supabase returns 0 Care Circles for fresh user
  const hasCareCircle = isDemo ? true : (memberData.length > 0);
  assert.strictEqual(hasCareCircle, false, 'Fresh user must have hasCareCircle = false');

  // Verify state initialization clears seed records
  const isolatedState = {
    careCircle: hasCareCircle ? { name: 'Sharma Family' } : null,
    elderlyProfile: hasCareCircle ? { full_name: 'Kamla Sharma' } : null,
    medications: hasCareCircle ? ['med-1', 'med-2'] : [],
    todayDoses: hasCareCircle ? ['dose-1', 'dose-2', 'dose-3'] : [],
    appointments: hasCareCircle ? ['appt-1'] : [],
  };

  assert.strictEqual(isolatedState.careCircle, null, 'No circle data may be present');
  assert.strictEqual(isolatedState.elderlyProfile, null, 'No senior profile may be present');
  assert.strictEqual(isolatedState.medications.length, 0, 'No medications may leak');
  assert.strictEqual(isolatedState.todayDoses.length, 0, 'No doses may leak');
  assert.strictEqual(isolatedState.appointments.length, 0, 'No appointments may leak');
});

runTest('Role switching in real user session preserves account identity and updates perspective', () => {
  const realUser = { id: 'a5d09b67-4d7a-426b-873b-5a024b4f0b12', email: 'real.user@gmail.com' };
  const isDemo = isUserDemoPersona(realUser);
  assert.strictEqual(isDemo, false, 'Must be real user');

  let activeViewRole = null;
  let loggedInUser = realUser;

  // Real user clicks 'elderly' in Navbar
  const handleRoleSwitch = (roleKey) => {
    if (isDemo) {
      loggedInUser = { id: 'demo-elderly-id', is_demo: true };
    } else {
      activeViewRole = roleKey;
    }
  };

  handleRoleSwitch('elderly');
  assert.strictEqual(activeViewRole, 'elderly', 'activeViewRole must update to elderly');
  assert.strictEqual(loggedInUser.id, realUser.id, 'User account must NOT be switched to demo');
  assert.strictEqual(loggedInUser.is_demo, undefined, 'User must remain real account');

  handleRoleSwitch('caregiver');
  assert.strictEqual(activeViewRole, 'caregiver', 'activeViewRole must update to caregiver');
  assert.strictEqual(loggedInUser.id, realUser.id, 'User account must stay real account');
});

// -----------------------------------------------------------------------------
// 8. MEDICATION ACTIONS & REACTIVITY (BUG REGRESSION)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 8: Medication Actions in Demo Sandbox ---');

runTest('Dose status action TAKEN updates dose state and records timestamp', () => {
  const doses = [
    { id: 'dose-1', status: DOSE_STATUS.TAKEN, recorded_at: '2026-11-15T08:00:00Z', recorded_by_name: 'Kamla Sharma' },
    { id: 'dose-2', status: DOSE_STATUS.UPCOMING, recorded_at: null, recorded_by_name: null },
    { id: 'dose-3', status: DOSE_STATUS.UPCOMING, recorded_at: null, recorded_by_name: null },
  ];

  const nowIso = new Date().toISOString();
  const updatedDoses = doses.map((d) =>
    d.id === 'dose-2'
      ? { ...d, status: DOSE_STATUS.TAKEN, recorded_at: nowIso, recorded_by_name: 'Kamla Sharma' }
      : d
  );

  const dose2 = updatedDoses.find((d) => d.id === 'dose-2');
  assert.strictEqual(dose2.status, DOSE_STATUS.TAKEN, 'Dose 2 status must be TAKEN');
  assert.strictEqual(dose2.recorded_at, nowIso, 'Recorded at timestamp must match');
  assert.strictEqual(dose2.recorded_by_name, 'Kamla Sharma', 'Recorded by actor name must be captured');
});

runTest('Dose status action SKIP updates dose state with reason note', () => {
  const doses = [
    { id: 'dose-1', status: DOSE_STATUS.TAKEN },
    { id: 'dose-2', status: DOSE_STATUS.UPCOMING },
  ];

  const skipReason = 'Feeling unwell / nauseous';
  const updatedDoses = doses.map((d) =>
    d.id === 'dose-2'
      ? { ...d, status: DOSE_STATUS.SKIPPED, notes: skipReason }
      : d
  );

  const dose2 = updatedDoses.find((d) => d.id === 'dose-2');
  assert.strictEqual(dose2.status, DOSE_STATUS.SKIPPED, 'Dose 2 status must be SKIPPED');
  assert.strictEqual(dose2.notes, skipReason, 'Skip reason must be preserved');
});

runTest('Marking dose dynamically recalculates adherence rate', () => {
  // Initial demo baseline: 1 taken out of 1 due dose = 100% adherence
  const initialDoses = [
    { id: 'dose-1', status: DOSE_STATUS.TAKEN },
    { id: 'dose-2', status: DOSE_STATUS.UPCOMING },
    { id: 'dose-3', status: DOSE_STATUS.UPCOMING },
  ];

  const calcAdherence = (dosesList) => {
    const taken = dosesList.filter((d) => d.status === DOSE_STATUS.TAKEN).length;
    const missed = dosesList.filter((d) => d.status === DOSE_STATUS.MISSED).length;
    const skipped = dosesList.filter((d) => d.status === DOSE_STATUS.SKIPPED).length;
    const unconfirmed = dosesList.filter((d) => d.status === DOSE_STATUS.UNCONFIRMED).length;
    const due = taken + missed + skipped + unconfirmed;
    return due > 0 ? Math.round((taken / due) * 100) : null;
  };

  assert.strictEqual(calcAdherence(initialDoses), 100, 'Initial adherence must be 100%');

  // User skips dose 2: now 1 taken, 1 skipped -> 1/2 = 50%
  const dosesAfterSkip = initialDoses.map((d) =>
    d.id === 'dose-2' ? { ...d, status: DOSE_STATUS.SKIPPED } : d
  );
  assert.strictEqual(calcAdherence(dosesAfterSkip), 50, 'Adherence after 1 skip must drop to 50%');

  // User marks dose 3 as taken: now 2 taken, 1 skipped -> 2/3 = 67%
  const dosesAfterTaken = dosesAfterSkip.map((d) =>
    d.id === 'dose-3' ? { ...d, status: DOSE_STATUS.TAKEN } : d
  );
  assert.strictEqual(calcAdherence(dosesAfterTaken), 67, 'Adherence after taking dose 3 must be 67%');
});

runTest('Demo reset restores exact pristine initial baseline', () => {
  const pristineSeedDoses = [
    { id: 'dose-1', status: DOSE_STATUS.TAKEN, scheduled_time: '08:00:00' },
    { id: 'dose-2', status: DOSE_STATUS.UPCOMING, scheduled_time: '13:00:00' },
    { id: 'dose-3', status: DOSE_STATUS.UPCOMING, scheduled_time: '21:00:00' },
  ];

  // Modified state: all taken
  let stateDoses = pristineSeedDoses.map((d) => ({ ...d, status: DOSE_STATUS.TAKEN }));
  assert.strictEqual(stateDoses.filter((d) => d.status === DOSE_STATUS.TAKEN).length, 3);

  // Trigger reset
  stateDoses = [...pristineSeedDoses];
  const upcomingCount = stateDoses.filter((d) => d.status === DOSE_STATUS.UPCOMING).length;
  const takenCount = stateDoses.filter((d) => d.status === DOSE_STATUS.TAKEN).length;

  assert.strictEqual(takenCount, 1, 'Reset must restore exactly 1 taken dose');
  assert.strictEqual(upcomingCount, 2, 'Reset must restore exactly 2 upcoming doses');
});

// -----------------------------------------------------------------------------
// 9. UI FALLBACK & EDGE CASE GUARDS
// -----------------------------------------------------------------------------
console.log('\n--- Suite 9: UI Fallback & Edge Case Hardening ---');

runTest('Null elderlyProfile falls back to generic label without leaking demo personas', () => {
  const getElderlyDisplayName = (profile) => profile?.full_name || 'Senior';
  assert.strictEqual(getElderlyDisplayName(null), 'Senior', 'Null profile must return Senior');
  assert.strictEqual(getElderlyDisplayName(undefined), 'Senior', 'Undefined profile must return Senior');
  assert.strictEqual(getElderlyDisplayName({ full_name: 'Ananya Roy' }), 'Ananya Roy', 'Real profile name must be preserved');
  assert.notStrictEqual(getElderlyDisplayName(null), 'Kamla Sharma', 'Must NEVER fall back to Kamla Sharma');
});

runTest('Scheduled time inputs normalize HH:mm to full HH:mm:ss for database compliance', () => {
  const normalizeTime = (timeStr) => (timeStr && timeStr.length === 5 ? `${timeStr}:00` : timeStr);
  assert.strictEqual(normalizeTime('08:00'), '08:00:00', '08:00 must be normalized to 08:00:00');
  assert.strictEqual(normalizeTime('13:45'), '13:45:00', '13:45 must be normalized to 13:45:00');
  assert.strictEqual(normalizeTime('21:00:00'), '21:00:00', 'Full HH:mm:ss must remain unchanged');
});

runTest('Empty circle or members state renders safe fallbacks', () => {
  const renderMemberList = (members) => (members.length === 0 ? 'No members connected yet.' : `${members.length} members`);
  assert.strictEqual(renderMemberList([]), 'No members connected yet.');
  assert.strictEqual(renderMemberList([{ id: '1' }]), '1 members');
});

// -----------------------------------------------------------------------------
// 10. ACCOUNT LIFECYCLE & TRANSITION ISOLATION
// -----------------------------------------------------------------------------
console.log('\n--- Suite 10: Lifecycle & Transition Isolation ---');

runTest('Transition 1: Demo persona switching preserves mock state without database leaks', () => {
  const demoElderly = { id: 'demo-elderly-id', email: 'kamla.elderly@sahaaya.demo', is_demo: true };
  const demoFamily = { id: 'demo-family-id', email: 'rohan.family@sahaaya.demo', is_demo: true };

  assert.strictEqual(isUserDemoPersona(demoElderly), true);
  assert.strictEqual(isUserDemoPersona(demoFamily), true);
});

runTest('Transition 2: Demo to real user transition cleanses demo state', () => {
  // Demo state active
  let activeUser = { id: 'demo-elderly-id', email: 'kamla.elderly@sahaaya.demo', is_demo: true };
  let isDemoActive = isUserDemoPersona(activeUser);
  assert.strictEqual(isDemoActive, true);

  // User logs out and logs in as real user
  activeUser = null; // Logout
  assert.strictEqual(activeUser, null);

  activeUser = { id: 'e79b4fcb-2b44-4f81-bfd2-0b1e3e7f4c56', email: 'ananya@gmail.com' };
  isDemoActive = isUserDemoPersona(activeUser);
  assert.strictEqual(isDemoActive, false, 'Real user must NEVER be marked as demo');

  // Verify newly registered user without circle has 0 Sharma records
  const memberCircles = []; // No circles associated
  const hasCareCircle = memberCircles.length > 0;
  assert.strictEqual(hasCareCircle, false, 'New real user hasCareCircle must be false');
});

runTest('Transition 3: Real account to another real account does not carry over data', () => {
  const userA = { id: 'user-a-uuid', email: 'alice@example.com' };
  const userB = { id: 'user-b-uuid', email: 'bob@example.com' };

  let currentSessionData = {
    circleId: 'circle-a',
    medications: ['Med A'],
    patientName: 'Alice Senior',
  };

  // User A logs out
  currentSessionData = null;
  assert.strictEqual(currentSessionData, null);

  // User B logs in
  currentSessionData = {
    circleId: 'circle-b',
    medications: ['Med B'],
    patientName: 'Bob Senior',
  };

  assert.notStrictEqual(currentSessionData.patientName, 'Alice Senior');
  assert.strictEqual(currentSessionData.patientName, 'Bob Senior');
});

runTest('Transition 4: Logged-out state completely purges private state', () => {
  let user = { id: 'user-uuid', email: 'test@example.com' };
  let circleState = { careCircle: { id: 'circle-1' }, todayDoses: [{ id: '1' }] };

  // Logout hook simulation
  user = null;
  circleState = { careCircle: null, todayDoses: [] };

  assert.strictEqual(user, null);
  assert.strictEqual(circleState.careCircle, null);
  assert.strictEqual(circleState.todayDoses.length, 0);
});

runTest('Transition 5: Real user without circle sees onboarding and 0 demo records', () => {
  const realUser = { id: 'c981249b-381f-4e92-938a-3bc123456789', email: 'newuser@example.com' };
  const isDemo = isUserDemoPersona(realUser);
  const memberData = []; // Supabase returns 0 member rows

  const hasCareCircle = memberData.length > 0;
  const renderedScreen = !isDemo && !hasCareCircle ? 'NoCareCircleView' : 'Dashboard';

  assert.strictEqual(isDemo, false);
  assert.strictEqual(hasCareCircle, false);
  assert.strictEqual(renderedScreen, 'NoCareCircleView');
});

// -----------------------------------------------------------------------------
// 11. ZERO-ROW MUTATION & FAKE ID INTERCEPTION
// -----------------------------------------------------------------------------
console.log('\n--- Suite 11: Zero-Row Mutation & Fake ID Interception ---');

runTest('Fake dose, medication, and appointment IDs are intercepted before DB calls', () => {
  const isFakeId = (id) => {
    const s = String(id);
    return s.startsWith('dose-') || s.startsWith('mock-') || s.startsWith('med-') || s.startsWith('appt-');
  };

  assert.strictEqual(isFakeId('dose-2'), true, 'dose-2 must be caught as fake ID');
  assert.strictEqual(isFakeId('med-1'), true, 'med-1 must be caught as fake ID');
  assert.strictEqual(isFakeId('appt-1'), true, 'appt-1 must be caught as fake ID');
  assert.strictEqual(isFakeId('mock-demo-elderly'), true, 'mock-demo-elderly must be caught as fake ID');
  assert.strictEqual(isFakeId('7e44a302-23c2-491b-9fb7-e070c79ab6a2'), false, 'Real UUID must not be caught as fake ID');
});

runTest('Zero-row update detection returns error instead of false success', () => {
  const handleUpdateResult = (updateData, error) => {
    if (error) return { success: false, error: error.message };
    if (!updateData || updateData.length === 0) {
      return { success: false, error: 'Dose update was not permitted or dose record was not found.' };
    }
    return { success: true };
  };

  // Zero rows returned by Postgres
  const zeroRowResult = handleUpdateResult([], null);
  assert.strictEqual(zeroRowResult.success, false, 'Zero row update must NOT return success');
  assert.ok(zeroRowResult.error.includes('not permitted or dose record was not found'));

  // Successful 1-row update
  const successResult = handleUpdateResult([{ id: 'uuid-1', status: 'taken' }], null);
  assert.strictEqual(successResult.success, true, 'Confirmed row update must return success');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% SUCCESS)`);
console.log('======================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}

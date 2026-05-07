import assert from 'node:assert/strict';
import ipTools from '../functions/src/analytics/ip.js';
import {
    buildAnalyticsStats,
    getReliableVisitorKey,
    isUsableAnalyticsIp
} from '../src/features/admin/analyticsReliability.js';

const baseNow = Date.UTC(2026, 4, 7, 12, 0, 0);
const ts = (offsetMs) => ({ seconds: Math.floor((baseNow + offsetMs) / 1000) });

const sameIpSessions = [
    { id: 's1', startedAt: ts(-60 * 60 * 1000), type: 'anonymous', ip: '203.0.113.10', duration: 30 },
    { id: 's2', startedAt: ts(-30 * 60 * 1000), type: 'anonymous', ip: '203.0.113.10', duration: 20 }
];

let result = buildAnalyticsStats(sameIpSessions, '1j', { now: baseNow });
assert.equal(result.kpis.totalSessions, 2);
assert.equal(result.kpis.uniqueVisitors, 1);
assert.equal(result.kpis.uniqueIps, 1);

const sameUidDifferentIps = [
    { id: 's3', userId: 'anon-1', authProvider: 'anonymous', startedAt: ts(-2 * 60 * 60 * 1000), type: 'anonymous', ip: '203.0.113.10', duration: 20 },
    { id: 's4', userId: 'anon-1', authProvider: 'anonymous', startedAt: ts(-1 * 60 * 60 * 1000), type: 'anonymous', ip: '198.51.100.20', duration: 40 }
];

result = buildAnalyticsStats(sameUidDifferentIps, '1j', { now: baseNow });
assert.equal(result.kpis.totalSessions, 2);
assert.equal(result.kpis.uniqueVisitors, 1);
assert.equal(result.kpis.uniqueIps, 2);
assert.equal(getReliableVisitorKey(sameUidDifferentIps[0]), 'uid:anon-1');

const unknownIp = [
    { id: 's5', startedAt: ts(-10 * 60 * 1000), type: 'anonymous', ip: 'Unknown', duration: 12 }
];

result = buildAnalyticsStats(unknownIp, '1j', { now: baseNow });
assert.equal(result.kpis.uniqueIps, 0);
assert.equal(result.kpis.ipCoverage, 0);
assert.equal(result.dataQuality.missingIpSessions, 1);
assert.equal(isUsableAnalyticsIp('Unknown'), false);

const slotDedup = [
    { id: 's6', userId: 'anon-2', authProvider: 'anonymous', startedAt: ts(-15 * 60 * 1000), type: 'anonymous', ip: '203.0.113.30', duration: 30 },
    { id: 's7', userId: 'anon-2', authProvider: 'anonymous', startedAt: ts(-10 * 60 * 1000), type: 'anonymous', ip: '203.0.113.30', duration: 30 }
];

result = buildAnalyticsStats(slotDedup, '1j', { now: baseNow });
const activeSlots = result.chartData.filter(slot => slot.sessions > 0);
assert.equal(activeSlots.length, 1);
assert.equal(activeSlots[0].sessions, 2);
assert.equal(activeSlots[0].visites, 1);

assert.equal(ipTools.normalizeIp('::ffff:203.0.113.42'), '203.0.113.42');
assert.equal(ipTools.normalizeIp('203.0.113.42:443'), '203.0.113.42');
assert.deepEqual(
    ipTools.getClientIpInfo({
        headers: { 'x-forwarded-for': '198.51.100.1, 10.0.0.1' },
        connection: { remoteAddress: '10.0.0.2' }
    }).ip,
    '198.51.100.1'
);

console.log('Analytics reliability verifier passed.');

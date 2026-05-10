import { execFileSync } from 'node:child_process';

const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
const project = projectArg?.slice('--project='.length) || process.argv[2];

if (!project) {
  console.error('Usage: npm run audit:functions-env -- --project=<firebase-project-id>');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(project)) {
  console.error('Invalid Firebase project id.');
  process.exit(1);
}

function parseFirebaseJson(output) {
  const start = output.indexOf('{');
  if (start === -1) {
    throw new Error('Firebase CLI did not return JSON output');
  }

  return JSON.parse(output.slice(start));
}

function getFunctions(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.functions)) return payload.functions;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

const firebaseArgs = ['functions:list', '--project', project, '--json'];
const raw = process.platform === 'win32'
  ? execFileSync('cmd.exe', ['/d', '/s', '/c', `firebase.cmd ${firebaseArgs.join(' ')}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  : execFileSync('firebase', firebaseArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

const functions = getFunctions(parseFirebaseJson(raw));
const summary = functions
  .map((fn) => {
    const name = fn.name?.split('/').pop() || fn.id || fn.functionName || 'unknown';
    const runtime = fn.runtime || fn.buildConfig?.runtime || 'unknown';
    const region = fn.region || fn.serviceConfig?.region || fn.location || 'unknown';
    const envVars = fn.environmentVariables || fn.serviceConfig?.environmentVariables || {};
    const secrets = fn.secretEnvironmentVariables || fn.serviceConfig?.secretEnvironmentVariables || [];

    return {
      name,
      region,
      runtime,
      legacyEnvCount: Object.keys(envVars).length,
      secretCount: Array.isArray(secrets) ? secrets.length : Object.keys(secrets).length,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const totals = summary.reduce(
  (acc, fn) => {
    acc.functions += 1;
    acc.legacyEnvTotal += fn.legacyEnvCount;
    acc.secretTotal += fn.secretCount;
    if (fn.legacyEnvCount > 0) acc.functionsWithLegacyEnv += 1;
    return acc;
  },
  { project, functions: 0, functionsWithLegacyEnv: 0, legacyEnvTotal: 0, secretTotal: 0 },
);

console.log(JSON.stringify({ totals, functions: summary }, null, 2));

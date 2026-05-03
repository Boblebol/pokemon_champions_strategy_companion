import { spawnSync } from 'node:child_process';

const LIGHTPANDA_BIN = process.env.LIGHTPANDA_BIN ?? '/tmp/lightpanda';
const APP_URL = (process.env.APP_URL ?? 'http://127.0.0.1:5175').replace(/\/$/, '');
const WAIT_MS = process.env.LIGHTPANDA_WAIT_MS ?? '8000';
const MAX_ATTEMPTS = Number(process.env.LIGHTPANDA_ATTEMPTS ?? 3);
const FAILURE_MARKERS = ['CouldntConnect', 'fetch error', 'navigate failed', '$level=fatal'];

const routes = [
  {
    path: '/app',
    selector: '.dashboard',
    expectedText: [
      "Cockpit d'analyse",
      "Constructeur d'équipe",
      "Slots de l'équipe",
      'Combat',
      'Aides rapides',
    ],
  },
  {
    path: '/landing',
    selector: '.marketing-hero',
    expectedText: [
      'Présentation marketing',
      'Gagne du temps au team preview',
      "Ouvrir l'app",
      'Ouvrir la doc',
    ],
  },
  {
    path: '/docs',
    selector: '.docs-shell',
    expectedText: [
      'Documentation Champions Companion',
      "1. Démarrer avec l'assistant",
      '5. Simuler le combat',
      'Limites connues',
    ],
  },
];

function routeUrl(path) {
  return `${APP_URL}${path}`;
}

function fetchSemanticTree(route) {
  return spawnSync(
    LIGHTPANDA_BIN,
    [
      'fetch',
      '--dump',
      'semantic_tree_text',
      '--strip-mode',
      'full',
      '--wait-selector',
      route.selector,
      '--wait-ms',
      WAIT_MS,
      routeUrl(route.path),
    ],
    {
      env: {
        ...process.env,
        LIGHTPANDA_DISABLE_TELEMETRY: 'true',
      },
      encoding: 'utf8',
    },
  );
}

function validateOutput(route, output) {
  const failureMarker = FAILURE_MARKERS.find((marker) => output.includes(marker));
  if (failureMarker) {
    return `Lightpanda reported ${failureMarker}`;
  }

  const missingText = route.expectedText.filter((text) => !output.includes(text));
  if (missingText.length > 0) {
    return `missing expected semantic text: ${missingText.join(', ')}`;
  }

  return undefined;
}

let hasFailure = false;

for (const route of routes) {
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = fetchSemanticTree(route);
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    if (result.error) {
      lastError = result.error.message;
    } else if (result.status !== 0) {
      lastError = `exit ${result.status}: ${output.trim()}`;
    } else {
      const validationError = validateOutput(route, output);
      if (!validationError) {
        console.log(`OK ${route.path}`);
        lastError = '';
        break;
      }
      lastError = validationError;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.warn(`Retry ${attempt}/${MAX_ATTEMPTS} ${route.path}: ${lastError}`);
    }
  }

  if (lastError) {
    hasFailure = true;
    console.error(`FAIL ${route.path}: ${lastError}`);
  }
}

if (hasFailure) {
  process.exit(1);
}

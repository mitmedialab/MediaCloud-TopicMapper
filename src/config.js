
export const APP_SOURCE_MANAGER = 'sources';
export const APP_TOPIC_MAPPER = 'topics';
export const APP_TOOLS = 'tools';
export const APP_EXPLORER = 'explorer';

/**
 * Specify which app this should run; either 'topics' or 'sources'.
 */
let appName = null;
export function setAppName(newAppName) {
  appName = newAppName;
}
export function getAppName() {
  return appName;
}

/**
 * Version injected via webpack from package.json
 */
const version = MC_VERSION; // eslint-disable-line no-undef
export function getVersion() {
  return version;
}

export function isProdMode() {
  return (process.env.NODE_ENV === 'production');
}

export function isDevMode() {
  return !isProdMode();
}

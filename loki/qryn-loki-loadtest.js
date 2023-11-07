import {sleep, check} from 'k6';
import loki from 'k6/x/loki';

import { htmlReport, markdownReport } from "https://raw.githubusercontent.com/metrico/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

/**
 * URL used for push and query requests
 * Path is automatically appended by the client
 * @constant {string}
 */
const BASE_URL = __ENV.K6_LOKI_HOSTNAME || `http://localhost:3100`;
const LOKI_BYTES = __ENV.K6_BYTES || 1024;
const LOKI_VUS = __ENV.K6_VUS || 10;
const LOKI_ITERACTIONS = __ENV.K6_ITERACTIONS || 10;


/**
 * Helper constant for byte values
 * @constant {number}
 */
const KB = LOKI_BYTES;

/**
 * Helper constant for byte values
 * @constant {number}
 */
const MB = KB * KB;

/**
 * Instantiate config and Loki client
 */
const conf = new loki.Config(BASE_URL);
const client = new loki.Client(conf);

/**
 * Define test scenario
 */
export const options = {
  vus: LOKI_VUS,
  iterations: LOKI_ITERACTIONS,
};

/**
 * "main" function for each VU iteration
 */
export default () => {
  // Push request with 10 streams and uncompressed logs between 800KB and 2MB
  var res = client.pushParameterized(10, 800 * KB, 2 * MB);
  // Check for successful write
  check(res, { 'successful write': (res) => res.status == 204 });

  // Pick a random log format from label pool
  let format = randomChoice(conf.labels["format"]);

  // Execute instant query with limit 1
  res = client.instantQuery(`count_over_time({format="${format}"}[1m])`, 1)
  // Check for successful read
  check(res, { 'successful instant query': (res) => res.status == 200 });

  // Execute range query over last 5m and limit 1000
  res = client.rangeQuery(`{format="${format}"}`, "5m", 1000)
  // Check for successful read
  check(res, { 'successful range query': (res) => res.status == 200 });

  // Wait before next iteration
  sleep(1);
}

/**
 * Helper function to get random item from array
 */
function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    "summary.md": markdownReport(data),
    "stdout": textSummary(data, { indent: ' ', enableColors: true }),
  };
}

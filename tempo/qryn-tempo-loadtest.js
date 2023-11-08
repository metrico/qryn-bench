import { sleep } from 'k6';
import tracing from 'k6/x/tracing';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

import { htmlReport, markdownReport } from "https://raw.githubusercontent.com/metrico/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export let options = {
    vus: __ENV.K6_VUS || 1,
    duration: __ENV.K6_DURATION_MINUTES ? __ENV.K6_DURATION_MINUTES + "m" : "1m",
};

const endpoint = __ENV.K6_TEMPO_ENDPOINT || "localhost:3100"
const client = new tracing.Client({
    endpoint,
    exporter: tracing.EXPORTER_OTLP,
    insecure: true,
});

export default function () {
    let pushSizeTraces = randomIntBetween(2,3);
    let pushSizeSpans = 0;
    let t = [];
    for (let i = 0; i < pushSizeTraces; i++) {
        let c = randomIntBetween(5,10)
        pushSizeSpans += c;

        t.push({
            random_service_name: false,
            spans: {
                count: c,
                size: randomIntBetween(300,1000),
                random_name: true,
                fixed_attrs: {
                    "test": "test",
                },
            }
        });
    }

    let gen = new tracing.ParameterizedGenerator(t)
    let traces = gen.traces()
    client.push(traces);

    console.log(`Pushed ${pushSizeSpans} spans from ${pushSizeTraces} different traces. Here is a random traceID: ${t[Math.floor(Math.random() * t.length)].id}`);
    sleep(__ENV.K6_INTERVAL || 15);
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    "summary.md": markdownReport(data),
    "summary.txt": textSummary(data, { indent: ' ', enableColors: false }),
    "stdout": textSummary(data, { indent: ' ', enableColors: true }),
  };
}
export function teardown() {
    client.shutdown();
}

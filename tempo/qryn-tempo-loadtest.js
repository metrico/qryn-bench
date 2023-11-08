import {sleep, check} from 'k6';
import tracing from 'k6/x/tracing';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

import { htmlReport, markdownReport } from "https://raw.githubusercontent.com/metrico/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.1/index.js';
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.6/index.js';

export let options = {
    vus: __ENV.K6_VUS || 1,
    duration: __ENV.K6_DURATION_MINUTES ? __ENV.K6_DURATION_MINUTES + "m" : "1m",
    iterations: __ENV.K6_ITERATIONS || 10,
};

const endpoint = __ENV.K6_TEMPO_ENDPOINT || "http://localhost:3100"
const client = new tracing.Client({
    endpoint,
    exporter: tracing.EXPORTER_OTLP_HTTP,
    insecure: true,
});

let session = new Httpx({
    baseURL: endpoint,
    headers: {
        'User-Agent': "qryn-k6",
        "Content-Type": 'application/x-www-form-urlencoded' 
    },
    timeout: 10000 // 10s timeout.
});

const traceDefaults = {
    attributeSemantics: tracing.SEMANTICS_HTTP,
    attributes: {"one": "three"},
    randomAttributes: {count: 2, cardinality: 5}
}

const traceTemplates = [
    {
        defaults: traceDefaults,
        spans: [
            {service: "shop-backend", name: "list-articles", duration: {min: 200, max: 900}},
            {service: "shop-backend", name: "authenticate", duration: {min: 50, max: 100}},
            {service: "auth-service", name: "authenticate"},
            {service: "shop-backend", name: "fetch-articles", parentIdx: 0},
            {service: "article-service", name: "list-articles"},
            {service: "article-service", name: "select-articles", attributeSemantics: tracing.SEMANTICS_DB},
            {service: "postgres", name: "query-articles", attributeSemantics: tracing.SEMANTICS_DB, randomAttributes: {count: 5}},
        ]
    },
    {
        defaults: {
            attributeSemantics: tracing.SEMANTICS_HTTP,
        },
        spans: [
            {service: "shop-backend", name: "article-to-cart", duration: {min: 400, max: 1200}},
            {service: "shop-backend", name: "authenticate", duration: {min: 70, max: 200}},
            {service: "auth-service", name: "authenticate"},
            {service: "shop-backend", name: "get-article", parentIdx: 0},
            {service: "article-service", name: "get-article"},
            {service: "article-service", name: "select-articles", attributeSemantics: tracing.SEMANTICS_DB},
            {service: "postgres", name: "query-articles", attributeSemantics: tracing.SEMANTICS_DB, randomAttributes: {count: 2}},
            {service: "shop-backend", name: "place-articles", parentIdx: 0},
            {service: "cart-service", name: "place-articles", attributes: {"article.count": 1, "http.status_code": 201}},
            {service: "cart-service", name: "persist-cart"}
        ]
    },
    {
        defaults: traceDefaults,
        spans: [
            {service: "shop-backend", attributes: {"http.status_code": 403}},
            {service: "shop-backend", name: "authenticate"},
            {service: "auth-service", name: "authenticate", attributes: {"http.status_code": 403}},
        ]
    },
]

export default function () {
    const templateIndex = randomIntBetween(0, traceTemplates.length-1)
    const gen = new tracing.TemplatedGenerator(traceTemplates[templateIndex])

    let t = gen.traces()
    let res = client.push(t)

    sleep(randomIntBetween(1, 5));

    const end = parseInt(Date.now() / 1000);
    const start = end - 300

    describe('tempo_query', () => {

        const res = session.get('/api/search', {
            tags: 'service.name="shop-backend"',
            start: start,
            end: end,
            limit: 10,
        });

	    console.log("res",res, res.json()) // issue with \u0026 instead of &
 
        expect(res.status, "request status").to.equal(200);
        expect(res).to.have.validJsonBody();
    });

}

export function teardown() {
    client.shutdown();
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    "summary.md": markdownReport(data),
    "summary.txt": textSummary(data, { indent: ' ', enableColors: false }),
    "stdout": textSummary(data, { indent: ' ', enableColors: true }),
  };
}

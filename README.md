<img src="https://user-images.githubusercontent.com/1423657/218816262-e0e8d7ad-44d0-4a7d-9497-0d383ed78b83.png" height=150 />

# k6 for qryn

Test and Bencharmking setup for [qryn](https://qryn.dev) using [k6](https://k6.io/)

## Pre-requisites

Download the latest `k6` binary with built-in Prometheus and Loki support:

```sh
wget -O k6 https://github.com/metrico/qryn-bench/releases/download/latest/k6
chmod +x k6
```


## Test Scripts

### Prometheus Test

The [prometheus/qryn-loadtest.js] script can be configured using the following environment variables:

| Environment variable          | Required | Default value | Description                                                                           |
| ----------------------------- | -------- | ------------- | ------------------------------------------------------------------------------------- |
| `K6_WRITE_HOSTNAME`           | Yes      |               | qryn hostname to connect to on the write path.                                       |
| `K6_READ_HOSTNAME`            | Yes      |               | qryn hostname to connect to on the read path.                                        |
| `K6_SCHEME`                   |          | http          | The protocol scheme used for requests.                                                |
| `K6_USERNAME`                 |          | ''            | qryn username to use for HTTP bearer authentication.                                 |
| `K6_WRITE_TOKEN`              |          | ''            | Authentication token to use for HTTP bearer authentication on requests to write path. |
| `K6_READ_TOKEN`               |          | ''            | Authentication token to use for HTTP bearer authentication on requests to read path.  |
| `K6_WRITE_REQUEST_RATE`       |          | 1             | Number of remote write requests to send every `K6_SCRAPE_INTERVAL_SECONDS`.           |
| `K6_WRITE_SERIES_PER_REQUEST` |          | 1000          | Number of series per remote write request.                                            |
| `K6_READ_REQUEST_RATE`        |          | 1             | Number of query requests per second.                                                  |
| `K6_DURATION_MIN`             |          | 720           | Duration of the load test in minutes (including ramp up and down).                    |
| `K6_RAMP_UP_MIN`              |          | 0             | Duration of the ramp up period in minutes.                                            |
| `K6_RAMP_DOWN_MIN`            |          | 0             | Duration of the ramp down period in minutes.                                          |
| `K6_SCRAPE_INTERVAL_SECONDS`  |          | 20            | Simulated Prometheus scrape interval in seconds.                                      |
| `K6_HA_REPLICAS`              |          | 1             | Number of HA replicas to simulate (use 1 for no HA).                                  |
| `K6_HA_CLUSTERS`              |          | 1             | Number of HA clusters to simulate.                                                    |
| `K6_TENANT_ID`                |          | ''            | Tenant ID used for load test to read metrics from and write metrics to.               |

For example, if qryn is running on `localhost:3100` you can run a small scale test with this command:

```sh
./k6 run prometheus/qryn-loadtest.js \
    -e K6_WRITE_HOSTNAME="localhost:3100" \
    -e K6_READ_HOSTNAME="localhost:3100" \
    -e K6_DURATION_MIN="1"
```

Assuming qryn is scaled up appropriately and you have enough k6 workers capacity, you can load test qryn with 1 billion active series running this command:

```sh
./k6 run lprometheus/qryn-loadtest.js \
    -e K6_WRITE_HOSTNAME="qryn:3100" \
    -e K6_READ_HOSTNAME="qryn:3100" \
    -e K6_WRITE_REQUEST_RATE="50000" \
    -e K6_WRITE_SERIES_PER_REQUEST="20000" \
    -e K6_READ_REQUEST_RATE="200" \
    -e RAMP_UP_MIN="2"
```

### Loki Test

The [loki/qryn-loki-loadtest.js] script can be configured using the following environment variables:

| Environment variable   | Required | Default value | Description                                                                           |
| ---------------------- | -------- | ------------- | ------------------------------------------------------------------------------------- |
| `K6_LOKI_HOSTNAME`     | No       | `http://localhost:3100`| qryn hostname to connect to on the write path.                                       |
| `K6_BYTES`             | No       | 1024 | Bytes used for each request.                                        |
| `K6_VUS`               | No       | 10 | k6 VUS.                                        |
| `K6_ITERACTIONS`       | No       | 10 | k6 Interactions.                                        |

If qryn is running on `localhost:3100` you can run a small scale test with this command:

```
./k6 run loki/qryn-loki-loadtest.js
```

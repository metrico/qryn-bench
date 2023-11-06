<img src="https://user-images.githubusercontent.com/1423657/218816262-e0e8d7ad-44d0-4a7d-9497-0d383ed78b83.png" height=150 />

# Load testing qryn with k6

[Grafana's k6](https://k6.io/) is an open source load testing tool.

## Pre-requisites

Install xk6, used for building k6 with additional modules

```sh
go install go.k6.io/xk6/cmd/xk6@latest
```

Build k6 with k6-client-prometheus-remote support using xk6

```sh
xk6 build --with github.com/grafana/xk6-client-prometheus-remote@latest
```

Alternatively, download a prebuilt version of k6 with Prometheus/Loki support:
```sh
wget -O k6 https://github.com/metrico/qryn-bench/releases/download/latest/k6
chmod +x k6
```


## Run the test script

The [load-testing-with-k6.js] script can be configured using the following environment variables:

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
k6 run load-testing-with-k6.js \
    -e K6_WRITE_HOSTNAME="localhost:3100" \
    -e K6_READ_HOSTNAME="localhost:3100" \
    -e K6_DURATION_MIN="1"
```

Assuming qryn is scaled up appropriately and you have enough k6 workers capacity, you can load test qryn with 1 billion active series running this command:

```sh
k6 run load-testing-with-k6.js \
    -e K6_WRITE_HOSTNAME="qryn:3100" \
    -e K6_READ_HOSTNAME="qryn:3100" \
    -e K6_WRITE_REQUEST_RATE="50000" \
    -e K6_WRITE_SERIES_PER_REQUEST="20000" \
    -e K6_READ_REQUEST_RATE="200" \
    -e RAMP_UP_MIN="2"
```

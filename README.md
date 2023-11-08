<img src="https://github.com/metrico/qryn-bench/assets/1423657/15082313-9b44-46ea-b7b9-590470c9decd" height=120 />

# k6 for qryn

Test and Bencharmking setup for [qryn](https://qryn.dev) using [k6](https://k6.io/)

### Pre-requisites

Download the latest `k6` binary with built-in Prometheus and Loki support:

```sh
wget -O k6 https://github.com/metrico/qryn-bench/releases/download/latest/k6
chmod +x k6
```


## Test Scripts

This repository provides scripts to test qryn's own `Loki`, `Prometheus` and `Tempo` APIs<br>


### Prometheus

The [prometheus/qryn-loadtest.js](prometheus/qryn-loadtest.js) script can be configured using the following environment variables:

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

For example, if qryn is running on `localhost:3100` you can run a small scale Prometheus test with this command:

```bash
./k6 run prometheus/qryn-loadtest.js \
    -e K6_WRITE_HOSTNAME="localhost:3100" \
    -e K6_READ_HOSTNAME="localhost:3100" \
    -e K6_DURATION_MIN="1"
```
```
✓ write worked

 █ instant query low cardinality

   ✓ expected request status to equal 200
   ✓ has valid json body
   ✓ expected status field to equal 'success'
   ✓ expected data.resultType field to equal 'vector'

 █ instant query high cardinality

   ✓ expected request status to equal 200
   ✓ has valid json body
   ✓ expected status field to equal 'success'
   ✓ expected data.resultType field to equal 'vector'

 █ range query

   ✓ expected request status to equal 200
   ✓ has valid json body
   ✓ expected status field is 'success' to equal 'success'
   ✓ expected resultType is 'matrix' to equal 'matrix'

 checks.....................................................: 100.00% ✓ 730      ✗ 0   
 ✓ { type:read }............................................: 0.00%   ✓ 0        ✗ 0   
 ✓ { type:write }...........................................: 100.00% ✓ 2        ✗ 0   
 data_received..............................................: 50 kB   828 B/s
 data_sent..................................................: 52 kB   868 B/s
 group_duration.............................................: avg=44.47ms min=17.98ms med=38.09ms max=118.21ms p(90)=79.44ms  p(95)=85.7ms  
 http_req_blocked...........................................: avg=36.54s min=1.9s   med=4.2s   max=478.51s p(90)=194.95s p(95)=211.74s
 http_req_connecting........................................: avg=22.36s min=0s      med=0s      max=413.4s  p(90)=134.06s p(95)=147.41s
 http_req_duration..........................................: avg=41.04ms min=13.99ms med=34.49ms max=113.76ms p(90)=75.81ms  p(95)=86.35ms 
   { expected_response:true }...............................: avg=40.45ms min=13.99ms med=34.36ms max=113.76ms p(90)=75.32ms  p(95)=81.19ms 
 ✓ { type:read }............................................: avg=40.45ms min=13.99ms med=34.36ms max=113.76ms p(90)=75.32ms  p(95)=81.19ms 
 ✓ { url:http://localhost:3100/api/v1/prom/remote/write }...: avg=0s      min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s      
 http_req_failed............................................: 0.00%    ✓ 0        ✗ 184 
 http_req_receiving.........................................: avg=67.15s min=22.35s med=63.78s max=823.99s p(90)=94.96s  p(95)=105.85s
 http_req_sending...........................................: avg=26.83s min=8.84s  med=21.15s max=95.77s  p(90)=44.87s  p(95)=67.64s 
 http_req_tls_handshaking...................................: avg=0s      min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s      
 http_req_waiting...........................................: avg=40.95ms min=13.88ms med=34.42ms max=113.65ms p(90)=75.75ms  p(95)=86.29ms 
 http_reqs..................................................: 184     3.065262/s
 iteration_duration.........................................: avg=45.23ms min=18.14ms med=38.63ms max=118.48ms p(90)=80.37ms  p(95)=88.63ms 
 iterations.................................................: 184     3.065262/s
 vus........................................................: 0       min=0      max=0 
 vus_max....................................................: 26      min=26     max=26
```

Assuming qryn is scaled up appropriately and you have enough k6 workers capacity, you can load test qryn with 1 billion active series running this command:

```bash
./k6 run lprometheus/qryn-loadtest.js \
    -e K6_WRITE_HOSTNAME="localhost:3100" \
    -e K6_READ_HOSTNAME="localhost:3100" \
    -e K6_WRITE_REQUEST_RATE="50000" \
    -e K6_WRITE_SERIES_PER_REQUEST="20000" \
    -e K6_READ_REQUEST_RATE="200" \
    -e RAMP_UP_MIN="2"
```

<br>

---------

### Loki 

The [loki/qryn-loki-loadtest.js](loki/qryn-loki-loadtest.js) script can be configured using the following environment variables:

| Environment variable   | Required | Default value | Description                                                                           |
| ---------------------- | -------- | ------------- | ------------------------------------------------------------------------------------- |
| `K6_LOKI_HOSTNAME`     | No       | `http://localhost:3100`| Hostname for the qryn instance or other logql API endpoint.                  |
| `K6_BYTES`             | No       | 1024 | Size in Bytes for each request.                               |
| `K6_VUS`               | No       | 10 | Number of users to simulate                                     |
| `K6_ITERACTIONS`       | No       | 10 | Number of user interactions to simulate                         |

If qryn is running on `localhost:3100` you can run a small Loki scale test with this command:

```bash
./k6 run loki/qryn-loki-loadtest.js \
    -e K6_LOKI_HOSTNAME="localhost:3100"
```
```
✓ successful write
 ✓ successful instant query
 ✓ successful range query

 checks............................: 100.00% ✓ 300          ✗ 0   
 data_received.....................: 23 MB   727 kB/s
 data_sent.........................: 66 MB   2.1 MB/s
 http_req_blocked..................: avg=1.23ms   min=1.7s   med=3.9s    max=80.93ms  p(90)=7s      p(95)=8.75s 
 http_req_connecting...............: avg=1.04ms   min=0s      med=0s       max=78.74ms  p(90)=0s       p(95)=0s     
 http_req_duration.................: avg=498.42ms min=43.55ms med=426.13ms max=1.68s    p(90)=971.43ms p(95)=1.1s   
   { expected_response:true }......: avg=498.42ms min=43.55ms med=426.13ms max=1.68s    p(90)=971.43ms p(95)=1.1s   
 http_req_failed...................: 0.00%   ✓ 0            ✗ 300 
 http_req_receiving................: avg=14.53ms  min=17.9s  med=2.3ms    max=202.33ms p(90)=47.75ms  p(95)=72.78ms
 http_req_sending..................: avg=3.49ms   min=9.29s  med=21.05s  max=97.67ms  p(90)=9ms      p(95)=20.08ms
 http_req_tls_handshaking..........: avg=0s       min=0s      med=0s       max=0s       p(90)=0s       p(95)=0s     
 http_req_waiting..................: avg=480.39ms min=34.73ms med=406.13ms max=1.68s    p(90)=963.47ms p(95)=1.1s   
 http_reqs.........................: 300     9.628512/s
 iteration_duration................: avg=3.02s    min=1.39s   med=3.12s    max=4.68s    p(90)=4.33s    p(95)=4.43s  
 iterations........................: 100     3.209504/s
 loki_bytes_processed_per_second...: avg=0 B      min=0 B     med=0 B      max=0 B      p(90)=0 B      p(95)=0 B    
 loki_bytes_processed_total........: 0 B     0 B/s
 loki_client_lines.................: 925068  29690.093291/s
 loki_client_uncompressed_bytes....: 158 MB  5.1 MB/s
 loki_lines_processed_per_second...: avg=0        min=0       med=0        max=0        p(90)=0        p(95)=0      
 loki_lines_processed_total........: 0       0/s
 vus...............................: 2       min=2          max=10
 vus_max...........................: 10      min=10         max=10
```

<br>

---------

### Tempo 

The [tempo/qryn-tempo-template.js](tempo/qryn-tempo-template.js) script can be configured using the following environment variables:

| Environment variable   | Required | Default value | Description                                                                           |
| ---------------------- | -------- | ------------- | ------------------------------------------------------------------------------------- |
| `K6_TEMPO_HOSTNAME`    | No       | `http://localhost:3100`| Hostname for the qryn instance or other Tempo API endpoint.                  |
| `K6_DURATION_MINUTES`  | No       | 1 | Test duration in minutes                              |
| `K6_VUS`               | No       | 10 | Number of users to simulate                                     |
| `K6_ITERACTIONS`       | No       | 10 | Number of user interactions to simulate                         |

If qryn is running on `localhost:3100` you can run a small scale Tempo test with this command:

```bash
./k6-tracing run tempo/qryn-tempo-template.js \
    -e K6_TEMPO_ENDPOINT="http://localhost:3100"
```
```
 █ tempo_query

   ✓ expected request status to equal 200
   ✓ has valid json body
   ✓ expected count results 10 to be above 0

 █ teardown

 checks.........................: 100.00% ✓ 30      ✗ 0  
 data_received..................: 17 kB   738 B/s
 data_sent......................: 1.7 kB  73 B/s
 group_duration.................: avg=23.17ms  min=17.98ms med=24.06ms max=26.4ms   p(90)=25.44ms  p(95)=25.92ms 
 http_req_blocked...............: avg=78.53s  min=4.2s   med=5.85s  max=733.26s p(90)=79.62s  p(95)=406.44s
 http_req_connecting............: avg=50.96s  min=0s      med=0s      max=509.64s p(90)=50.96s  p(95)=280.3s 
 http_req_duration..............: avg=18.11ms  min=13.87ms med=18.21ms max=21.98ms  p(90)=20.94ms  p(95)=21.46ms 
   { expected_response:true }...: avg=18.11ms  min=13.87ms med=18.21ms max=21.98ms  p(90)=20.94ms  p(95)=21.46ms 
 http_req_failed................: 0.00%   ✓ 0       ✗ 10 
 http_req_receiving.............: avg=110.65s min=67.2s  med=90.55s max=219.62s p(90)=191.08s p(95)=205.35s
 http_req_sending...............: avg=39.24s  min=30.5s  med=36.5s  max=65.1s   p(90)=43.68s  p(95)=54.39s 
 http_req_tls_handshaking.......: avg=0s       min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s      
 http_req_waiting...............: avg=17.96ms  min=13.74ms med=18.03ms max=21.87ms  p(90)=20.81ms  p(95)=21.34ms 
 http_reqs......................: 10      0.43013/s
 iteration_duration.............: avg=2.11s    min=23.3s  med=1.02s   max=5.02s    p(90)=4.02s    p(95)=4.52s   
 iterations.....................: 10      0.43013/s
 vus............................: 1       min=1     max=1
 vus_max........................: 1       min=1     max=1
```

<br>

FROM golang:1.20 as builder

RUN go install go.k6.io/xk6/cmd/xk6@latest
# Build k6 with the required extensions to test qryn
RUN xk6 build \
    --with github.com/grafana/xk6-loki \
    --with github.com/grafana/xk6-client-prometheus-remote \
    --with github.com/grafana/xk6-output-influxdb@latest \
    --output /k6

FROM grafana/k6:latest
COPY --from=builder /k6 /usr/bin/k6

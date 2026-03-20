import express from 'express'
import {Registry, collectDefaultMetrics, Counter } from 'prom-client'

const register = new Registry()
collectDefaultMetrics({ register })
register.setDefaultLabels({ app: 'bot' })
const app = express()

export const restarts = new Counter({ name: 'restarts', help: 'number of times app has restarted'})

register.registerMetric(restarts)
app.get('/metrics', (req, res) => {
  register
    .metrics()
    .then(metrics => {
      res.set('Content-Type', register.contentType);
      res.send(metrics);
    })
    .catch((err) => {
      console.error(`Error serving metrics: ${err.message}`);
      res.status(500).end(err.message);
    });
});

export const startMetricsServer = (port) => {
    return app.listen(port, () => {
        console.log(`Metrics server listening on http://localhost:${port}`)
    })
}
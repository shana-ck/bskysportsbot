import express from 'express'
import {Registry, collectDefaultMetrics, Counter, Gauge } from 'prom-client'

const register = new Registry()
collectDefaultMetrics({ register })
register.setDefaultLabels({ app: 'bot' })
const app = express()

export const successPosts = new Counter({ name: "bot_posts", help: "number of successful posts by the bot"})
export const failPosts = new Gauge({ name: "failed_posts", help: "number of failed posts by bot"})

register.registerMetric(successPosts)
register.registerMetric(failPosts)

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

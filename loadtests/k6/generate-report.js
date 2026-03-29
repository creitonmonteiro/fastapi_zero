'use strict'

const fs = require('fs')
const path = require('path')

const inputPath = path.resolve('k6-results/summary.json')
const outputPath = path.resolve('k6-results/summary.html')

if (!fs.existsSync(inputPath)) {
  console.error('Error: k6-results/summary.json not found')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

const metrics = data.metrics || {}
const checks = data.root_group?.checks || {}

const httpReqs = metrics.http_reqs || {}
const httpLatency = metrics.http_req_duration || {}
const httpErrors = metrics.http_req_failed || {}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const checksHtml = Object.keys(checks).length > 0
  ? [
      '<div class="checks">',
      '  <h2>Checks</h2>',
      Object.entries(checks).map(([name, check]) => {
        const passed = check.passes || 0
        const failed = check.fails || 0
        const total = passed + failed
        const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0'
        const stateClass = failed === 0 ? 'check-pass' : 'check-fail'
        const stateIcon = failed === 0 ? 'PASS' : 'FAIL'
        return [
          '  <div class="check-item ' + stateClass + '">',
          '    <span class="check-name">' + stateIcon + ' ' + escapeHtml(name) + '</span>',
          '    <span class="check-rate">' + rate + '% (' + passed + '/' + total + ')</span>',
          '  </div>',
        ].join('\n')
      }).join('\n'),
      '</div>',
    ].join('\n')
  : ''

const html = [
  '<!DOCTYPE html>',
  '<html>',
  '<head>',
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <title>K6 Load Test Report</title>',
  '  <style>',
  '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }',
  '    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }',
  '    h1 { color: #333; margin-bottom: 10px; }',
  '    .timestamp { color: #666; font-size: 14px; margin-bottom: 30px; }',
  '    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 30px 0; }',
  '    .metric-card { background: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #0066cc; }',
  '    .metric-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }',
  '    .metric-value { font-size: 28px; font-weight: bold; color: #333; }',
  '    .metric-unit { color: #999; font-size: 14px; margin-left: 4px; }',
  '    .checks { margin-top: 30px; }',
  '    .checks h2 { color: #333; }',
  '    .check-item { padding: 12px; margin: 8px 0; border-radius: 4px; overflow: hidden; border-left: 4px solid #ccc; }',
  '    .check-pass { background: #f0f8f0; border-left-color: #28a745; }',
  '    .check-fail { background: #f8f0f0; border-left-color: #dc3545; }',
  '    .check-name { font-weight: bold; }',
  '    .check-rate { float: right; color: #666; font-size: 12px; }',
  '  </style>',
  '</head>',
  '<body>',
  '  <div class="container">',
  '    <h1>K6 Load Test Report</h1>',
  '    <div class="timestamp">Generated: ' + new Date(data.state?.endTime || Date.now()).toLocaleString() + '</div>',
  '    <div class="metrics-grid">',
  '      <div class="metric-card"><div class="metric-label">Total Requests</div><div class="metric-value">' + (httpReqs.count || 0).toLocaleString() + '</div></div>',
  '      <div class="metric-card"><div class="metric-label">Requests/sec</div><div class="metric-value">' + (httpReqs.rate || 0).toFixed(2) + '<span class="metric-unit">rps</span></div></div>',
  '      <div class="metric-card"><div class="metric-label">Avg Latency</div><div class="metric-value">' + (httpLatency.avg || 0).toFixed(0) + '<span class="metric-unit">ms</span></div></div>',
  '      <div class="metric-card"><div class="metric-label">P95 Latency</div><div class="metric-value">' + (httpLatency['p(95)'] || 0).toFixed(0) + '<span class="metric-unit">ms</span></div></div>',
  '      <div class="metric-card"><div class="metric-label">Max Latency</div><div class="metric-value">' + (httpLatency.max || 0).toFixed(0) + '<span class="metric-unit">ms</span></div></div>',
  '      <div class="metric-card"><div class="metric-label">Failed Requests</div><div class="metric-value">' + (httpErrors.fails || 0).toLocaleString() + '</div></div>',
  '    </div>',
  checksHtml,
  '  </div>',
  '</body>',
  '</html>',
].join('\n')

fs.writeFileSync(outputPath, html)
console.log('HTML report written: ' + outputPath)

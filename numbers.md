---
outline: deep
---


# Heretic in numbers

Download figures for the Heretic ecosystem. The headline totals are the exact
numbers published by [Heretic Live](https://heretic.sdad.pro); the breakdowns
come from the [Heretic Directory](https://hdir.sdad.pro) index. Everything is
fetched live and re-checked every 10 minutes, so there is nothing to update by
hand.

<p v-if="error">
The numbers could not be loaded right now: <code>{{ error }}</code>.
Try again in a moment.
</p>

<p v-if="!live && !error">Loading the numbers...</p>

<template v-if="live">

<div class="hn-stats">
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(live.totals.allTimeDownloads) }}</div>
    <div class="hn-stat-label">downloads, all time</div>
  </div>
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(live.totals.last30DaysDownloads) }}</div>
    <div class="hn-stat-label">downloads, last 30 days</div>
  </div>
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(Math.round(live.totals.last30DaysDownloads / 30)) }}</div>
    <div class="hn-stat-label">downloads per day, 30-day average</div>
  </div>
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(live.totals.modelCount) }}</div>
    <div class="hn-stat-label">Heretic models on the Hub</div>
  </div>
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(live.totals.meanLifetimeDownloads) }}</div>
    <div class="hn-stat-label">mean lifetime downloads per model</div>
  </div>
  <div class="hn-stat">
    <div class="hn-stat-value">{{ num(live.totals.creatorCount) }}</div>
    <div class="hn-stat-label">creators publishing Heretic models</div>
  </div>
</div>

Hub snapshot: {{ stamp(live.updatedAt) }}. Index snapshot:
{{ stamp(health?.dataset.generatedAt) }}. Last checked: {{ stamp(checkedAt) }}.

## Downloads by family

The {{ num(families.length) }} model families with at least one Heretic version,
hardest hit first. These are Directory index downloads:
{{ num(index?.allTimeDownloads) }} across {{ num(index?.modelCount) }} repositories.

<div class="hn-bars">
  <div class="hn-bar" v-for="f in families.slice(0, 12)" :key="f.slug">
    <div class="hn-bar-head"><span>{{ f.label }}</span><span class="hn-bar-value">{{ num(f.downloadsAllTime) }}</span></div>
    <div class="hn-bar-sub">{{ num(f.originCount) }} models, {{ num(f.rankedRecipeCount) }} versions</div>
    <div class="hn-bar-track"><div class="hn-bar-fill" :style="{ width: bar(f.downloadsAllTime, families[0]?.downloadsAllTime) }"></div></div>
  </div>
</div>

## Formats

<div class="hn-bars">
  <div class="hn-bar" v-for="f in formats" :key="f.value">
    <div class="hn-bar-head"><span>{{ f.value }}</span><span class="hn-bar-value">{{ num(f.downloadsAllTime) }}</span></div>
    <div class="hn-bar-sub">{{ num(f.count) }} repositories</div>
    <div class="hn-bar-track"><div class="hn-bar-fill" :style="{ width: bar(f.downloadsAllTime, formats[0]?.downloadsAllTime) }"></div></div>
  </div>
</div>

## Model sizes

<div class="hn-bars">
  <div class="hn-bar" v-for="s in sizes" :key="s.value">
    <div class="hn-bar-head"><span>{{ s.value }} parameters</span><span class="hn-bar-value">{{ num(s.downloadsAllTime) }}</span></div>
    <div class="hn-bar-sub">{{ num(s.count) }} repositories</div>
    <div class="hn-bar-track"><div class="hn-bar-fill" :style="{ width: bar(s.downloadsAllTime, sizes[0]?.downloadsAllTime) }"></div></div>
  </div>
</div>

## Heretic versions

Which versions of Heretic produced the models people download.

<div class="hn-bars">
  <div class="hn-bar" v-for="v in versions.slice(0, 8)" :key="v.value">
    <div class="hn-bar-head"><span>Heretic {{ v.value }}</span><span class="hn-bar-value">{{ num(v.downloadsAllTime) }}</span></div>
    <div class="hn-bar-sub">{{ num(v.count) }} repositories</div>
    <div class="hn-bar-track"><div class="hn-bar-fill" :style="{ width: bar(v.downloadsAllTime, versions[0]?.downloadsAllTime) }"></div></div>
  </div>
</div>

## Creators

Top creators by downloads in the Directory index.

<table>
  <thead>
    <tr><th>#</th><th>Creator</th><th>Models</th><th>Downloads, all time</th><th>30 days</th></tr>
  </thead>
  <tbody>
    <tr v-for="(c, i) in creators" :key="c.username">
      <td>{{ i + 1 }}</td>
      <td><a :href="'https://huggingface.co/' + c.username">{{ c.username }}</a></td>
      <td>{{ num(c.totals.modelCount) }}</td>
      <td>{{ num(c.totals.allTimeDownloads) }}</td>
      <td>{{ num(c.totals.last30DaysDownloads) }}</td>
    </tr>
  </tbody>
</table>

## Where the numbers come from

* The headline figures are read from the [data file](https://heretic.sdad.pro/data/stats.json)
  that powers Heretic Live, updated roughly every 12 hours. They match
  [heretic.sdad.pro](https://heretic.sdad.pro) exactly, including its model and
  creator counts. This page re-checks the file every 10 minutes and picks up new
  snapshots automatically.
* The breakdowns come from the [hapi API](https://hapi.thevinod.lol/v1), whose
  Directory dataset refreshes several times a day. It covers repositories with
  corroborated model cards, so its download totals are lower than the Hub-wide
  numbers above.
* Downloads per day is the trailing 30-day total divided by 30. It is a derived
  average, not a live measurement.

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const LIVE = 'https://heretic.sdad.pro/data/stats.json'
const API = 'https://hapi.thevinod.lol/v1'
const REFRESH_MS = 10 * 60 * 1000

const live = ref(null)
const health = ref(null)
const index = ref(null)
const families = ref([])
const formats = ref([])
const sizes = ref([])
const versions = ref([])
const creators = ref([])
const checkedAt = ref(null)
const error = ref(null)
let timer

const num = (v) => (v == null ? '-' : Number(v).toLocaleString('en-US'))
const stamp = (v) => (v ? new Date(v).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '-')
const bar = (v, max) => `${max ? Math.min(Math.max((v / max) * 100, 1), 100) : 0}%`

async function get(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return response.json()
}

async function load() {
  try {
    const [li, hl, st, fa, fo, si, ve, cr] = await Promise.all([
      get(LIVE),
      get(`${API}/health`),
      get(`${API}/stats`),
      get(`${API}/families`),
      get(`${API}/formats`),
      get(`${API}/sizes`),
      get(`${API}/versions`),
      get(`${API}/creators?perPage=25`),
    ])
    live.value = li
    health.value = hl
    index.value = st.indexed
    families.value = [...fa.families].sort((a, b) => b.downloadsAllTime - a.downloadsAllTime)
    formats.value = [...fo.values].sort((a, b) => b.downloadsAllTime - a.downloadsAllTime)
    sizes.value = [...si.values].sort((a, b) => b.downloadsAllTime - a.downloadsAllTime)
    versions.value = [...ve.values].sort((a, b) => b.downloadsAllTime - a.downloadsAllTime)
    creators.value = cr.rows.slice(0, 8)
    checkedAt.value = new Date().toISOString()
    error.value = null
  } catch (e) {
    error.value = e.message || String(e)
  }
}

onMounted(() => {
  load()
  timer = setInterval(load, REFRESH_MS)
})

onUnmounted(() => clearInterval(timer))
</script>

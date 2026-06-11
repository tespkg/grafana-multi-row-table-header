# Multi Row Table Header

A Grafana panel plugin that renders query results as a simple table with a
**two-row header**. Columns that belong together (for example several measures
under the same year) are grouped under a shared top header, with their
individual labels shown in a second header row beneath it.

## How the two header rows are built

The plugin is fully data-driven — it reads the **display name of each field** and
splits it on a configurable delimiter:

```
<top header><delimiter><sub header>
```

- Text **before** the delimiter becomes the **top (group)** header.
- Text **after** the delimiter becomes the **sub** header (second row).
- Consecutive columns that share the same top header are merged into one
  spanning cell.
- A field name that does **not** contain the delimiter is rendered as a single
  column that spans both header rows (e.g. `company`, `Hydrocarbon`).

### Example

With the default delimiter (`\r`, a carriage return), these field names:

| Field name           | Top header  | Sub header |
| -------------------- | ----------- | ---------- |
| `company`            | company     | _(spans)_  |
| `Hydrocarbon`        | Hydrocarbon | _(spans)_  |
| `2015` + `\r` + `1P` | 2015        | 1P         |
| `2015` + `\r` + `2P` | 2015        | 2P         |
| `2016` + `\r` + `1P` | 2016        | 1P         |

render as:

```
| company | Hydrocarbon |       2015      |       2016      |
|         |             |   1P   |   2P   |   1P   |   2P   |
```

You produce these field names in your data source query (an alias, a transform,
or a `SELECT ... AS "2015<CR>1P"`). In the panel options you can type the
delimiter as an escape sequence — `\r`, `\n`, or `\t` are understood — so you do
not have to paste an invisible control character.

## Options

| Option           | Description                                                     | Default |
| ---------------- | -------------------------------------------------------------- | ------- |
| Header delimiter | Character(s) that split a column name into its two header rows. | `\r`    |
| Show row numbers | Prepend an auto-incrementing `#` column.                        | off     |
| Sticky header    | Pin both header rows while the table body scrolls.              | on      |

The first data frame returned by the query is rendered. Numeric columns are
right-aligned and formatted using their field's unit/decimals configuration.

## Development

```bash
npm install        # install dependencies
npm run dev        # build & watch the frontend
npm run server     # start Grafana in Docker with the plugin provisioned
npm run typecheck  # type-check
npm run lint       # lint
npm run e2e        # Playwright end-to-end tests (needs the dev server)
```

Open http://localhost:3000 — the provisioned **History & Forecast** dashboard
demonstrates the two-row header.

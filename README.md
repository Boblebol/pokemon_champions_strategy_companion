# Pokemon Champions Strategy Companion

Local web companion for Pokemon Champions team auditing.

## V1 Features

- Import a Pokemon Showdown paste.
- Choose Champions VGC, Champions BSS, or Champions OU.
- Review defensive and offensive team audit findings.
- See simple role detection and speed estimates.
- Rank demo meta threats from the selected format snapshot.
- Attempt a reference snapshot refresh and display explicit refresh results.

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

Build:

```bash
npm run build
```

## Data Notes

The first version ships with typed demo snapshots so the app works offline and the analysis pipeline is testable. The update button checks a public Pokemon Showdown reference endpoint and reports success or failure clearly; it does not replace the local snapshot during this V1 session.

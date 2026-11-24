# Functional guide
The optional local public-feed endpoint accepts only the names GitHub, GitLab, Bitbucket, and SourceForge. It uses fixed provider URLs and never receives a Groq key. The static host uses direct browser feeds when accessible and a dated JSON snapshot otherwise. All ranking and generation requests go from the browser to Groq. Results are accepted only when each group has exactly ten unique candidate IDs and all selected IDs came from that feed.

Candidate import accepts one or more platform keys. Each group needs 10–60 distinct records and an ISO timestamp. The example illustrates one record; add at least nine more. Optional record fields are description, date, kind, language and size.

```json
{
  "GitHub": {
    "scope": "Public search sorted by date of creation",
    "limitation": "Search index may lag",
    "retrievedAt": "2026-11-13T12:00:00Z",
    "records": [
      {"name": "sample project", "url": "https://github.com/example/project", "description": "Replace with observed metadata"}
    ]
  }
}
```

Imported groups are held for the current page session. A new successful refresh replaces the previous ranked snapshot. Generated planners keep notes while the companion is open; they do not persist them between reloads.

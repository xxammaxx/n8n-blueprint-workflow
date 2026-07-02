# Filter-Repo Execution

## Command
```
git filter-repo --path .playwright-mcp/ --invert-paths --force
```

## Result
| Property | Value |
|----------|-------|
| Exit Code | 0 |
| Commits parsed | 40 |
| New HEAD | 5993951 |
| Duration | 0.16 seconds |
| Path removed | `.playwright-mcp/` (--invert-paths) |
| Secrets output | NO |
| Origin removed by filter-repo | YES (re-added after) |

# package.json

```bash
npm i three@^0.184.0
npm i -D @types/three
```

three.js is loaded with a dynamic `import('three')` inside <GlobeMark>, so it is code-split
out of the main bundle and never runs on the server.

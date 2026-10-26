# Local development

Use Node.js 22 or later and run `npm run dev`, then open
http://127.0.0.1:3000. Set `PORT` to choose another port.

The local server serves `src/` and the generated JSON artifacts in
`build/contracts/`, matching the previous lite-server roots. Refresh the browser
after edits; automatic browser reload is no longer provided. The server binds
only to the local machine and is for development.

Run `npm run test:server` to check file serving and path containment.
Dependencies are no longer needed for the development server. Install and run
your Solidity toolchain separately when compiling or testing contracts.

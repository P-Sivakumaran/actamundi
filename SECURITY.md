# Security Policy

ActaMundi is a p2p application dealing with wallet-signed content and on-chain
governance contracts. If you find a security issue, please report it
privately rather than opening a public issue.

## Reporting a Vulnerability

Report via **GitHub Security Advisories**: open the
[Security tab](../../security/advisories/new) on this repository and submit a
private advisory. This notifies the maintainer without disclosing the issue
publicly.

Please include:
- A description of the vulnerability and its impact
- Steps to reproduce (or a PoC)
- Affected file(s)/commit

## Scope

- Application code in this repository (`app/`, `lib/`, `components/`, `contracts/`)
- Smart contracts in `contracts/` — especially around access control
  (`AuthorAccessController`, `BoardAccessController`) and the
  `TruthVerification` governance/timelock logic
- Signature verification in `lib/p2p/signing.ts` and article/moderation
  integrity checks

Out of scope: vulnerabilities requiring physical access, social engineering,
or issues in third-party dependencies (report those upstream — `npm audit`
findings not yet patched upstream are tracked separately, not a report target
here).

## Response

Best-effort — this is a single-maintainer project. Acknowledgment target is a
few days; fix timeline depends on severity.

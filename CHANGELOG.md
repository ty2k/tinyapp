# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2020-08-23
Major version update to deal with `bcrypt` [CVE-2020-7689](https://github.com/advisories/GHSA-5wg4-74h6-q47v). New major `ejs` version necessitates front-end view refactoring.
### Added
- `package-lock.json`
- `CHANGELOG.md`
- `.nvmrc` to specify Node version 12.16.2
### Changed
- Added `start` script to `package.json`
- Updates to dependencies:
  - `bcrypt` to v5.0.0
  - `body-parser` to v1.19.0
  - `cookie-session` to v1.4.0
  - `ejs` to v3.1.5
  - `express` to v4.17.1

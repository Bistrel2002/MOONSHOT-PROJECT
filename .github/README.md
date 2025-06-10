# GitHub Actions & Vale Configuration

## Overview

This directory contains the GitHub Actions workflows and Vale prose linting configuration for the LOC-INDOOR project.

## Vale Prose Linting

Vale is configured to automatically check the writing quality of all Markdown files in the repository using built-in Vale rules.

### Configuration Files

- **`.vale.ini`** - Main Vale configuration file with built-in rules only

### What Vale Checks

- **Basic Writing Quality** - Uses built-in Vale rules
- **Technical Term Recognition** - Project-specific vocabulary included
- **Markdown Formatting** - Basic markdown structure checks
- **Code Block Handling** - Ignores code snippets and technical patterns

### Simplified Configuration

The Vale setup uses only **built-in Vale rules** to avoid package dependency issues:

- ✅ **No external packages required** - works out of the box
- ✅ **Technical vocabulary included** - recognizes LOC-INDOOR terms
- ✅ **Code-aware** - ignores file extensions, URLs, code blocks
- ✅ **Lenient for technical docs** - disabled spelling and repetition checks

### Recognized Technical Terms

The configuration includes vocabulary for:
- **Project terms**: LOC-INDOOR, AR, beacons, Unity
- **Technical acronyms**: API, SDK, BLE, RSSI, GPS, WiFi
- **Platforms**: Android, iOS, AWS, MongoDB, PostgreSQL
- **Development**: CI, CD, UI, UX, WCAG, MVP, POI, CRUD

### Running Vale Locally

To install and run Vale locally:

```bash
# Install Vale (macOS)
brew install vale

# Install Vale (Linux)
wget -O- https://vale.sh/install.sh | bash

# Check all markdown files
vale *.md

# Check specific file
vale README.md
```

### GitHub Actions Integration

Vale runs automatically on:
- All push events to `main`, `code`, `documents` branches
- All pull requests to these branches

The Vale check will:
- Comment on pull requests with suggestions
- Not fail the build (set to `fail_on_error: false`)
- Only annotate modified lines in PRs

### Troubleshooting

**Error: "no .vale.ini file found"**
- ✅ **Fixed**: `.vale.ini` is now present in the root directory

**Error: "style 'Microsoft' does not exist"**
- ✅ **Fixed**: Now using built-in Vale rules only

**Error: "style packages not found"**
- ✅ **Fixed**: No external packages required

**False positives for technical terms**
- Technical terms are included in the `.vale.ini` vocabulary list
- Terms can be added directly to the `vocab` line in the configuration

### Benefits of Simplified Setup

- **Fast execution** - no package downloads needed
- **Reliable** - no dependency issues
- **Maintenance-free** - built-in rules are always available
- **Technical-friendly** - configured specifically for software documentation 
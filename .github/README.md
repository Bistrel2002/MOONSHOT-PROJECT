# GitHub Actions & Vale Configuration

## Overview

This directory contains the GitHub Actions workflows and Vale prose linting configuration for the LOC-INDOOR project.

## Vale Prose Linting

Vale is configured to automatically check the writing quality of all Markdown files in the repository.

### Configuration Files

- **`.vale.ini`** - Main Vale configuration file
- **`.github/styles/Vocab/LOC-INDOOR/accept.txt`** - Project-specific vocabulary

### What Vale Checks

- **Writing Style** - Uses Microsoft Writing Style Guide
- **Grammar** - Basic grammar and readability checks
- **Technical Terms** - Recognizes project-specific terminology
- **Markdown** - Specific rules for documentation files

### Custom Rules for Technical Documentation

The Vale configuration is tailored for technical documentation:

- Allows technical jargon and acronyms
- Recognizes code terms and file extensions
- Permits first-person writing where appropriate
- Flexible with passive voice in technical contexts

### Vocabulary

The accepted vocabulary includes:
- LOC-INDOOR specific terms (AR, beacons, Unity, etc.)
- Technical acronyms (API, SDK, BLE, RSSI)
- Platform names (Android, iOS, AWS, MongoDB)
- Development terms (CI/CD, JSON, HTTP, WebSocket)

### Running Vale Locally

To install and run Vale locally:

```bash
# Install Vale (macOS)
brew install vale

# Install Vale (Linux)
wget -O- https://vale.sh/install.sh | bash

# Sync style packages
vale sync

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

**Error: "style packages not found"**
- The GitHub Action automatically downloads required packages
- For local development, run `vale sync` first

**False positives for technical terms**
- Add new terms to `.github/styles/Vocab/LOC-INDOOR/accept.txt`
- Terms should be one per line, case-sensitive 
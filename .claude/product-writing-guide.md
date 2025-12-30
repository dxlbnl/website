# Product Page Writing Guide

## Core Philosophy
**Benefits first, technical credibility second.** Lead with what the user gets, support with how it works.

**Target audience**: Eurorack makers and engineers who care about capabilities and reliability, not spec sheets.

## Writing Principles

### 1. Benefits Before Technology
❌ **Don't**: "Uses TI LM62460 synchronous buck converter with 2.2MHz switching frequency"
✅ **Do**: "Silent power - 2.2 MHz switching stays above audible range (no PSU whine)"

### 2. Answer "So What?"
Every technical detail must explain what it does for the user.

- "48kHz/24-bit" → "Studio-quality audio"
- "Class Compliant UAC 1.0" → "Works instantly, no drivers"
- "Hardware sequencing interlock" → "Prevents module damage on power-up"

### 3. Outcome-Focused Headlines
Headlines describe what you can DO, not what's inside.

❌ "Dual Analog Current Visualizer"
✅ "See Your Power Draw in Real-Time"

### 4. Skip Unverified Claims
Don't claim specific measurements you haven't tested (e.g., "< 5mVpp ripple" if untested).
Keep it factual: "Multi-stage filtering" not "< 5mVpp ripple."

### 5. Avoid Implementation Details Without Benefits
❌ "INA2180 sensors and LM339 comparators" (who cares?)
✅ "Real-time current monitoring" (what you get)

Chip models only appear when they're proof points or selling features.

## Page Structure

```markdown
## Overview
Hook + value proposition (1-2 paragraphs)

## Key Benefit 1
Outcome-focused headline
What you can do with it
Brief tech explanation if needed

## Key Benefit 2
...

## Use Cases
Real-world scenarios (MORE important than box contents)

## Technical Specifications
Tables, hard numbers

## Status
Release info

## What's Included
Box contents (LESS important than use cases)
```

## Section-Specific Rules

### Overview
- Lead with the problem it solves
- 1-2 short paragraphs max
- No chip models here
- Jargon-light but not dumbed down

**Good example**:
> Ditch the bulky brick transformer. The Conduit PDX-2 powers your entire Eurorack case from any USB-C laptop charger - with studio-grade performance in just 4HP.

### Feature Sections
Start each section asking: "What can the user DO with this?"

**Structure each feature:**
1. Benefit statement
2. What you can do
3. Optional: brief technical explanation
4. Optional: comparison to alternatives

### Use Cases
Concrete scenarios beat abstract features.

**Format:**
- **Scenario type**: Specific actions user can take
- Use bullet points
- Be specific (not "record audio" but "record set without laptop")

### What's Included
Keep it factual. Don't claim to include items you won't ship.

## Tone & Voice

### Match Cyber Aesthetic
- Direct and punchy
- Terminal/system language where appropriate
- Technical but accessible
- No marketing fluff

**Good phrases**:
- "Inject massive power"
- "Zero-latency hardware routing"
- "Reactor Core display"

### Avoid Over-Engineering
❌ "Employs sophisticated dual-core heterogeneous processing architecture"
✅ "Dual-core: one for audio, one for storage - no dropouts"

## Common Mistakes to Avoid

### ❌ Component Lists Without Context
**Bad**:
> Uses INA2180 current sensors and LM339 comparators with translucent FR4 windows

**Good**:
> Real-time current display shows power draw at a glance

### ❌ Leading With Architecture
**Bad**:
> The AR-1 features a dual-core architecture with dedicated audio and storage paths

**Good**:
> Never drop a sample - dual-core design keeps audio isolated from file writes

### ❌ Spec Soup
**Bad**:
> 2.2 MHz switching, Pi-filter topology, 25mΩ ESR capacitors

**Good**:
> Silent power - 2.2 MHz switching (above audible), multi-stage filtering with low-ESR caps

### ❌ Technical Jargon Without Translation
**Bad**:
> Class Compliant UAC 1.0 interface

**Good**:
> Works instantly with any computer - no drivers (USB Audio Class 1.0)

## Frontmatter Template

```yaml
---
pageType: product
id: product-slug
name: Product Display Name
description: One-line benefit pitch (NOT feature list)
status: available | sold-out | coming-soon
category: Interface | Power | etc.
tags: [tag1, tag2, tag3]
tindieUrl: https://tindie.com/...
image: /images/products/...
price: 200  # USD, no decimals
specs:
  Width: 6 HP
  # Only specs that matter for comparison
  # Don't list every detail
---
```

**Description field**: Benefit-focused, NOT tech-focused
- ✅ "Power your Eurorack from a laptop charger - studio silence in 4HP"
- ❌ "High-density USB-C Eurorack power core with dual analog current visualization"

## Quick Reference: Benefits → Tech

| Tech Detail | User Benefit |
|-------------|--------------|
| 48kHz/24-bit | Studio-quality audio |
| Dual-core architecture | No dropouts during recording |
| Class Compliant UAC | Works instantly, no drivers |
| Hot-swap SD | Swap cards between performances |
| 2.2 MHz switching | No audible PSU whine |
| Hardware interlock | Prevents module damage |
| Zero-latency routing | Monitor without delay |
| USB-C PD | Power from laptop charger |

## Checklist Before Publishing

- [ ] Does the overview answer "what problem does this solve?"
- [ ] Are headlines outcome-focused (not component-focused)?
- [ ] Does every technical detail have a "so what?"
- [ ] Use cases come BEFORE "what's included"
- [ ] No chip models in overview or benefit sections
- [ ] No unverified performance claims
- [ ] Description is benefit-focused (not feature list)
- [ ] Removed any "other features" catch-all sections
- [ ] Section order: benefits → use cases → specs → included items

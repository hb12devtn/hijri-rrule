# Hijri RRULE Library - Development Prompt for Claude Code

## Role & Context

Act as a Senior Software Engineer specializing in date-time algorithms and internationalization. You will create a comprehensive JavaScript/TypeScript library that adapts the RFC 5545 iCalendar RRULE standard for the Hijri (Islamic) calendar, functionally mirroring the `jkbrzt/rrule` library.

---

## ⚠️ CRITICAL: Planning-First Approach

**Before writing ANY code, you MUST complete the following planning phases in order:**

### Phase 1: Architecture Design (Required Before Implementation)

Create and document:

1. **System Overview Diagram** - Outline the major components and their relationships
2. **Class Hierarchy** - Define all classes, their responsibilities, and inheritance/composition relationships
3. **Interface Definitions** - Specify all public APIs, method signatures, and return types
4. **Data Flow** - How RRULE strings are parsed → processed → converted to dates
5. **Edge Case Inventory** - List ALL lunar calendar edge cases you'll need to handle

### Phase 2: Technical Specification (Required Before Implementation)

Document your decisions on:

1. **Calendar Conversion Strategy** - Choose between:
   - `Intl.DateTimeFormat` with `u-ca-islamic`
   - Tabular Hijri algorithm
   - Astronomical calculation
   - Hybrid approach
   
   *Justify your choice with pros/cons*

2. **Month Length Handling** - How will you determine if a Hijri month has 29 or 30 days?

3. **RRULE Property Mapping** - For each property (FREQ, INTERVAL, BYMONTH, BYMONTHDAY, BYDAY, COUNT, UNTIL, etc.), document:
   - How it will be parsed
   - How it will be interpreted in Hijri context
   - Edge cases specific to that property

4. **Error Handling Strategy** - Define how invalid inputs and edge cases will be handled

### Phase 3: Implementation Plan (Required Before Coding)

Break down the implementation into discrete, testable units:

```
[ ] 1. Core calendar abstraction layer
[ ] 2. Hijri date arithmetic utilities  
[ ] 3. RRULE parser
[ ] 4. Recurrence iterator/generator
[ ] 5. Gregorian ↔ Hijri conversion utilities
[ ] 6. Edge case handlers
[ ] 7. Public API surface
[ ] 8. Tests for each component
```

**Only after completing Phases 1-3 should you begin writing code.**

---

## Implementation Requirements

Once planning is complete, your implementation must address:

### 1. Calendar Abstraction Layer

Define a class structure that abstracts calendar logic to support non-Gregorian systems. This should allow the core RRULE logic to work with any calendar system through a common interface.

### 2. RRULE Parsing

Implement parsing logic for RRULE properties where months 1-12 represent Muharram through Dhu al-Hijjah:

- `FREQ` (YEARLY, MONTHLY, WEEKLY, DAILY)
- `INTERVAL`
- `BYMONTH` (1 = Muharram, 9 = Ramadan, 12 = Dhu al-Hijjah)
- `BYMONTHDAY`
- `BYDAY`
- `COUNT`
- `UNTIL`
- `DTSTART`

### 3. Date Conversion

Integrate a conversion utility to map recurrence instances back to standard JavaScript `Date` objects. Consider using:
- `Intl.DateTimeFormat` with `u-ca-islamic` locale extension
- A tabular/algorithmic approach for environments without Intl support

### 4. Lunar Calendar Edge Cases

Specifically solve for:

- **Variable month lengths**: Handling `BYMONTHDAY=30` in months that only have 29 days
- **Leap year handling**: The Hijri leap year cycle (30-year cycle with 11 leap years)
- **Month boundary calculations**: When recurring events span month boundaries
- **Year length variations**: Hijri years are ~354 days vs ~365 Gregorian days

---

## Deliverables

1. **Planning Document** - Complete Phases 1-3 documentation
2. **Source Code** - Full implementation with TypeScript types
3. **Working Prototype** - Demonstrate generating the next 5 occurrences of an event recurring every year on the 1st of Ramadan (Ramadan = month 9)
4. **Test Cases** - Cover normal cases and edge cases
5. **Usage Examples** - Show common use patterns

---

## Example Output Format

Your response should be structured as:

```
## 1. Architecture Design
[Detailed planning from Phase 1]

## 2. Technical Specification  
[Detailed decisions from Phase 2]

## 3. Implementation Plan
[Ordered task breakdown from Phase 3]

## 4. Implementation
[Code, organized by component]

## 5. Demonstration
[Working example: next 5 occurrences of yearly event on 1st Ramadan]

## 6. Test Suite
[Comprehensive tests]
```

---

## Quality Checklist

Before considering the task complete, verify:

- [ ] All planning phases are documented
- [ ] Architecture decisions are justified
- [ ] Code follows the planned structure
- [ ] Edge cases from inventory are handled
- [ ] TypeScript types are comprehensive
- [ ] The Ramadan demonstration works correctly
- [ ] Tests cover the documented edge cases
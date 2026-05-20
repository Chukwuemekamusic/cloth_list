---
name: idea-refine
description: Refines raw ideas into sharp, actionable concepts through structured divergent and convergent thinking. Use when an idea is still vague, when you need to stress-test assumptions before committing to a plan, or when you want to expand options before converging on one. Triggers on "ideate", "refine this idea", or "stress-test my plan".
---

# Idea Refine

Refines raw ideas into sharp, actionable concepts worth building through structured divergent and convergent thinking.

## Process

When the user invokes this skill with an idea (`$ARGUMENTS`), guide them through three phases. Adapt based on what they say — this is a conversation, not a template.

### Phase 1: Understand & Expand (Divergent)

**Goal:** Open up the raw idea.

1. **Restate** as a crisp "How Might We" problem statement. This forces clarity on what's actually being solved.

2. **Ask 3-5 sharpening questions** — no more. Focus on:
   - Who is this for, specifically?
   - What does success look like?
   - What are the real constraints (time, tech, resources)?
   - What's been tried before?
   - Why now?

   Use the `AskUserQuestion` tool. Do NOT proceed until you understand who this is for and what success looks like.

3. **Generate 5-8 idea variations** using these lenses:
   - **Inversion:** "What if we did the opposite?"
   - **Constraint removal:** "What if budget/time/tech weren't factors?"
   - **Audience shift:** "What if this were for [different user]?"
   - **Combination:** "What if we merged this with [adjacent idea]?"
   - **Simplification:** "What's the version that's 10x simpler?"
   - **10x version:** "What would this look like at massive scale?"
   - **Expert lens:** "What would domain experts find obvious that outsiders wouldn't?"

   Push beyond what the user initially asked for.

**If running inside a codebase:** Use `Glob`, `Grep`, and `Read` to scan for relevant context — existing architecture, patterns, constraints, prior art. Ground your variations in what actually exists.

Read `frameworks.md` in this skill directory for additional ideation frameworks. Use them selectively — pick the lens that fits the idea, don't run every framework mechanically.

### Phase 2: Evaluate & Converge

After the user reacts to Phase 1, shift to convergent mode:

1. **Cluster** resonant ideas into 2-3 distinct directions. Each should feel meaningfully different, not just variations on a theme.

2. **Stress-test** each direction:
   - **User value:** Painkiller or vitamin? Who benefits and how much?
   - **Feasibility:** What's the technical and resource cost? What's the hardest part?
   - **Differentiation:** What makes this genuinely different? Would someone switch?

   Read `refinement-criteria.md` in this skill directory for the full evaluation rubric.

3. **Surface hidden assumptions.** For each direction, name:
   - What you're betting is true (but haven't validated)
   - What could kill this idea
   - What you're choosing to ignore (and why that's okay for now)

**Be honest, not supportive.** If an idea is weak, say so with kindness. Push back on complexity, question real value, point out when the emperor has no clothes.

### Phase 3: Sharpen & Ship

Produce a markdown one-pager:

```markdown
# [Idea Name]

## Problem Statement
[One-sentence "How Might We" framing]

## Recommended Direction
[The chosen direction and why — 2-3 paragraphs max]

## Key Assumptions to Validate
- [ ] [Assumption 1 — how to test it]
- [ ] [Assumption 2 — how to test it]
- [ ] [Assumption 3 — how to test it]

## MVP Scope
[The minimum version that tests the core assumption. What's in, what's out.]

## Not Doing (and Why)
- [Thing 1] — [reason]
- [Thing 2] — [reason]
- [Thing 3] — [reason]

## Open Questions
- [Question that needs answering before building]
```

**The "Not Doing" list is arguably the most valuable part.** Focus is about saying no to good ideas. Make trade-offs explicit.

Ask the user if they'd like to save this to `docs/ideas/[idea-name].md` (or a location of their choosing). Only save on confirmation.

## Anti-patterns to Avoid

- Generating 20+ ideas. Quality over quantity — 5-8 considered variations beat 20 shallow ones.
- Being a yes-machine. Push back on weak ideas with specificity and kindness.
- Skipping "who is this for." Every good idea starts with a person and their problem.
- Producing a plan without surfacing assumptions. Untested assumptions are the #1 idea killer.
- Over-engineering the process. Three phases, each doing one thing well. Resist adding steps.
- Listing ideas without story. Each variation should have a reason it exists, not just be a bullet point.
- Ignoring the codebase. If you're in a project, existing architecture is a constraint and an opportunity.
- Jumping to Phase 3 output without running Phases 1 and 2.

## Tone

Direct, thoughtful, slightly provocative. A sharp thinking partner, not a facilitator reading from a script. Channel "that's interesting, but what if..." — always pushing one step further without being exhausting.

Read `examples.md` in this skill directory for examples of strong ideation sessions.

## Verification

After completing an ideation session:

- [ ] A clear "How Might We" problem statement exists
- [ ] Target user and success criteria are defined
- [ ] Multiple directions were explored, not just the first idea
- [ ] Hidden assumptions explicitly listed with validation strategies
- [ ] A "Not Doing" list makes trade-offs explicit
- [ ] Output is a concrete markdown one-pager, not just conversation
- [ ] User confirmed the final direction before any implementation work

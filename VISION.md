# Vision

## ContextSpec

ContextSpec exists because AI coding agents are becoming capable enough to build software, but they still lack the context needed to make good product, business, engineering, and quality decisions.

The bottleneck is no longer only code generation.

The bottleneck is context.

## The Problem

Modern AI agents can read files, edit code, run tests, and help implement features. But in real product development, the most important knowledge is often not inside the codebase.

It lives in:

- product principles
- business constraints
- growth learnings
- monetization decisions
- customer promises
- engineering tradeoffs
- QA expectations
- historical decisions
- team habits
- lessons from previous failures

Today, this context is usually scattered across documents, chats, tickets, meetings, and people’s memory.

As a result, every new AI session starts with the same problem:

> The agent can work, but it does not know enough about why the work matters.

Builders repeatedly explain the same background. Teams manually paste product context into coding tools. Agents make reasonable local decisions that violate broader product, business, or organizational intent.

This creates a new kind of software development bottleneck: not a lack of intelligence, but a lack of structured, reusable, role-aware context.

## Our Belief

We believe AI-native software development needs a dedicated context layer.

Not just a knowledge base.

Not just a project management tool.

Not just a prompt library.

Not just a multi-agent framework.

A context layer should help agents understand:

- what the product is
- who the users are
- what the current priorities are
- what principles must be preserved
- what tradeoffs have already been made
- what each role is responsible for
- what good output looks like
- what should not be changed
- how work should be reviewed and accepted

Context should be structured, versioned, reviewable, and reusable.

It should live close to the work.

It should be usable by both humans and agents.

## The Vision

ContextSpec aims to become the role-based context layer for AI-native product development.

It helps solo builders and small teams turn their product, business, engineering, QA, and decision knowledge into structured context that coding agents can actually use.

Instead of repeatedly explaining background to Claude Code, Codex, or other coding agents, teams should be able to define their context once and reuse it across workflows.

A builder should be able to ask:

> Review this feature from a Growth perspective.

And the agent should automatically understand the relevant product context, growth goals, funnel metrics, past experiments, and output format.

A team should be able to ask:

> Create an engineering handoff for this initiative.

And the agent should understand the product brief, business constraints, acceptance criteria, domain context, and engineering conventions.

A founder should be able to ask:

> What is the current project status?

And the agent should reason over active initiatives, open decisions, blockers, pending reviews, and next actions.

The long-term goal is to make AI agents behave less like stateless coding tools and more like collaborators who understand the product, the business, the team, and the history behind the work.

## What ContextSpec Is

ContextSpec is a local-first framework for organizing agent-ready context.

It provides a structure for:

- product and project context
- role definitions
- domain knowledge
- active initiatives
- project constraints
- decision records
- long-term memory
- review workflows
- handoff workflows
- acceptance and retro workflows

Its core idea is simple:

> Define context once. Compile it into the right context pack for the right agent, role, and task.

ContextSpec is designed to work with tools like Claude Code and Codex, not replace them.

It acts as the source of truth for role-based context, while coding agents continue to do the implementation work.

## What ContextSpec Is Not

ContextSpec is not a replacement for project management tools.

It is not a replacement for Notion, Confluence, Linear, Jira, GitHub Issues, or a company wiki.

It is not trying to simulate a company full of autonomous AI employees.

It is not a generic multi-agent orchestration framework.

It is not a place to dump every document, meeting note, or chat log.

ContextSpec is focused on one specific problem:

> How do we give AI agents the right structured context for the role and task they are performing?

## Who We Build For First

ContextSpec is built first for AI-native solo founders, independent builders, and small product teams.

These users often work across many roles at once:

- product manager
- engineer
- growth manager
- monetization owner
- QA reviewer
- project coordinator

They already use AI coding agents, but they need those agents to understand more than code.

They need agents that understand product intent, business constraints, role expectations, and historical decisions.

ContextSpec helps them create a reusable context system without requiring a large organization, complex process, or heavy tooling.

## Principles

### 1. Context before execution

Agents should understand the relevant context before making changes.

A well-structured context pack should come before implementation, review, or handoff.

### 2. Roles are responsibility boundaries, not personas

A role is not just a writing style or personality.

A role defines:

- what the agent should care about
- what context it needs
- what it can review
- what it should output
- what it cannot decide

### 3. Local-first and versioned

Context should live close to the project and be easy to review, diff, and version.

Plain files are a feature, not a limitation.

### 4. Human-confirmed memory

Long-term memory should be curated.

Agents may suggest updates, but important context should be reviewed and accepted by humans before becoming part of the source of truth.

### 5. Useful before intelligent

The first goal is not to build fully autonomous agents.

The first goal is to make existing agents more useful by giving them better context.

### 6. Integrate, do not replace

ContextSpec should work with Claude Code, Codex, OpenSpec, GitHub, Linear, and other tools.

It should provide the context layer, not replace the entire development workflow.

### 7. Small teams first

The framework should be simple enough for one person and structured enough for a small team.

If it only works for large organizations, it has failed the first users.

## The Future

As AI agents become more capable, the quality of their work will increasingly depend on the quality of the context they receive.

The teams that manage context well will be able to move faster, make better decisions, and collaborate with agents more effectively.

ContextSpec aims to make that possible.

We imagine a future where every serious AI-native project has a structured context layer:

- product context
- role context
- domain context
- initiative context
- project context
- memory context

And every agent task begins by loading the right slice of that context.

In that future, coding agents do not just edit files.

They understand why the work matters.

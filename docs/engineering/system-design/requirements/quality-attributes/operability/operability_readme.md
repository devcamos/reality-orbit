# Operability

**Parent:** [Quality Attributes](../quality-attributes_readme.md)  
**Level:** L3  
**Status:** Decision

## Purpose

Operability asks a practical question: can an authorised engineer who did not build the system deploy it, understand its state, diagnose a failure, change approved configuration, and recover it safely?

It is the parent quality attribute behind “can someone else run and manage this system?” and the antidote to a design that only works on the creator's machine.

## Subdimensions

- **Deployability:** a repeatable standard path builds, releases, and rolls back an artefact.
- **Observability:** logs, metrics, traces, dashboards, alerts, and ownership make system state visible.
- **Recoverability:** documented, tested steps restore a known service or data failure safely.
- **Supportability:** access, runbooks, escalation routes, and ownership are clear.
- **Configurability:** approved behaviour can change without hidden local steps or a code release.

## Child artefacts

| L4 artefact | Purpose |
| --- | --- |
| [Independent-operator readiness](independent-operator-readiness.md) | A small quality-attribute scenario and evidence plan |

## Evidence rule

A deployment or landscape diagram explains the operating context, but it is not enough on its own. Operability needs demonstrated evidence: a separate engineer follows the documented path and records the result.

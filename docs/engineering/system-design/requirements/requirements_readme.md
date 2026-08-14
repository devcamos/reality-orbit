# Requirements

**Parent:** [System Design](../system-design_readme.md)  
**Level:** L1  
**Status:** Decision

## Purpose

Requirements state the outcome that a system must deliver and the qualities it must achieve. They are inputs to architecture, delivery, and acceptance evidence; they are not the architecture itself.

## Children

| Child | Answers | Current example |
| --- | --- | --- |
| [Functional Requirements](functional-requirements/functional-requirements_readme.md) | What must the system enable someone or something to do? | Add a shopping-list item |
| [Quality Attributes](quality-attributes/quality-attributes_readme.md) | How well must it work, and under what constraints? | An independent engineer can run and recover it |

## Writing rule

A useful requirement is observable and testable. State the actor or source, the behaviour or stimulus, the expected outcome, and the evidence that will show it happened.

Do not hide an architecture choice inside a requirement unless that choice is itself a required constraint. For example, “an operator can recover the service from documented steps” is a quality requirement; “use Kubernetes” is normally a design decision.

## Relationship

Functional requirements and quality attributes are paired:

> A signed-in shopper can add a named item to a shopping list.

> An engineer who did not build the service can deploy, diagnose, and recover that capability using documented steps.

The first defines behaviour. The second defines the operational standard for that behaviour.

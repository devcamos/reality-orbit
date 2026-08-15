# Functional Requirements

**Parent:** [Requirements](../requirements_readme.md)  
**Level:** L2  
**Status:** Decision

## Purpose

Functional requirements define **what** users, administrators, and connected systems must be able to do. They describe observable capabilities and outcomes, including the rules and error behaviour that make the outcome correct.

## Functional-requirement map

The functional area is organised into at most five capability families:

1. **User capabilities**: actions a user can complete.
2. **Business workflows**: validation, decisions, approvals, and process state.
3. **Communication and outputs**: notifications, reports, exports, and generated documents.
4. **Integration capabilities**: inbound and outbound APIs, events, files, and reconciliation.
5. **Administration**: users, roles, configuration, feature controls, and governance actions.

Only **User Capabilities** is materialised in this learning increment.

## Child artefacts

| Child | Purpose |
| --- | --- |
| [User Capabilities](user-capabilities/user-capabilities_readme.md) | Functional behaviour initiated by a user |
| [Explore the selected ontology node](user-capabilities/explore-selected-ontology-node.md) | Small L4 Reality Orbit example using a scenario and sequence diagram |

## Requirement-writing test

A good functional requirement answers:

- **Actor:** who performs the action?
- **Capability:** what can they do?
- **Object:** what record, process, or information is affected?
- **Rule:** what decisions or constraints apply?
- **Outcome:** what successful result is expected?
- **Exception:** what happens when it cannot complete?

A functional requirement should normally be supported by an acceptance scenario and, where interaction matters, a sequence diagram. It should reference the relevant C4 view in the Architecture branch rather than duplicate it.

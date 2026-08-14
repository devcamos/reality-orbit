# Quality Attributes

**Parent:** [Requirements](../requirements_readme.md)  
**Also known as:** Non-functional requirements (NFRs)  
**Level:** L2  
**Status:** Decision

## Purpose

Quality attributes define **how well** a system must work and the constraints it must meet. They are architecture drivers: a design trade-off should be traceable to a quality requirement and an observable measure.

## Quality-attribute map

The quality area uses these five families:

1. **Operability**: deployability, observability, recoverability, supportability, and safe configuration.
2. **Reliability and resilience**: availability, fault tolerance, integrity, and disaster recovery.
3. **Maintainability and change**: modifiability, testability, reusability, and understandability.
4. **Security and governance**: identity, access, privacy, auditability, and compliance.
5. **Efficiency and experience**: performance, scalability, usability, accessibility, portability, and compatibility.

Only **Operability** is materialised in this learning increment.

## Child artefacts

| Child | Purpose |
| --- | --- |
| [Operability](operability/operability_readme.md) | Whether someone other than the builder can run and manage the system |
| [Independent-operator readiness](operability/independent-operator-readiness.md) | L4 scenario, operational context diagram, and handover evidence |

## Quality-attribute scenario template

A measurable quality requirement names:

| Element | Question |
| --- | --- |
| Source | Who or what creates the stimulus? |
| Stimulus | What happens? |
| Environment | In what conditions? |
| Artifact | What part of the system is affected? |
| Response | What must the system or team do? |
| Response measure | How will success be measured? |

This structure turns vague goals such as “make it reliable” into a design constraint that can be tested.

## Reuse rule

Do not abstract for imagined reuse. Keep a clean boundary for one real use case. Extract a shared component only when a second proven use case has the same stable need.

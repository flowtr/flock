# Flock

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Linting By ESLint](https://raw.githubusercontent.com/aleen42/badges/master/src/eslint.svg)](https://eslint.org)
[![Typescript](https://raw.githubusercontent.com/aleen42/badges/master/src/typescript.svg)](https://typescriptlang.org)

**Flock** (Flowtr Caddy K8S) is an easy-to-use alternative to the nginx ingress controller for Kubernetes.

When ran, Flock scans for new kubernetes services.
If any services are found containing a `flock.host` label,
Flock automatically deploys a caddy instance on port 80 and 443 in your cluster that
will proxy your domain name to an internal kubernetes service.
Flock can also be confiured to run at an interval.

The main benefit of using flock over nginx-ingress-controller is automatic ssl without something like cert-manager.
You will not have to specify manual certificates either - all you need is a kubernetes service and some labels.

## Usage

Flock is currently in development, so it should not be used in production yet.
However, you can explore the source code in the mean time.

## Progress

-   [ ] CI Tests (preferabbly through Github Actions or Drone CI)
-   [ ] CLI (WIP)

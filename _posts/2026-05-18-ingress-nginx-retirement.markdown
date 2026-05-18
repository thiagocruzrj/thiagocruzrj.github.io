---
layout: post
title: "ingress-nginx Has Retired. No, You Can't Ignore This One."
description: "March 2026 came and went. ingress-nginx is archived, no patches are coming, and the CVEs are already stacking up. If you didn't migrate yet, this is your wake-up call."
date: 2026-05-18 12:05:00 +0300
image: '/images/2026-05-18-ingress-nginx-retirement/ingress-nginx-retirement.png'
tags: [Kubernetes, Ingress, Cilium, AKS, Platform Engineering, Migration, Networking]
---

You know the moment. You open Slack on a Monday morning, someone has dropped a link with the subject line "PSA: ingress-nginx is being deprecated," and your immediate instinct is to close the tab, get another coffee, and let future-you deal with it.

<p align="center">
  <img src="/images/2026-05-18-ingress-nginx-retirement/not-my-problem.gif" width="500"><br>
</p>

I get it. The Kubernetes ecosystem has cried wolf on deprecations so many times that we have collectively developed a healthy immune response to them. Deprecated APIs get extended. "End of support" turns out to mean "end of official support while the community quietly keeps shipping patches." You learn to wait.

Well. It is now May 2026. The deadline was March 2026. The repository was archived on March 24, 2026 and is now sitting read-only in `kubernetes-retired/`. Future-you is present-you, and present-you is running an unpatched ingress controller with known CVEs in your traffic path.

On November 11, 2025, the Kubernetes project announced the retirement of ingress-nginx, the most widely deployed ingress controller in the ecosystem. Best-effort maintenance through March 2026, and then: nothing. No releases, no bugfixes, no security patches. The repositories moved to read-only in `kubernetes-retired/`. The project is done.

## A Brief History of How We Got Here

ingress-nginx was never meant to be infra (like JS on backend). It started as a community controller to implement the Kubernetes Ingress spec using NGINX, and it somehow ended up in front of a significant fraction of all production Kubernetes traffic on the planet.

The problem is that "community project" in this context means "1 to 2 developers working on this on nights and weekends." Not a company, not a funded CNCF team. Two people, volunteer time, carrying one of the most critical traffic routing components in the ecosystem.

That is a bus factor of 1, dressed up in a GitHub org badge.

<p align="center">
  <img src="/images/2026-05-18-ingress-nginx-retirement/this-is-fine.gif" width="500"><br>
</p>

The technical debt didn't help. The `snippets` annotation, which lets you inject arbitrary NGINX configuration into the controller, was once celebrated as flexibility. It is now recognized as a fairly serious security risk, since it lets cluster users with the right permissions push raw NGINX directives into a shared ingress controller. Fixing it properly would require breaking changes that the maintainers simply didn't have the bandwidth to manage.

There was an internal effort to build a replacement called InGate. It never shipped. So here we are.

## What "Retired" Actually Means for Your Cluster

The retirement announcement was polite about it. Let me be less polite:

- No new releases. The version you have is the version you keep forever.
- CVEs are not being patched. Any new NGINX vulnerability, any new controller-level issue, accumulates unaddressed.
- The Helm chart is frozen at its last state. Container images stay where they are.
- The repositories are read-only and archived. Nobody is home.

Your existing deployments kept running on March 25, 2026. The day after archival, nothing visibly broke. That is also true today, in May 2026. And that is exactly the problem, because "nothing visibly broke" and "you are not being actively exploited right now" are two very different sentences.

The CVEs are stacking up. Keep reading.

## Check If You're Affected

Before anything else, find out what you're actually running:

```bash
kubectl get pods --all-namespaces --selector app.kubernetes.io/name=ingress-nginx
```

If that returns nothing, you might be fine. If it returns pods, you have work to do. You can also check your Helm releases:

```bash
helm list --all-namespaces | grep ingress-nginx
```

Worth doing this across every cluster you own, not just the one you remember installing it on two years ago.

## The Receipts: Known Vulnerabilities, No Patch Path

For anyone who needs something more concrete than "trust me, it's bad," here is the vulnerability track record: some discovered before archival with last-minute patches that many clusters never applied, and some with no fix path whatsoever.

<p align="center">
  <img src="/images/2026-05-18-ingress-nginx-retirement/receipts.gif" width="500"><br>
</p>

### CVE-2025-1974: CVSS 9.8 (Critical)

This one predates the archival but deserves to be on every radar. An unauthenticated attacker with access to the pod network can achieve arbitrary code execution inside the ingress-nginx controller, with potential access to all Secrets in the cluster. Full compromise territory.

Published March 24, 2025. Still showing no patch resolution on NVD as of April 2026, well after the project was archived. If you are not on a version that explicitly addressed this, you are exposed.

**Link:** [nvd.nist.gov/vuln/detail/CVE-2025-1974](https://nvd.nist.gov/vuln/detail/CVE-2025-1974)

### CVE-2026-3288: CVSS 8.8 (High)

Published March 9, 2026, two weeks before archival. The `rewrite-target` annotation can be abused to inject arbitrary NGINX configuration, leading to code execution in the controller and disclosure of cluster Secrets. A patch landed in versions 1.13.8 and 1.14.4, which were released in the final days before the project shut down.

If you are not on exactly those versions or newer, you are running a publicly documented, remotely exploitable vulnerability with no future patch path.

**Link:** [nvd.nist.gov/vuln/detail/CVE-2026-3288](https://nvd.nist.gov/vuln/detail/CVE-2026-3288)

### CVE-2026-4342: CVSS 8.8 (High)

Published March 19, 2026, five days before archival. A combination of Ingress annotations can be chained to inject configuration into NGINX, resulting in code execution and Secret exposure. Patched in 1.13.9 and 1.14.5.

Same story: if you are not on those specific versions, the vulnerability is known, it is exploitable, and nobody is releasing a fix.

**Link:** [nvd.nist.gov/vuln/detail/CVE-2026-4342](https://nvd.nist.gov/vuln/detail/CVE-2026-4342)

Notice a pattern? All three involve annotation-based configuration injection. The `snippets` annotation problem that the maintainers flagged as unrepairable has been propagating through the annotation surface area one CVE at a time. And the annotation injection pattern in ingress-nginx is wide enough that security researchers have not finished finding instances of it.

## AKS Users

If you're running AKS, you probably fall into one of two camps.

**Camp A: DIY Helm install.** You ran `helm install ingress-nginx ingress-nginx/ingress-nginx` at some point, you have a `LoadBalancer` service sitting in front of it, and this is entirely your problem to solve.

**Camp B: Application Routing Add-on.** AKS's managed ingress experience (`--enable-app-routing`) uses community ingress-nginx under the hood. As of May 2026, Microsoft has not publicly announced a replacement for this add-on. Check the AKS release notes before assuming you're covered — do not treat silence as a migration plan.

Either way, the deadline has already passed. Staying on ingress-nginx is not a strategy, it is a gamble on how long before an unpatched CVE becomes your incident.

## Your Options

Here's an honest view of where you can go:

| Controller | Still Maintained | Ingress API | Gateway API | AKS-Friendly | Notes |
|---|---|---|---|---|---|
| **Cilium** | Yes | Yes | Yes | Yes | Recommended. eBPF-based, AKS native dataplane support |
| **NGINX Inc (nginx/nginx-ingress)** | Yes | Yes | Partial | Yes | Different project from community ingress-nginx, F5-backed |
| **AGIC** | Yes | Yes | No | Azure-specific | Tied to Azure Application Gateway, good for Azure-native shops |
| **App Gateway for Containers** | Yes | No | Yes | Azure-specific | Microsoft's native Gateway API implementation for AKS |
| **Traefik** | Yes | Yes | Yes | Yes | Popular in smaller clusters, good CRD-based config |

Cilium is the right answer for most people, for reasons that go beyond just replacing ingress-nginx.

## Why Cilium Is the Right Move

Because I want to talk about it, I'm joking, Cilium is not just an ingress controller. It's a CNI plugin built on eBPF that handles your cluster networking at the kernel level, and it ships with a built-in Ingress Controller and Gateway API support as part of the same installation.

The practical upside for you:

- **One less component.** If you're already running Cilium as your CNI (which you should be), the ingress controller is already there. You're not adding a new deployment, you're enabling a feature.
- **Forward compatibility.** Cilium supports the Gateway API natively, which is where the Kubernetes networking world is actually heading. Migrating to Cilium's Ingress now and then moving to Gateway API on your own timeline is a much cleaner story than bouncing between controllers.
- **AKS native support.** Azure CNI Powered by Cilium is a first-class AKS option. If you're on AKS, you can run Cilium as your network dataplane and get the ingress controller with it.
- **Security posture.** eBPF-based networking gives you visibility and policy enforcement at a level that NGINX-based ingress never could.

<p align="center">
  <img src="/images/2026-05-18-ingress-nginx-retirement/upgrade.gif" width="500"><br>
</p>

## Migrating to Cilium on AKS

Here's a practical path forward. This assumes you're on AKS with an existing ingress-nginx setup.

#### Step 1: Enable Cilium as your network dataplane

If you're creating a new cluster, use Azure CNI Powered by Cilium from the start (That's a demonstration, please, use Terraform or Crossplane):

```bash
az aks create \
  --resource-group my-rg \
  --name my-cluster \
  --network-plugin azure \
  --network-plugin-mode overlay \
  --network-dataplane cilium
```

For existing clusters, an in-place upgrade to Cilium as the dataplane is supported on AKS. Check the [AKS release notes](https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium) for the exact migration path, as it varies by current CNI configuration.

#### Step 2: Enable the Cilium Ingress Controller

Once Cilium is your CNI, enable the Ingress Controller via Helm values:

```yaml
ingressController:
  enabled: true
  loadbalancerMode: dedicated  # or shared
  service:
    annotations:
      service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path: /healthz
```

Apply to your existing Cilium installation:

```bash
helm upgrade cilium cilium/cilium \
  --namespace kube-system \
  --reuse-values \
  --set ingressController.enabled=true \
  --set ingressController.loadbalancerMode=dedicated
```

#### Step 3: Update your Ingress resources

Your existing Ingress manifests need their `ingressClassName` updated:

```yaml
# Before
spec:
  ingressClassName: nginx

# After
spec:
  ingressClassName: cilium
```

That's usually it. Cilium's Ingress Controller is spec-compliant, so standard Ingress resources translate cleanly. If you were relying heavily on ingress-nginx-specific annotations (`nginx.ingress.kubernetes.io/*`), you'll need to map those to Cilium equivalents or CiliumEnvoyConfig resources, which is the larger part of the migration effort.

#### Step 4: Validate before cutting over

Run both controllers in parallel during the migration. Create a test Ingress with `ingressClassName: cilium`, validate it resolves and routes correctly, then flip production traffic over. Don't delete the ingress-nginx deployment until you're confident.

```bash
# Check Cilium Ingress is serving correctly
kubectl get ingress -A
kubectl describe ingress my-ingress -n my-namespace
```

## A Note on ingress2gateway

If you want to go all the way to Gateway API (not just switch controllers), the [ingress2gateway 1.0](https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release/) tool automates the conversion of Ingress resources to Gateway API resources. It understands ingress-nginx annotations and maps them to the closest Gateway API equivalent.

```bash
ingress2gateway print --input-file my-ingress.yaml --providers cilium
```

This is worth considering if you have the appetite for it. Gateway API is significantly more expressive than the Ingress spec, and Cilium's Gateway API support is mature. But don't let the perfect be the enemy of the good. Getting off ingress-nginx is the priority.

## The Real Lesson Here

ingress-nginx's retirement is not a Kubernetes problem. It's an open-source sustainability problem wearing a Kubernetes costume.

We built production-critical infrastructure on top of heroic volunteerism, celebrated it as "community-owned," and then acted surprised when two people couldn't sustain it indefinitely alongside their actual jobs. This will happen again. It has happened before. The Kubernetes ecosystem is full of ingress controllers, CNI plugins, and storage drivers maintained by one or two people who are one bad quarter away from walking away.

<p align="center">
  <img src="/images/2026-05-18-ingress-nginx-retirement/lesson-learned.gif" width="500"><br>
</p>

The practical takeaway is simple: before you adopt a component for production, check the contributor graph, not just the star count. A project with 15,000 stars and 2 active maintainers is not the same as a project with 8,000 stars and a funded team behind it.

Cilium has the CNCF backing, the commercial support from Isovalent (now Cisco), and a contributor base that isn't going anywhere. That's worth something when you're betting your cluster's traffic routing on it.

It is May 2026. March already happened. The migration is not a future task anymore, it is overdue work. The longer you wait, the more CVEs accumulate, and the more those CVEs go from "known issue" to "incident report."

You already know what you need to do.

## References

- [Ingress NGINX Retirement Announcement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
- [kubernetes-retired Organization](https://github.com/kubernetes-retired/)
- [ingress2gateway 1.0 Release](https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release/)
- [Cilium Ingress Controller Documentation](https://docs.cilium.io/en/stable/network/servicemesh/ingress/)
- [Cilium Gateway API Support](https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/)
- [Azure CNI Powered by Cilium (AKS)](https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [CVE-2025-1974 — Critical 9.8, arbitrary code execution via pod network](https://nvd.nist.gov/vuln/detail/CVE-2025-1974)
- [CVE-2026-3288 — High 8.8, rewrite-target annotation injection](https://nvd.nist.gov/vuln/detail/CVE-2026-3288)
- [CVE-2026-4342 — High 8.8, annotation combination injection](https://nvd.nist.gov/vuln/detail/CVE-2026-4342)

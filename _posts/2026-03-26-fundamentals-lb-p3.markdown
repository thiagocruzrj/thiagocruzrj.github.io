---
layout: post
title: Let's talk about Load Balancers (Part 3)
description: "The third and final part. High availability, scalability, latency tricks, and the challenges nobody tells you about until something breaks in prod."
date: 2026-03-26 11:24:00 +0300
image: "/images/2026-03-26-fundamentals-lb-p3/amz-load-balancer.png"
toc: false
tags: [System Design, Load Balancing, Fundamentals]
---

Welcome back. If you missed [Part 1](https://thiagocruzrj.github.io/2026-01-28-fundamentals-lb/) or [Part 2](https://thiagocruzrj.github.io/2026-01-28-fundamentals-lb-p2/), go read them first. This is the third and final part of the series. We've been building up a solid foundation, and Part 3 is where things get serious. We're going deep on keeping your load balancer alive when everything around it is dying, making it scale without crying, squeezing every millisecond out of latency, and being honest about all the ways it can still ruin your week.

## High Availability and Fault Tolerance

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/multitask-alien.gif" alt="A really busy guy" width="500"><br>
  <em>Designed to keep running. Even when it really doesn't want to.</em>
</p>

#### Redundancy and Failover Strategies

The load balancer is supposed to be the thing that keeps your system alive. So what happens when the load balancer itself dies? That's the first uncomfortable question every serious architecture has to answer. The answer is redundancy: you don't run one load balancer, you run multiple.

There are two main approaches to this, and they have very different tradeoffs.

1. **Active-Passive Configuration**: One load balancer is doing all the work (active) while the other sits on standby ready to take over (passive). They share a virtual IP address. If the active node goes down, a failover mechanism, usually something like VRRP (Virtual Router Redundancy Protocol), detects the failure and promotes the passive node to active, reassigning the VIP to it. It is simple to handle the traffic, but the passive node is just burning electricity and doing nothing until disaster strikes.

2. **Active-Active Configuration**: Both load balancers are handling traffic simultaneously. Incoming requests are distributed between them, usually via DNS round-robin or an upstream router. If one fails, the other takes the full load. This gives you better resource utilization and higher throughput since you're using all your capacity, not half. 

#### Health Checks and Monitoring

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/monitoring-you.gif" alt="Health Checks and Monitoring" width="500">><br>
  <em>A load balancer that can't see sick backends is just a fancy random function</em>
</p>

A load balancer that doesn't know which of its backends are healthy is just a random traffic distributor that occasionally sends requests into the void. Health checks are what make the difference between a smart system and an expensive coin flip.

There are three levels of health checks, each more thorough than the last:

- **TCP health checks**: The LB opens a TCP connection to the backend port. If the handshake succeeds, the server is considered up. Fast and cheap, but it only tells you the server is listening, not that it's actually processing requests correctly.

- **HTTP health checks**: The LB sends an HTTP request (usually a GET to a `/health` or `/ping` endpoint) and expects a specific status code back, typically 200. This confirms the application is actually responding, not just the OS. Most web apps should be using this at minimum.

- **Application-aware health checks**: The most thorough option. The LB validates not just the response code but the response body, checks if the application can reach its database, verifies cache connectivity, or any other business-logic check you define. If your app returns 200 but the database connection pool is exhausted, this is the check that catches it.

#### Synchronization and State Sharing

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/communication-synchronization.gif" alt="Health Checks and Monitoring" width="450">><br>
</p>

- **Centralized Configuration Management** : The cleanest solution is to not store configuration locally on the LB nodes at all. Instead, use a centralized store, tools like **Consul**, **etcd**, or **ZooKeeper**, as the single source of truth. Both nodes read from there, so any change is immediately reflected across all of them. This is especially powerful in dynamic environments like Kubernetes, where the LB watches the config store, which itself watches the cluster state. Backend pods appear and disappear, and the LB just keeps up, no manual updates needed.

- **State Sharing and Replication**: Some LB state needs to be shared across nodes in real time, session tables, rate limiting counters, connection tracking data. Without it, you get inconsistent behavior: rate limits that reset when a request hits the other node, sticky sessions that break on failover. The solution is a shared backend like a Redis cluster or distributed cache to synchronize that state, though it introduces latency for lookups. The design question is always what's worth sharing: rate limiting counters at 95% accuracy might be fine, session tokens that break on failover are not.

## Scalability and Performance

#### Horizontal and Vertical Scaling of Load Balancers
The irony of load balancers is that they can themselves become the bottleneck they were designed to prevent. At some point, even the traffic distributor needs to scale.

- **Vertical Scaling** : Vertical scaling means giving your LB more resources, more CPU, RAM, faster NICs. Easy to do, no architectural changes. The ceiling is real though: there's only so much hardware you can fit in one box, it gets expensive fast, and a bigger machine is still a single point of failure. Valid short-term, not a long-term answer.

- **Horizontal Scaling**: Horizontal scaling means adding more LB nodes and spreading traffic across them via DNS round-robin, anycast, or an upstream router. This is the model cloud providers use, **AWS NLB** scales horizontally under the hood automatically, handling millions of requests per second without any intervention. When you roll your own, you have to plan session consistency, traffic distribution, and failed node removal yourself. The operational overhead is real, but there's no theoretical ceiling. You keep adding nodes as long as you need to.

#### Connection and Request Limits

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/threshold.gif" alt="Check your limits" width="450"><br>
</p>

Load balancers have limits, and ignoring them is how you create cascading failures on your busiest day. Every LB has a maximum number of concurrent connections, exceed it and new connections get dropped. Software LBs like NGINX can be tuned, but the defaults are often not production-ready. Rate limits are equally important: without them, a single misbehaving client or bot swarm can starve legitimate traffic. The practice is straightforward, know your limits, set them below the failure point, monitor utilization, and alert before you hit the ceiling.

#### Caching and Content Optimization

A load balancer that just routes traffic is leaving performance on the table. Modern LBs, especially at Layer 7, can be configured to cache responses and optimize content delivery before a request ever reaches your backend.

- **Response caching** at the LB level means that for cacheable responses , static assets, API responses with appropriate Cache-Control headers , the LB can serve subsequent requests directly from cache without touching the backend. This reduces backend load dramatically for read-heavy workloads.

- **Compression** is another low-effort win. Enabling gzip or Brotli compression at the LB level means responses are compressed once before transmission, reducing bandwidth usage and improving perceived latency for clients. Backends don't need to handle compression individually.

- **Connection pooling** is where significant performance gains happen at scale. Instead of opening a new TCP connection to a backend for every incoming request, the LB maintains a pool of persistent connections to each backend and reuses them. This eliminates TCP handshake overhead on every request, which adds up fast at high throughput.

## Impact of Load Balancers on Latency

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/slow-very-slow.gif" alt="Slow"><br>
  <em>Every hop costs time. The goal is making that cost as small as possible.</em>
</p>

Load balancers add a hop. That's unavoidable. The question is how much that hop costs and how you minimize it.

#### Geographical Distribution

The single biggest lever for latency is physical distance. A request that travels from a user in São Paulo to a data center in Virginia and back adds dozens of milliseconds of round-trip time that no amount of software optimization can recover. The only fix is getting compute closer to the user.

- **Geo-distributed load balancing**: via AWS Route 53, Azure Traffic Manager, or Cloudflare, routes users to the nearest region based on DNS resolution. A user in Europe hits the EU cluster, a user in Asia hits APAC. This is how global platforms keep latency low for everyone, and how they stay up when an entire region goes dark , DNS just redirects to the next closest one automatically.

- **Connection Reuse**: Every new TCP connection costs time , handshake, TLS negotiation, then the actual request. At scale, that's a measurable tax on every interaction. HTTP keep-alive and connection multiplexing (HTTP/2) let multiple requests share a single connection, so backends never pay the handshake cost more than once. Configuring your LB to prefer long-lived connections on both sides is one of the highest-ROI performance changes you can make.

#### Protocol Optimizations

Beyond connection reuse, protocol-level choices at the LB have a meaningful impact on latency:

- **HTTP/2** enables multiplexing, header compression, and server push. If your LB supports HTTP/2 termination, enabling it for clients (even if the backend speaks HTTP/1.1) reduces overhead per request.
- **HTTP/3 / QUIC** replaces TCP with UDP for transport, eliminating head-of-line blocking and reducing the cost of connection establishment. Adoption is growing and newer LBs support it.
- **TLS 1.3** reduces the TLS handshake from two round trips to one, with support for 0-RTT resumption for returning clients. If you're still running TLS 1.2, upgrading is pure latency win with no downside for modern clients.

## Challenges of Load Balancers

<p align="center">
  <img src="/images/2026-03-26-fundamentals-lb-p3/challenges-lb.gif" alt="Factory"><br>
</p>

1. **Single Point of Failure**: The LB is the entry point to everything. If it goes down, it doesn't matter how many healthy backends you have.
- **Remedy**: Run multiple LB instances in active-passive or active-active with automatic failover, spread across availability zones.
<div style="margin-bottom: 12px;">
1. **Configuration Complexity**: LB configs accumulate over time until nobody fully understands them and every change is scary.
- **Remedy**: Treat config as code. Version control, IaC tools like Terraform, code review, and test environments before touching production.
<div style="margin-bottom: 12px;">
1. **Scalability Limitations**: At extreme scale, the LB fleet itself becomes the bottleneck. More nodes means more synchronization overhead.
- **Remedy**: Design for horizontal scale from the start. Stateless routing where possible, session state in external stores, and synthetic load testing beforereal traffic forces your hand.
<div style="margin-bottom: 12px;">
1. **Latency**: The LB adds a hop. For most apps it's negligible, but for latency-sensitive systems, trading, gaming, voice, every microsecond counts.
- **Remedy**: Geo-distribution, connection reuse, and protocol optimizations cover most cases. For extreme scenarios, hardware LBs or DPDK-based software LBs process traffic at wire speed.
<div style="margin-bottom: 12px;">
1. **Sticky Sessions**: Pinning sessions to specific backends creates uneven load, some servers get hammered while others sit idle.
- **Remedy**: Make your app stateless and store sessions externally (Redis, a database). When that's not possible, use cookie-based affinity over IP-based, and set session TTLs.
<div style="margin-bottom: 12px;">
1. **Cost**: Multiple LB instances, especially managed cloud ones that bill per connection, add up fast at scale.
- **Remedy**: Right-size based on actual traffic. Cloud-native LBs trade cost for simplicity , at high enough volume, self-managed software LBs on commodity hardware are cheaper.
<div style="margin-bottom: 12px;">
1. **Health Check and Monitoring**: Too aggressive and you cause flapping. Too lenient and unhealthy backends stay in rotation too long.
- **Remedy**: Require multiple consecutive failures before removing a backend, and multiple successes before re-adding it. Make health endpoints report real application state, not just HTTP 200.
<div style="margin-bottom: 12px;">

That wraps up the Load Balancer series. Three parts, and we went from "what is a load balancer" all the way to the real operational pain that comes with running one at scale. They're not magic boxes , they're infrastructure that requires thought, configuration, and care. But done right, they're the invisible backbone of every reliable system you've ever used without noticing. And that's exactly the point.

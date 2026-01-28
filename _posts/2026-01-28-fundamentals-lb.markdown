---
layout: post
title:  Let's talk about Load balacers (Part 1)
description: "In this AI era, where even Linus vibe coding, we need to rely on the fundamentals because that's what was left for the betas"
date: 2026-01-28 12:05:00 +0300
image: '/images/load-balance-icon.png'
toc: false
tags: [System Design, Load Balacing, Fundamentals]
---
Hello again, yeah, years without showing up, and I'm here again to present another topic, just because of AI. Yeah, we need to trust the fundamentals because we'll maintain all the infrastructure and code created by an AI (which uses our disorganized code in thousands of repos on GH). 

So there is no one to blame, because we are the ones who dig our own grave when we trust and train AI. At least we still have some critical thinking grounded in fundamental knowledge, as I'll present today.

## Our old friend Load Balancer
Load balancers are older than you might think and are a very important component of system design, as they help distribute requests and traffic across multiple servers. The goal of LB is to ensure availability, reliability, and prevent a single server from becoming overloaded, thereby reducing downtime.

## How LB works?
1. The LB received a request from a client
2. The LB evaluates the request and chooses which server should receive it. This is done using a predefined algorithm that takes into account factors such as server capacity, response time, number of active connections, and geographic localtion.
4. The LB forwards the received traffic to the selected server.
5. The server processes the request and sends a response back to the LB.
5. The LB received the response from the server and sends it to the client that made the request.

<p align="center">
  <img src="/images/lb-working.gif" alt="Load Balancer workflow diagram"><br>
  <em>Basically a traffic cop who never takes a coffee break</em>
</p>

## Key concepts
People often ask this in interviews, so make a note of it.
* <b>Load Balancer</b>: A device or software that distributes network traffic across multiple services based on predefined rules or algorithms.
* <b>Backend Servers</b>: The servers that receive and process requests forwarded by the LB. Also known as a server pool or server farm.
* <b>Load Balacing Algorithm</b>: The method used by the load balancer to determine how to distribute incoming traffic among the backend servers.
* <b>Health Checks</b>: Periodic tests performed by LB to determine the availability and performance of backend servers. Servers with problems are removed from the server pool until they are recovered.
* <b>Session Persistence</b>:  A technique used to ensure that subsequent requests from the same client are directed to the same backend server, maintaining session state and providing a consistent user experience.
* <b>SSL/TLS Termination</b>: The process of decrypting SSL/TLS-encrypted traffic at the load balancer level, offloading the decryption burden from backend servers and enabling centralized SSL/TLS management.

## LB Algorithms
The primary goal of an LB algorithm is to ensure efficient use of available resources, improve overall system performance, and maintain high availability and reliability. So, choose your dish based on the flavor of the context you are working in.

### 1. Round Robin
It simply assigns a request to the first server, then moves on to the second, third, and so on, and after reaching the last server, he starts again at the first.

#### Pros
* Easy to implement and understand
* Equal distribution of requests, each one gets a turn in a fixed order
* Works well in same capacities servers

#### Cons
* <b>No Load Awerenes</b>: Since all servers are treated equally, regardless of their status, the current load or capacity of each server is not taken into account.
* <b>No Session Afinity</b>: Subsequent requests from the same client may be redirected to different servers, which is very problematic for persistence in stateful applications.
* <b>Performance issues</b>: If many servers have different properties, they may not function optimally.
* <b>Predictable Distribution Pattern:</b>: It can potentially be exploited by attackers who observe traffic patterns and can find vulnerabilities in specific servers by predicting which server will handle requests.

#### Use Cases
* Suitable for environments where all servers have similar capacity and performance.
* Works well for stateless applications

<p align="center">
  <img src="/images/round-robin.gif" alt="Round Robin workflow diagram"><br>
  <em>Round Robin works like a queue: each server gets its turn, no favoritism.</em>
</p>

### 2. Least Connections
It assigns requests to the server with the fewest active connections at the time of the request. This ensures a more balanced distribution of load across servers, especially in environments where traffic is unpredictable and request processing times vary.

#### Pros
* <b>Efficient for different server configurations</b>
* <b>Better utilization of the servers:</b> As it takes into accontablity the current load on each server.
* <b>Dynamic Distribution</b>: Adapts to changing traffic patterns and server loads, ensuring no single server becomes a bottleneck.

#### Cons
* <b>More complex</b>: Compared to simpler algorithms, such as Round Robin, as it requires real-time monitoring of the active connection.
* <b>State overhead</b>: As it requires maintaining the state of active connections
* <b>Connection spikes</b>: In contexts where the connection duration is short, servers may experience rapid spikes in the number of connections, leading to frequent rebalancing

#### User Cases
* <b>Suitable for servers with different capacities<b> and workloads, requiring dynamic load distribution
* Works well for <b>apps with unpredictable traffic</b>, ensuring that no server becomes overloaded
* Very effective for apps where maintaining <b>session state is essential</b>, as it helps distribute active sessions more evenly.

While <b>Round Robin</b> doesn't consider the current load and distributes requests in a fixed cyclic order, <b>Least Connections</b> distributes requests based on the current load, directing new requests to the server with the fewest active connections.

<p align="center">
  <img src="/images/least-connections.gif" alt="Least Connections workflow diagram"><br>
  <em>The least busy server gets the next request.</em>
</p>

### 3. Weighted Round Robin
WRR is an enhanced version of Round Robin. It assigns weights to each server based on its capacity or performance, distributing incoming requests proportionally according to these weights. This ensures that more powerful servers handle a larger share of the load, while less powerful servers handle a smaller share.

#### Pros
* <b>Better use of resources</b>, as high-capacity servers process more requests
* <b>Easily adjustable</b> to accommodate changes or additions of new servers.
* Optimize overall system performance by <b>avoiding overloading less powerful servers</b>.

#### Cons
* <b>Set appropriate weights for each server can be challenging</b> and requires accurate performance metrics.
* It doesn't consider <b>real-time server load</b>.

#### User Cases
* Ideal for environments with <b>different processing capacities<b>, ensuring efficient use of resources
* Suitable for <b>web apps</b> where different servers have varying performance properties
* Useful in <b>database clusters</b> where some nodes have greater processing power and can handle more queries.

<p align="center">
  <img src="/images/weighted-round-robin.gif" alt="Weighted Round Robin workflow diagram"><br>
  <em>Servers with more power receive more requests in the rotation.</em>
</p>

### 4. Weighted Least Connections
It is a smart way to share work between servers, and looks at thw things:
1. Which server is less busy right now
2. Which server is stronger
Big, strong server get more work, while, busy servers get a break.
It's like a manager giving more tasks to seniors, but only if they're not overloaded.

#### Pros
* **Dynamic real-time load balancing** on each server, ensuring balanced distribution of requests
* For better resource utilization, **takes into account the capacity of each server**
* **Flexibility** to handle servers with different configurations

#### Cons
* **More complex** compared to Round Robin and Least Connections
* **Requires the LB to track both active connections** and server weights, as well as requiring accurate performance metrics.

#### User Cases
* Ideal for environments where servers **have different capacities** and workloads
* Suitable for **high-traffic applications**
* Also useful for **database clusters**

<p align="center">
  <img src="/images/weighted-least-connections.gif" alt="Weighted Least Connections workflow diagram"><br>
  <em>Strong servers do more work, unless they are already busy.</em>
</p>

### 5. IP Hash
It decides on the server using the client's IP address.
The load balancer does some calculations with the IP and says:

“Ah, you belong to this server,” and the **IP always goes to the same server.**

This means that the server always remembers the client, no drama.

##### A simple example would be:
You've three servers (A, B, and C), and the client has the IP address **192.168.1.10**.

The load balancer converts this IP address into a number, and if the resolution is 2, it sends the request to server C.

The next time this client returns, it will be the **same IP address** and the **same server**.

#### Pros
* **Session persistence**: Same IP > Same service
* **Easy to use**, no need to track connection.
* **Idempotent**, as the result is always the same.

#### Cons
* If many users **have similar IPs**, **one server get stressed**, while others relax.
* **Add or remove a server** means that some users suddenly go to a **different server**.
* It **doesn't care about if the server** is tired or overloaded, **just folows the IP**.

#### User Cases
* **Statefull apps**, like shop carts, and logged-in user sessions.
* Clients in **different regions** with consistent routing.

<p align="center">
  <img src="/images/ip-hash.gif" alt="IP Hash workflow diagram"><br>
  <em>The same client IP always goes to the same server.</em>
</p>

### 6. Least Response Time
It sends the request to the **fastest server** at the moment, not the most powerful or least busy one.

#### How it works
1. The load balancer **checks the response speed** of each server.
2. A new request arrives and is **forwarded to the server with the shortest response time**.
3. If a server **slows down**, it receives **less traffic**. If it speeds up again, it receives more.

#### Pros
* Requests go to the **fastest server** > users are satisfied.
* **Reacts automatically when servers slow** down or speed up.
* Fast **servers work harder**, slow servers rest.

#### Cons
* More complex, as it **requires monitoring and metrics**, not just simple functions.
* Measuring response time affects performance.
* **Small network issues** can cause a server to appear slow for a moment, and traffic can fluctuate too much.

#### User Cases
* **Real-time apps** such as games, streaming, and trading platforms.
* APIs and web services, when **fast response times** are more important than session memory.
* Great when server performance fluctuates throughout the day.

<p align="center">
  <img src="/images/least-response-time.gif" alt="Least Response Time workflow diagram"><br>
  <em>Requests go to the server that responds the fastest.</em>
</p>

### 7. Random
Yes, it's exactly what it sounds like: the LB chooses a server at random.

#### How it works
1. You have servers A, B, and C.
2. A request comes in.
3. The LB randomly chooses a server.
Over time, if luck is fair, each server will receive approximately the same number of requests.

#### Pros
* **Very simple**, easy to understand, and easy to configure.
* **Doesn't track** load, speed, or connection, which means less overhead.
* **Good with randomness**, traffic spreads out over time.

#### Cons
* **Not intelligent**, does not know if a server is slow or overloaded.
* A server may receive many requests in a row.
* The same user may access different servers. (terrible for login sessions).
* Random traffic makes attack patterns (such as DDoS) more difficult to detect.

#### Use cases
* All servers are similar
* Each request is independent (**stateless**), with no memory requirements
* **Simple systems** when you want something fast and don't need sophisticated logic

<p align="center">
  <img src="/images/random.gif" alt="Random workflow diagram"><br>
  <em>The server is chosen randomly for each request.</em>
</p>

### 8. Least Bandwidth
Sends traffic to the server that is currently using the **least network data**.
* If a server is **busy** downloading files, it **gets a break**.
* If a server has **free** internet, it **gets the next request**.

#### How it works
The LB checks how much bandwidth each server is using.
* A **new request** arrives.
* The request **goes to the server** that is using the **least bandwidth**.
This keeps network traffic balanced.

#### Pros
* **Dynamic and intelligent**: adjusts in real time based on network usage
* **Prevents network overload**: no server is ever overloaded with too much data
* **Better use of resources**: all servers share the same load more evenly.

#### Cons
* Requires **constant monitoring** of bandwidth
* Bandwidth measurement consumes some resources
* Small bandwidth **spikes** can cause **traffic fluctuations**

#### Use cases
* **High-bandwidth applications** such as streaming, file downloads, and large data transfers
* **CDNs**: fast content delivery without network bottlenecks
* **Real-time systems**, where low latency and smooth traffic are really im

<p align="center">
  <img src="/images/least-bandwidth.gif" alt="Least Bandwidht workflow diagram"><br>
  <em>Traffic is routed to the server with the lowest bandwidth usage.</em>
</p>

### 9. Custom load
Instead of using a fixed rule, you tell the LB **what “busy” really means** for your application.

Think of it as a personalized meal plan: not everyone eats the same food.
#### How it works
1. **Choose what to monitor**, for example, CPU, memory, disk, or specific application numbers.
2. A **monitoring system constantly** checks these metrics.
3. **Create your own rules**, such as sending less traffic if the CPU is high or sending more traffic if memory is free.
4. **Real-time adjustment**: traffic automatically changes based on your rules.

#### Pros
* Works exactly the way you want it to.
* Better use of resources by using many signals, not just one.
* Great for **complex and constantly changing systems**.

#### Cons
* **Complex**: more logic = more things to manage
* **Monitoring cost**: monitoring many metrics consumes resources
* **Easy to get wrong**: bad rules = bad traffic decisions.

#### Use cases
* **Complex applications** with different behaviors and bottlenecks
* **Highly dynamic systems** where load changes quickly and frequently
* **Special needs** where standard algorithms are not sufficient.

Yeah, that's part 1 of 3, I know that maybe nobody is reading this, but tbh, that's ok. At the end of the day I'm improving my writing and sharpening know knowledge of a fundamental topic, and that already makes it worth it.

I appreciate your time reading this boring article, and just remember, **being good in something isn't a spring but a marathon that you have to work on every day.**

(I probably saying it to myself... but mayber it helps you too.)

**See ya!**
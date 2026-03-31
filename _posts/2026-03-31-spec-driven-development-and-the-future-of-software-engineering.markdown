---
layout: post
title: "Spec-Driven Development"
description: "From pair programming to BMAD, the industry keeps reinventing ways to make developers miserable. But is software engineering actually dying?"
date: 2026-03-31 09:00:00 +0300
image: "/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/sdd-evolution-timeline.png"
toc: false
tags: [Software Engineering, AI, Productivity, Career]
---

Sitting alone in a dark room, looking at your code, was by far the best thing about the software developer job. And, naturally, the world has this unexplained need to destroy everything that's quiet, satisfying, and can actually make you happy.

## The Wave of Methodologies

So they came up with the idea of pair programming, where instead of one person thinking carefully and moving forward, you now have two people negotiating every insignificant coding decision as if their life depends on it. (Don't take it too serious) 

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/drake.gif" width="500"><br>
</p>

Then, when this didn't gain traction, they came up with Test Driven Development, which sounds reasonable, until you realize you're now writing code for code that doesn't exist yet, testing behavior you haven't even fully understood, and then reshaping everything just to satisfy the tests you wrote five minutes ago.

Then, we were all forced to do Scrum, which meant slicing your work into artificial fragments that management can manage, and then wasting most of your day in daily stand-ups, sprint planning, backlog refinement, sprint reviews or retrospectives.

## Enter Spec-Driven Development

But I'm afraid the pain is not going to end here, because a new methodology is emerging, and this one actually kills the little joy we developers had left. Spec-driven development is the new "thing" every vibe coder and wannabe product manager is excited about.

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/monkey-coding.gif" width="500"><br>
</p>

Despite our complaints, the chances are some of us will be forced to work in this new setup sooner than we think, so today, we'll look at what Spec-driven development actually is, and how it can impact our future.

We'll look at the actual supporting evidence for this methodology in real-world projects.

### What is SDD?

At its core, the idea of spec-driven development is really simple. Instead of just sitting down and building something, you first write a very precise, machine-readable document that describes what you want to build, why you want to build it, and what success looks like. You can probably see that this is already sounding terrible, because the one thing developers hate writing more than tests is documentation.

Then, crucially, this spec becomes the source of truth for your application. In SDD, the spec is, apparently, alive.

In traditional development, specification is most of the time an afterthought. You write it, you feel good about yourself, then you file it somewhere and let it deprecate gradually because nobody has the time to keep documentation in sync with the actual product. These were the good old days when writing code was still considered a valuable skill.

Now, thanks to AI code generation, the barrier to writing code has collapsed to almost nothing, and the industry is quickly getting crowded with vibe coders who are more than excited to celebrate the "death" of the real software engineers.

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/sdd-timeline.png" width="500"><br>
</p>

But since vibe coding is usually a disaster waiting to happen, spec driven development is now being formalised by a lot of big companies.

## GitHub's Spec Kit

One of the biggest efforts on this front is [GitHub's spec kit](https://github.com/github/spec-kit), which "allows you to focus on product scenarios and predictable outcomes instead of vibe coding every piece from scratch."

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/ghsk.png" width="250"><br>
</p>

So instead of just vibe-prompting your AI assistant and hoping for the best, you now get to act like a professional in the CLI and walk through four very official-looking stages.

1. **Specify**: You start with the "specify" step, where you describe what you want with as many details as humanly possible. Here you're expected to define user journeys, business requirements, success criteria and pretty much everything else you used to figure out while building the actual thing.
2. **Plan**: Then, in the planning step, you pretend you still care about architecture. This is where you define your tech stack. If you happen to know anything about tech or stacks, you write up your dependencies, and you design your system. This is interesting, because the entire premise of AI coding is that you don't have to think about these things too much anymore, but now you're formalizing them even more than before.
3. **Task**: Then the task step is where you break everything into neat little chunks of granular work items, dependencies, and acceptance criteria. Basically, these are the old Jira tickets, now defined in plain text in a markdown file.
4. **Implement**: Then, finally, in the implementation phase, you sit back, relax, and let the AI one-shot your million-dollar startup idea.

## The Problem with Front-Loading Thinking

One of the biggest red flags, in my opinion, is that this model expects us to front-load our entire thinking and planning in the specification phase. In my experience, you usually learn about problems and edge cases while actively working on them. With this model, we are expected to understand it completely before writing a single line of code.

And, this is by far the biggest fiction in software development. However, it somehow gets worse thanks to BMAD or the Breakthrough Method of Agile AI-Driven Development.

## BMAD: Orchestrating AI Agents

This is a newly proposed methodology where, instead of writing code, you're orchestrating a team of AI agents with various skills and responsibilities, all communicating between them through various markdown files. Your job is to sit in the middle and make sure these agents don't completely lose the plot, all while building new billion-dollar startups every 12 hours.

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/telephone-game.gif" width="500"><br>
</p>

The natural conclusion of this trajectory is that you are now expected to manage a system that writes software for you, based on documents that try to approximate reality before reality has had a chance to contradict you.

This is where tools like [Kiro AI](https://kiro.dev/) come in, which basically functions as a digital babysitter for your fleet of AI hallucinations.

But if you are not ready yet to change your job description to Prompt Architect or System Orchestrator, the good news is that a lot of the things I mentioned are really unlikely, and the Software Engineering job is not as dead as some would like you to believe.

## The Counter-Argument: Real Engineering Still Matters

A few days ago, I read a really good article where the author starts with a simple but uncomfortable observation. Specifications written in English only feel precise until you try to implement them.

You think you've written a perfectly precise spec until you realize "live sync" doesn't explain what happens when two users in different time zones delete the same paragraph during a Wi-Fi flicker. These are the moments when the Prompt experts are usually realizing that their one-sentence requirements which worked well when building a TODO app, isn't enough to cover all the edge cases of real-world projects.

The program was developed because the human brain has a limited capacity to process information before reaching the point of cognitive overload. Code helps humans compress complexity into something manageable.

As [Dijkstra](https://en.wikipedia.org/wiki/Edsger_W._Dijkstra) noted, the point of abstraction isn't to be vague, it is to create a level where we can finally be absolutely precise.

The industry may try to rebrand us as "Digital Babysitters" for AI hallucinations, but the task of understanding the problem, building the abstraction, and ensuring it actually works well in the wild still remains. A vibe might get you 80% of the way there in ten seconds, but that last 20% is where real engineering lives.

<p align="center">
  <img src="/images/2026-03-31-spec-driven-development-and-the-future-of-software-engineering/babysitters.gif" width="500"><br>
</p>

And here's the really interesting thing. More studies are coming out showing that those last [20 percent are now harder and more time consuming because increased use of AI correlates with higher rates of software instability](https://dora.dev/research/2025/dora-report/), including more frequent rollbacks and patches. Code still requires human validation, customization, and debugging, particularly for edge cases and business-specific logic.

But the most concerning aspect of all this is skill development. Last week, I posted a video about the recent updates in the web dev world, and the number of people saying that these updates are now irrelevant was pretty surprising.

[Studies show that overreliance on AI weakens understanding](https://www.anthropic.com/research/AI-assistance-coding-skills), especially in debugging, and results show that developers using AI performed worse in knowledge assessments, suggesting that outsourcing cognitive effort reduces long-term competence.

## The U-Shaped Productivity Curve

We all love a good graph, and the latest data from the 2026 DORA AI Report has given us a particularly fascinating one. This describes what researchers are calling the "U-shaped productivity curve." At the start of the curve, you have the "Vibe Peak." where beginners and "prompt architects" enjoy an 80% speed boost because they're building simple CRUD apps and Todo lists where the stakes are low, and the edge cases are non-existent.

But as soon as you move toward a real-world system, you fall off a cliff into the "Complexity Trough" and productivity actually drops below baseline human speed.

"Digital Babysitting" turns out to be more cognitively taxing than actual engineering because you can spend hours debugging a hallucination that an AI "one-shotted" into your codebase in a few seconds. So that 20% of "real engineering" is becoming the new bottleneck where all your saved time goes to die, proving that while AI can generate code at the speed of light, it still debugs at the speed of a frustrated human trying to read a stranger's mind.

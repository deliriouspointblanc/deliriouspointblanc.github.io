# Portfolio relaunch brief: yasminmorgan.com

**Owner:** Yas (Yasmin Morgan)
**Ship date:** Sunday 15 November 2026
**Goal:** a clear, good-enough portfolio that makes it obvious who I am, so I can start applying for creative technologist roles. Done beats perfect. Anything not in this file is v2.

---

## How to work with me (Claude Code, read this first)

1. **Look before you change anything.** Start by reading the repo and summarising its current structure, pages and how it's deployed (GitHub Pages, custom domain). Propose a plan for this brief that fits what's already there before restructuring anything.
2. **Keep it hand-coded.** Plain HTML, CSS and vanilla JS. Three.js is fine for the hero. No React, no build step unless one is clearly worth it, and ask me first if you think it is.
3. **Work in small steps,** one task from the checklist at a time, and commit after each. Make sure commits don't say 'Claude' on them. Tell me what changed and what to look at in the browser. 
4. **Don't break the live site.** Work on a branch (`relaunch`) and merge when I say so.
5. **Don't write my words for me.** Where copy is marked `DRAFT`, put it in as a placeholder and flag it. I'll rewrite it in my own voice. Copy marked `FINAL` can go in as is.
6. **Writing style:** never use em dashes in any copy. Don't do the claude 3 like 'not X but X' or stuff that's clocked as your style.
7. **Client work rules:** link out to D5XR's own project pages for visuals. Don't download or rehost their videos or images. Only use client names that are already public on D5XR's site.
8. **When something is ambiguous, ask** rather than guess, and keep a short list of open questions at the end of each session.

---

## Checklist

### 1. Positioning `FINAL`
- [ ] Homepage hero text:
  > I build experiences that make people wonder, and the tools that make them possible.
  > Creative technologist spanning XR, real-time 3D and web.
- [ ] About page: I'll write this myself. Leave a clearly marked placeholder. (Note to self: "If I was an object, I'd be a Swiss army knife" might open it.)

### 2. Hero: The Pantheon (Three.js)
Prototype: `prototypes/pantheon.html` (raw WebGL, one fragment shader). Port it to Three.js.

- [ ] Full-screen quad with a `ShaderMaterial`, reusing the prototype's fragment shader and uniforms (`uRes`, `uTime`, `uPos[4]`, `uState[4]`, `uRot[4]`, `uSeed[4]`). Keep the JS behaviour logic (wake, attention lag, twitches, threads overlay) as it is.
- [ ] Render at reduced resolution (start at 0.6 to 0.75 of device pixels) and scale up with CSS. Cap DPR at 2.
- [ ] Pause rendering when the hero is scrolled out of view or the tab is hidden.
- [ ] Respect `prefers-reduced-motion`: show a still frame.
- [ ] Mobile and low-power fallback: a short looping video or still image (I'll record it from desktop).
- [ ] Each deity links to a section of the site. **Open question:** the four hat names. Placeholders are Immersive, Tools, Art, Community. Ask me before finalising.
- [ ] Optional caption: "These deities first appeared in *Amorphous Butterfly*", linking to that work.
- **Timebox: 3 evenings.** If it's not done by then, ship the best version and move on.

### 3. Case studies
Each one: title, a one-line meta row (role · tools · timeline · studio), 3 to 5 short paragraphs, then a link or visual. Same template for all of them.

- [ ] **Free the Motive** (personal project, fully shareable). The problem: finding free nights out in London, supporting grassroots and underground events. Data pipeline: GEL's events API, Supabase, Node/Express, scrapers with duplicate checking. Decisions: ruling out Eventbrite, reaching out to GEL directly. Then branding and the Three.js work, plus a live link. Hosted at freethemotive.theuntaught.org. `DRAFT`:
  > **Free The Motive**
  > Lead technical build · Mattercraft, TypeScript · Ongoing, several months · Self-directed
  >
  > One day, I was trying to find free or free before Xpm events to go to, swapping between RA, Dice and IG, wishing that I could see everything in one place. This aggregator idea brewed in my head for a while. If I'd find it useful, I knew others would.
  >
  > I wanted to learn backend, handling databases and scraping. This year, I finally bit the bullet with the help of Claude who setup the first scrapers. After, I solidified my knowledge by building a scraper for another listing source.
  >
  > Money's tight, but dancing is a human right. In these financially dire times, we still deserve to enjoy ourselves and come together. My philosophy is that nightlife is more than debauchery, but spaces of possibility and freedom. A chance to feel myself (and others) in all senses and shapes. 
  >
  > As a DJ and organiser myself, I want to develop Free The Motive to be a resource for party goers and ways to support awesome venues and find unique, underground events. It's musically focused, but the first listings I scraped from is GEL (check them out they're sick), so it also incorporates cool events that are not strictly club nights too. My next steps are to create a submission form, since so many free parties are on IG and it's impossible to scrape that, and these events are so valuable. I'm also gonna create a map view and make some visualisations from this data. Stay tuned!
  >
  > Link: https://freethemotive.deliriousblanc.workers.dev/
- [ ] **Scalp Care MR** `DRAFT`:
  > **Scalp Care MR**
  > Lead technical build · Mattercraft, TypeScript · Under two weeks · D5XR, for a scalp health brand
  >
  > A mixed reality experience that teaches stakeholders and influencers what causes dandruff. Most of the audience had never used XR, so mixed reality kept them anchored in the room while taking them somewhere microscopic.
  >
  > I led the technical build in Mattercraft and wrote the core custom interactions in TypeScript, including raycast-based picking so users could physically grab and inspect microbes. My job was translating the storyboard into something people could move through without instructions. Each story beat advances on a single trigger, so nobody gets lost and the timeline stayed achievable.
  >
  > I pushed for a robot companion, SARA, to give the experience personality, and argued for keeping her script short. A first-time XR user should be discovering, not listening.
  >
  > Shipped in under two weeks, from storyboard to live experience.
  >
  > Link: https://www.d5-xr.com/projects/scalp-care
- [ ] **Olay: The Science of Cellular Aging** (VR, Meta Quest 3, AAD 2026). Outline: the challenge (make dermatologists feel cellular aging, not read about it), my role (Yas to fill in), key decisions (microscopic scale, haptics in Meta Haptics Studio), where it ran (AAD 2026, 20,000+ attendees). Link: https://www.d5-xr.com/projects/olay. `DRAFT`, needs my role.
- [ ] **Internal AI video pipeline** (no visuals, under NDA) `DRAFT`:
  > **Internal AI video pipeline**
  > Workflow tooling · Claude API · In-house
  >
  > Prototyping with AI video meant sending client material to third-party tools, paying per experiment, and relying on whoever knew how to prompt well. I built an internal pipeline that keeps generation in-house, cuts prototyping costs, and generates video prompts through the Claude API, so the know-how lives in the system rather than in one person's head.

  Open: add a number if I have one (cost per prototype, people using it, time saved). Check that "in-house" is accurate.
- [ ] **Older art work** (Amorphous Butterfly and others): keep, but tidy into an "Archive" grid rather than full case studies. Fix the resizing on `works/amorphous/amorphous.html` if it's quick.

### 4. Basics
- [ ] About page, contact (email, LinkedIn, GitHub, Instagram if relevant) and a CV download (PDF, I'll supply it).
- [ ] Clear navigation that matches the hero's hats.
- [ ] Page titles, meta descriptions and an Open Graph image so links look good when shared.
- [ ] Favicon. My current site has an image of one of my deity shaders as the site 'logo'. Favicon is from a different piece of work.
- [ ] Old work - I'd like to keep my old projects that are live on the main site, maybe put it into an 'Archive' section.

### 5. Quality pass
- [ ] Check every page on a phone-sized viewport.
- [ ] Lighthouse: fix anything red in performance and accessibility.
- [ ] Alt text on all images, keyboard focus visible, colour contrast OK.
- [ ] No broken links.

### 6. Ship
- [ ] Merge `relaunch` into the live branch and confirm yasminmorgan.com updates.
- [ ] Send the link to one person.
- [ ] Start applying (see my tracker). The site doesn't have to be perfect for this.

---

## Not in v1
Scroll-driven GSAP sequences, p5.js generative moments across the site, a blog, a 'playground' or 'lab' for experiments, new projects, the WebXR Buddhist-themed game, Embrace. All good ideas, all v2.

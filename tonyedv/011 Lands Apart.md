---
color: black
width: 8
code: PRJ.082
title: Lands Apart
category: Project
subtitle: Expansive Fantasy Setting
chip: dnd
height: 5
---
> INCOMPLETE

Lands Apart is the name of a fantasy setting I've wbeen iterating on for many years now. I was getting into D&D and running a few campaigns for friends, but COVID put an end to most of that :( I figured with the spare time I could set up a much bigger setting than any I had made in the past.

At the time, I had recently played Elden Ring and was blown away by how much work went into the world building. I've never seen a game that expects you to study the world's architectural styles, stone carving techniques, and iconography to piece together the history of the world. Every asset in the game has had so much thought put into it, and I wanted to see what it would take to create something similarly detailed.

So, I made Lands Apart, and it's very detailed. As of 2025 I've made:

- 320,000 words of notes.
- A google-maps like site for navigating the map. It has weather, time zone, and travel modeling tools.
- 200+ points of interest to explore.
- 40,000 years of history.
- 16 religions.
- 80 session outline for the main quest.

# The Map

I'm a fan of node based editors, so I made the map in Substance Designer. It's basically an image editor but instead of editing you build a computation tree that applies the edits for you.

Substance isn't the most optimized, so the final render typically uses ~80GB of RAM to produce the final 16384x16384 image, but that size is kind of necessary to be able to read the place names.

I hand painted the coastlines, rivers, and biomes, but all the shading, coloring, and text was added by a very complicated substance pipeline.

Here's the full map rendered at 1/2 resolution. You might want to right click and open in new tab so you can zoom in and see all the detail.

![](assets/landsapart-bigmap.jpeg)

(btw when rendering at a lower res some of the positions get shifted weirdly, if you zoom in you'll def see some alignment issues)

I also made an interactive map, which adds a bunch of information about weather forecasts, time zones, and adds pins for points of interest. I had to write my own time zone libraries since the calendar and time zones don't line up at all with the ones used on Earth. But here's how the map looks in the UI:

![](assets/landsapart-interactive.png)

The map has been super fun to make. I like messing around in substance so this was just an opportunity to push my skills to the limit. 

There's also a second map for some underground areas, but I won't show it here because spoilers. But just imagine another continent or two worth of stuff there.

# Worldbuilding

The goal was to add lots of detail, and I think I achieved that. I have ~1000 words on the different designs on the coins and how they changed over time. Is this level of detail necessary? Absolutely not. But when you have to decide what a coin looks like it forces you to answer a lot of other important questions, like:

1. Who is minting the coins? Do different areas use different currencies?
2. What icons and symbols do the people minting the coins want to reinforce with their designs.

These answers aren't important to gameplay but are important for a world making sense. For example, in Lands Apart, one of the major countries collapsed a few decades ago, but their coins are still in circulation. If a player is lucky they may find one of these out of mint coins and can learn a bit about the fallen country just by looking at the iconography. Each of those little details isn't important, but I think they add up.

## Religion

The world has a big focus on religion. As someone who was raised atheist, and rarely interacted with religious people growing up, I wanted to understand it more. Lands Apart is an exploration of beliefs, higher purposes, and how people deal with conflicting ideals.

There's 4 major religions, each with wildly different values, and all in tension with one another. Many of the major quests are built around exploring each of these religions, and seeing what makes them great, but also flawed.

I also wanted to avoid tropes of evil cultists or a clear villain faction. The conflicts in this world are ultimately very messy, with no clear hero or villain. I did this mostly because I'm interested to see how players react in these situations. I think the TTRPG format really works here, since it allows players to come up with unexpected ideas or ways to resolve a conflict in a clever way.

But to make these conflicts feel real, I wanted to make the religions needlessly detailed (you may be noticing a pattern here). This meant making religious texts, iconography, prayers, holy sites, religious figures, the works. I really enjoyed exploring different world views and thinking about how that shapes societies and individuals.

There's also a number of more esoteric religions, with 40,000 years of history, there's bound to be plenty of beliefs that have fallen out of favor for various reasons. Most of them linger on as cults or in remote locations. These add another 12 religions. These more esoteric religions were where I could put my more unconventional ideas that I wanted to explore but didn't work as a major faction, but I thought were interesting. Like a religion built around studying change and decay, or one obsessed with studying myths and stories.

## The World

Okay, enough talking about stuff related to the setting. Here’s a super high level overview of the actual world.

Long ago, the world was once whole. An age of peace and prosperity was maintained by Aneris, the one true goddess. But after ten thousand years of harmony and prosperity, she died.

Her will is now gone from the world, but her fractured body lives on. Each fragment containing part of her power, each hailed as a god in their own right.

Her Eye possesses her order and harmony. Her Hand possesses her power and creation. Her Horns possess her strength and resilience. And Her Heart possesses her passion and vitality.

The peoples of the world once stood together. But in their god’s severing they became divided and distrustful. They rallied behind different fragments, and clashed over how the world should be.

The whole setting is deeply marked by Aneris’s passing. 


Continents

| Continent | Climate       | Primary Religion     | Main Language | Major City   |
| --------- | ------------- | -------------------- | ------------- | ------------ |
| Penrith   | Temperate     | Prismatic            | Common        | Arkstead     |
| Tekhan    | Hot Desert    | Stalwart, Sequencers | Tekhanak      | Kallos       |
| Shaskocha | Rainforest    | Flames               | Shaskoden     | Yonessa      |
| Marithas  | Boreal Forest | $$$                  | Mothuut       | Marithas Kir |
| Vatichi   | Tundra        | Scars                | Valenti       | Salvos       |
| Laphena   | Taiga         | Heretical Faiths     | Lyuk’en       | --           |

Religion & Philosophy

Prismatic

God: The Prismatic Eye

Order, harmony, and beauty. The Prismatic value structure and tranquility above all else, and believe that the “harmonious path” is the way to achieve such things. They believe it is their duty to uphold the natural order, and eliminate anything that stands in its way.

  

Stalwart

God: The Stalwart Horn

Preservation, strength, and protection. The Stalwart are reclusive, but unrelenting. Their resilience allows them to withstand the uncaring world that surrounds them, and they believe that the only way to survive is to become stronger.

  

Flames

God: The Burning Hand

Creation, transformation, and destruction. The Flames reject authority and order, instead embracing chaos and the unmerciful change. Their abandonment of convention makes them skilled inventors, able to forge wondrous mechanisms. But to create, sometimes one must first destroy.

  

Scars

God: The Scarred Heart

Desire, life, and thirst. The Scars are characterized by their cunning, irresistible charisma, and insatiable appetite. Many Scars devote their lives to finding the extremes of what this life has to offer, the good and the bad. Scars are often joyous and amicable, but can kill without hesitation.

  

Sequencers

God: None

Knowledge, enlightenment, and purity. The Sequencers in the walled city of Kallos study and document the world so that they may understand it, guide it, and can feel superior to everyone else for doing so.

  

Kit

God: The Great Being

Life, Unity, and Oneness. The druids of Kit believe that the world and all living things are connected. They say that listening is becoming, and they spend a great amount of time listening to the earth. The most devout followers can cause change in the world as if it was part of their own body.

**Heretical Faiths**

There are other minor faiths, such as K’u, the Mythkeepers, the Putrid Heart, and many many more. Most only have small followings, and are considered heresy by most other faiths.



### Penrith



### Tekhan

### Shaskocha

### Marithas

### Vatichi

### Laphena

### ???

Of course, there’s got to be some secret locations. These are some of my favorite parts, and I’d love to share, but that would be spoilers so 🤐


# Gameplay

Having a hugely detailed world needs to be integrated into the story and gameplay. Mostly because I want it to be rewarding to pay attention to what's going on. The story need to not require the player to have an encyclopedic knowledge about the world, but also not be inconsequential.

This was the trickiest part, it's easy to make a needlessly detailed world, but carving a coherent story out of it can be difficult. It took Tolkien a couple books to find the right balance of world building and story and I now have a much deeper appreciation for why.

My main takeaway from this whole process was to figure out a path through the world for the players to traverse. Start super small and slowly expand their world. you can introduce bigger ideas and conflict, but don’t expect the players to buy in immediately.

The part I definitely struggle with the most is to let a thing be simple. Since I have a ton of knowledge behind all the little details, I want to present them in that way. So if players ask about some world events, I’ve learned that I need to be okay with making it appear simpler than it is if it’s not the focus right now. If everything is crazy intricate, it becomes hard to direct attention.

Players are very sensitive to where the intended path is, and will try to follow cues from the DM for who to talk to and what to direct attention towards. It can be disorienting if every NPC sounds important.

# Text based adventure game

I'd like a way for this setting to reach more people, given the amount of time I've invested to it I figured I could try to make it more presentable.

So I've been chipping away at making a text based adventure game in the setting. I'm not the best at writing prose, so it's taking a while but I'm slowly getting better.

I'm still at the phase where I'm constantly getting sidetracked by adding new features to my bespoke text based game engine, but it's very cool, at some point I may add a separate post just about how it works. But the main power of the system I've built is making dynamic content that adjusts based on weather, time of day, player skills, etc. and of course, the weather and time of day logic was pulled from the interactive map.

I've also set up some tools to leverage LLMs to help scaffold out the dialog and navigation trees based on my notes, which is super helpful.

[screenshot]
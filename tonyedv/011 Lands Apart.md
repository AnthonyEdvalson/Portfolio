---
color: black
width: 8
code: PRJ.082
title: Lands Apart
category: Project
subtitle: Expansive Fantasy Setting
chip: dnd
height: 5
disable: true
---
> INCOMPLETE

1. Intro
	1. inspo, experiment and plan
	2. stats
	3. disclaimer
2. Idea generation
	1. Themes
	2. list of lists
3. Map
	1. pictures, overview
	2. Substance pipeline
	3. interactive map
4. Info management
	1. Obsidian vault, linking, refactoring, consistency
	2. Detail for idea generation
5. text based RPG
	1. LLM scaffolding, dynamic content that responds to weather/time.
6. Conclusion
	1. Accessibility
	2. Note on about unsharability


The Lands Apart is an open world TTRPG fantasy setting I've been iterating on over the last couple of years. It was born out of COVID, I had been running campaigns with friends at the time and wanted to try my hand at a truly open world setting where players could go anywhere at any time, and I'd always have content prepared in advance, and answers to any question that comes up.

The setting was largely inspired by Elden Ring and was blown away by how much work went into the world building. I've never seen a game that requires the player to study architectural styles and plant cultivation techniques to piece together major historical events. Every asset in the game has had so much thought put into it, and I wanted to see what what would happen if I tried to apply the same level of obsessive detail in my own setting.

So, I made Lands Apart, and it definitely has a lot of detail. As of 2025 I've made:

- 320,000 words of notes.
- A google-maps like site for navigating the map. It has weather, time zone, and travel modeling tools.
- 200+ points of interest to explore.
- 40,000 years of history.
- 16 religions.
- 80 session outline for the main quest, 7 major side quests

For your own sanity I will avoid talking about the specifics of the world. Although I'd love to blab on about my homebrew D&D setting, it's not the most useful and doesn't make for a good blog post. Instead I'll be covering what it takes to create and manage a project of this scale, and some key takeaways.

# Idea generation at scale

This is fairly common writing advice, but I'm going to emphasize it because it becomes absolutely critical for a project like this. You need to start with a theme or idea you are interested in exploring more deeply. It needs to be a theme that you're excited to examine from dozens of angles over a long period of time, and is fractal-like in detail.

I emphasize this because it's very easy to approach worldbuilding one quest or city at a time, letting it grow organically. And you should do some of that, but if you want everything to mesh it helps to have a high level theme that ties it all together. If you don't, you lose consistency and things clash.

The theme for Lands Apart is religion. As someone who was raised atheist, and rarely interacted with religious people growing up, I was realizing that I had an underdeveloped idea about what religion means to people and how it can shape who you are. Lands Apart is an exploration of beliefs, higher purposes, and how people deal with conflicting ideals.

Specifically, I wanted to explore how belief changed in the messy ambiguity of the real world. I wanted to set up a bunch of cultures, and have their beliefs challenged - to see what happens when those ideals bend or break.

Having a theme like this is so helpful, because it means any thought you have about the core theme can be translated into content. And it's much easier to think about a topic you're already interested in than asking yourself "what would be interesting here?"

The overarching structure of the world came up very naturally from this thinking. I knew I'd need a multiple countries with wildly different cultures that are in tension with one another. They all desire for unity but have become fragmented (hence the name, Lands Apart).

This is not just for thematic consistence, there's also a much more practical benefit. One highly useful bit of writing advice I keep coming back to, is that you'll always struggle to ever come up with a list of more than 10 interesting things. So if you need more than 10 interesting things, make lists of lists. So if I were to start and try to fill out 200 points of interest on a map, it all would have been incredibly generic. So instead I made a list of religions, broke each of those into several perspectives, broke those into ideas, and broke those down into people, places, and quests that embodied and explored them.

# The Map

I'm a big fan of a good [map](https://www.youtube.com/watch?v=J5iJSXaVvao), my favorite thing to do in games like Minecraft is to travel around mapping out all the cool terrain formations. So of course I took the maps for the Lands Apart very seriously. And as the primary visual for what the world looks like, I wanted to make sure it was visually interesting and useful for gameplay purposes.

I also wanted to use it to communicate the scale. I plan to only show small subsections of the world when players start and slowly reveal more.

And finally, I want the map to hook in players. Making an area that looks exciting or unusual is a great way to get players interested in exploring. I try to have major world events legible on the map because they raise good questions. Like what are the four triangle symbols? Why is the compass rose in the middle of an island? Why is there a weird purple forest?

Here's the full map rendered at 1/2 resolution. You might want to right click and open in new tab so you can zoom in and see all the detail.

![](assets/landsapart-bigmap.jpeg)

(btw when rendering at a lower res some of the positions get shifted weirdly, if you zoom in you'll def see some alignment issues)

There's also a second map for some secret areas, but I won't show it here because spoilers. But just imagine a few more continents worth of stuff that aren't shown.

## Creating the map

Creating and managing a huge map over time can be challenging since you may need to go back and make little edits, or tweak colors. These are scenarios where nondestructive editing processes are super useful. In this case I used Substance Designer. It's basically an image editor but instead of modifying image layers you build a computation tree that applies the edits for you.

There’s a few key benefits to doing it this way:
1. You can dynamically change the resolution you render at, so you can make edits quickly at 1024x1024 resolution, then do the final render at very high resolutions 
2. It’s very easy to change things with complex dependencies. I have a single grayscale bitmap showing where land is. If I want to tweak a coastline I change a single bitmap and all the colors, coastline waves, trees, and mountains will adjust accordingly.
3. Editing images by building out an abstract syntax tree actually feels pretty natural for me.

I pushed Substance to it's limits with this map. The final render produces an image of size 16384x16384, roughly the size of 32 4K images. It takes ~80GB of RAM to render, but the size is kind of necessary to be able to read the place names.

I hand painted the coastlines, rivers, and biomes, but all the shading, coloring, and text was added by a very complicated substance pipeline.

(Show substance graph)

I also made an interactive version of the map. This is a webpage that shows the map, plus a bunch of information about weather forecasts, time zones, and pins at various points of interest. I had to write my own time zone libraries, as well as some custom weather simulations that take the climates of reach region into account. But here's how the map looks in the UI:

![](assets/landsapart-interactive.png)

# Note Management

With over 1,100 files, managing the notes for this project has not been easy. But thankfully I had recently picked up [Obsidian](https://obsidian.md/). It's a truly wonderful product and I use it for personal notes, at work, and even for writing this post right now. It's a dead simple markdown editor with some plugins to let you customize how everything works. 

Since it required to share whenever talking about Obsidian, here's my file graph for the Lands Apart:


![](assets/Pasted%20image%2020260110185147.png)

To manage all this is quite difficult, making a change is less about adding a new note, and more becoming an expert at finding all the stuff that needs to be changed because of it. Like if I want to change a character's motivation, I need to make sure that character's note is updated, but also anywhere that trait is mentioned. This could include notes about locations, quests, or other characters.

Some software engineering principles become useful here, keeping notes modular is great. You have fewer files to update when each idea is self-contained. Although this is a good principle, in practice it can be difficult. If it's going to feel like a real world, things need to affect one another. This is where links can help. In general, if one file affects another, you need to link to it. That way you can follow the backlinks whenever making changes to check for consistency. This makes all the inter-note dependencies explicit.

If your notes are well maintained, you'll naturally find yourself filling in gaps. It makes it really easy to go around and add little details. Like the notes for my countries are patterned after Wikipedia, this means they include lots of silly stuff. Here's an example of one country's info card:

> **Name:** Penrith
> **Capital:** Arkstead
> **Language:** English
> **Religion:** Prismatic Order
> **Demonym:** Penrithian
> **Government:** Prismatic Kingdom, feudal
> **Area:** 93,389 sq. mi habitable, 280,167 total
> **Population:** 8,870,00
> **GDP:** 289 billion (40,000 per capita)
> **Motto:** Her Brilliance shines in us, and in all things.
> **Time Zone:** PEN (+12)
> **Biomes:** Temperate forest / mountains
> **Demographics:**
> -  **Penrithian:** 72%
> - **Shaskonese:** 13%
> - **Lycanin:** 8%
> - **Marithian:** 3%
> - **Vatichian:** 2%
> - **Aralian:** 1%
> **National Symbols:**
> - **National Bird:** Mistral Dove
> - **National Animal:** Deer
> - **National Flower:** Alpine Gentian
> - **National Insects:** Citrine Butterflies
> - **National Tree:** Silver Oak
> - **National Colors:** White, blue, silver

To answer your question: yes, I did actually pick national flowers for all the countries. This was part of the overall philosophy of the project, the goal is to treat this place as if it were real. I didn't want to ignore those little cultural things just because they weren't gameplay relevant. I think having these details are what make the world feel real.

To give a concrete example on how this is beneficial, I have like ~1000 words on the different designs on coins and how they've changed over time. Is this level of detail necessary? Absolutely not. But when you have to decide what a coin looks like it forces you to answer a lot of other important questions, like:

1. Who is minting the coins?
2. Do different areas use different currencies?
3. What icons and symbols do the people minting the coins want to reinforce with their designs.

These answers aren't important to gameplay but are important for a world making sense. For example, in Lands Apart, one of the major countries collapsed a few decades ago. So players are unlikely to hear about it often. But because their coins are still in circulation, a player might get lucky andy find one of these out of mint coins. They can be sold for a bit more than their face value, and in the process they can learn a bit about the fallen country just by looking at the iconography.

The benefit of being detailed in general is that the marginal cost of adding more detail approaches zero quite quickly. Like with the coins, I already knew the iconography the fallen country associated with, so it only took a few minutes to pick the design. Most details don't add new information, they're just rephrasing existing information and making everything more consistent.

# The text based adventure game

I'd like a way for this setting to reach more people, given the amount of time I've invested to it I figured I could try to make it more accessible.

So I've been chipping away at making a text based adventure game in this setting. I'm not the best at writing prose, so it's taking a while but I'm slowly getting better.

I'm still at the phase where I'm constantly getting sidetracked by adding new features to my bespoke text based game engine, but it's very cool, at some point I may add a separate post just about how it works. But the main power of the system I've built is making dynamic content that adjusts based on weather, time of day, player skills, etc. and of course, the weather and time of day logic was pulled from the interactive map.

I've also set up some tools to leverage LLMs to help scaffold out the dialog and navigation trees based on my notes, which is super helpful given the sheer quantity of content that needs to be adapted. Plus, dialog trees are very repetitive. I’ve considered building custom dialog editing tools to make it faster but tbh, LLMs fill that gap very well and are helpful when I decide to change the dialog format and need to update hundreds of lines of dialog to the new system in a nontrivial way.





# Gameplay

Having a hugely detailed world needs to be integrated into the story and gameplay. Mostly because I want it to be rewarding to pay attention to what's going on. The story need to not require the player to have an encyclopedic knowledge about the world, but also not be inconsequential.

This was the trickiest part, it's easy to make a needlessly detailed world, but carving a coherent story out of it can be difficult. It took Tolkien a couple books to find the right balance of world building and story and I now have a much deeper appreciation for why.

My main takeaway from this whole process was to find the path through the world for the players to traverse. Start super small and slowly expand their world. you can introduce bigger ideas and conflict, but don’t expect the players to buy in without a reason. Map out story beats and make notes for when a concept is introduced, and when it’s necessary for the players to understand it to progress. Make sure ideas are paced well.

The part I definitely struggle with the most is to let a thing be simple. Since I have a ton of knowledge behind all the little details, I want to present them in that way. So if players ask about some world events, I’ve learned that I need to be okay with making it appear simpler than it is if it’s not the focus right now. If everything is crazy intricate, it becomes hard to direct attention to any of it.

Too much detail can be extra problematic because of how sensitive players are to where the “intended path” is, and will try to follow cues from the DM for who to talk to and what to direct attention towards. It can be disorienting if every NPC sounds important, or a random bit of history is explained in great detail. Players will assume they’re meant to act on it.

I remember that the devs of Firewatch (great game btw) would use visual detail to direct players. To draw players to a rock and let them know they could climb up it, they would make that edge of the rock have lots of little cracks and details. I believe this concept extends to descriptions in TTRPGs


[screenshot]
# About
Completed over the course of two days as a code sample for a potential internship with Arka for Spring 2017.
Uses the Milton-Bradley rules I found on Wikipedia.

# Technologies
- Meteor.js (1.4.1.2)
- Blaze Templating
- SCSS Preprocessor (fourseven:scss package)
- FlowRouter (kadira:flow-router package)
- BlazeLayout (kadira:blaze-layout package)

# How it works
A player hits the 'new game' button to create a new game on the database. The UI then routes to a page to play this game.
The link is static and will exist until the game is deleted from the database. The game is also only supported between
one human player and one computer player. The human player sets his board (the computer board was set randomly) and then
the game continues one attack after the other until one player's ships are all destroyed (copmuter makes attacks randomly).

# Notes
I wrote this over Saturday and Sunday, so it's not the most optimal and there are a few graphical glitches, but I feel
it is a solid representation of my web skills and knowledge of Meteor / Mongo.

Because of how Blaze renders, I had to create a boolean that only got checked when the game was complete, instead of just
existing state variable, since Blaze would prerender the template with a truthy value or something and "flash" the
computer board to the player.

# Requirements
- [x] 2 players (Sorta)
- [x] 2 grids
- [x] Multiple ships in play at the beginning
- [x] Players take turns (Live player always goes first)
- [ ] Attack states
  - [x] Hit
  - [x] Miss
  - [x] Already Taken
  - [ ] Sunk
  - [x] Win
# Technologies
- Meteor.js
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

Sometimes the screen flashes when making an attack, letting you see where the enemy ships are.

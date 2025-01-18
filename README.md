Memento DB on Android is probably the best database application I've found for the platform, but it has a lot of shortcomings. 
It's easy to add or edit entries with the tasker plugin, and searching for and retrieving your information from within the GUI works well. 
Unfortunately, there isn't a way(that I am aware of) to have another application request an entry, or entries, and get data back out of Memento without dealing with the GUI. 

It has a built in JavaScript engine, but it's built on Rhino(Mozilla Java JS engine), so a lot of modern things are missing, and, the JavaScript API that the developers made to interact with Memento libraries and entries is not idiomatic at all, it is truly clunky to work with.

I aim to solve all of those problems! 

I have made a set of polyfills, and functions that wrap/extend the Memento objects to behave naturally, like being able to address an entries object as an array, or assign properties without using awkward helper functions. 

https://mementodatabase.com

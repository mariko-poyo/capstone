## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Multiple charts are updated with random number in real time.
* Allow user to switch graphs for multiple boards as a tag.

**TODO:**
* ~Find a proper way for showing multiple charts at same time (Done ??)~
* ~~Use socket.io to perform realtime update.~~
* Interaction Buttons **(more!)**
* Chart list **(Debugging)**
* ~~Warning messages~~
* Dashboard
* Set default value of points of graph 
* Show real temperature instead of random number

#### Opened Issues:
* Child processes in back-end cannot detect connection close on GUI and are kept survive. (should be killed)

## Note:
* if ELIFECYCLE error appears on "npm start", it means someone else is using those ports. So modify APP_PORT in
app.js and default 3000 port in ./bin/www to some other ports and the problem should be resolved.

**Setup**
``` bash
   npm install // Install all modules in package.json
   npm start   // Run server
```

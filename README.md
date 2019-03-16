## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Prepare to change inter_client to use a fsm to intepret message from server(app.js)

**TODO:**
* ~~Find a proper way for showing multiple charts at same time~~
* ~~Use socket.io to perform realtime update.~~
* Interaction Buttons **(more!)**
* ~~Chart list~~
* ~~Warning messages~~
* Dashboard
* ~~Set default value of points of graph~~ 
* ~~Show real temperature instead of random number~~
* ADD 10.1.2.166 port 7 to P1

#### Opened Issues:
* The graph will resize it's axis to just fit for existing data and looks really bad.
* implement an fsm for inter_client to handle messages from app.js
* the way we store config is that we always push a new config at end of configs array(in Draw.js). However, when we index them, we use
  the actual board index (in socket.js line15). Need to modify the way config gets stored in configs array. (haiqi)


#### Note:
* if ELIFECYCLE error appears on "npm start", it means someone else is using those ports. So modify APP_PORT in
app.js and default 3000 port in ./bin/www to some other ports and the problem should be resolved.

**Setup**
``` bash
   npm install    // Install all modules in package.json
   npm start      // Run server
   npm p_process  // Run p_process
   npm sim        // Run board simulator
```

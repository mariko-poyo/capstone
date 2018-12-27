## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Chart can be updated by start a random update interval in ``updateInterval`` ms. 
* Due to unsolved file accessing bug, socket.io queries are currently all 404.
* Values over ``warningCap``  will trigger an alert on page during interval.
* Max points showed on chart is user defined by ``maxItem``.

**TODO:**
* Find a proper way for showing multiple charts at same time
* Use socket.io to perform realtime update.
* Interaction Buttons **(more!)**
* Chart list **(Debugging)**
* ~~Warning messages~~
* Dashboard
* ...

#### Opened Issues:
* Node Module accesses 404 still exist. Need to solve ASAP.


**Setup**
``` bash
   npm install // Install all modules in package.json
   npm start   // Run server
```

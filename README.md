## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Completed most part of protocal handling
* Revised sim_board interface to fit in new protocol
* Updated setInterval logic in frontend and socket.io logic. Now client will do less polling while server is offline.
* P_process is renamed to DCA. Add reconnect routine for offline boards, and implement interface for multi-board proxy dict.
* Implement reset and memory reading interface to frontend. Need to improve further.
* Board_data.json updated.
* Navigation bar is working now.

**Current Commit:**
* Memory operations are now generally working. Functionalities are fully implemented for backend.
* Set suggestedMax/Min from 40 to 75 for y-axis in board chart.
* Fixed some of the terminal output format. Reduced log.


**TODO:**
* Finish protocol for setThreshold.
* ~Memory operation interface on frontend.~ Improve for long read/write memory operations.
* Complete command log logic.
* History page design.
* Time chart and dashboard should handle offline events.
* Implement more error checking.
* Remove tracking board button in control panel.
* Simplify current terminal output.
* **Improve CSS**

#### Opened Issues:
* Cannot edit properties of x-axies ticks. Need to reformat time, limit range for first 10 values, and larger font size.
* CSS looks really bad for less resolution web page. 
* Wish to enable cookies to save tracking list. Should be pretty easy, but low priority.



#### Note:
* If ELIFECYCLE error appears on "npm start", it means someone else is using those ports. So modify APP_PORT in
app.js and default 3000 port in ./bin/www to some other ports and the problem should be resolved.
* Now sim_board receives 2 params in commandline. [host, port] **No default value**. 
* Port polling in DCA is turned off at current stage for debugging. So make sure sim_board or real board is online before DCA running.

**Setup**
``` bash
   npm install                      // Install all modules in package.json
   npm start                        // Run server
   npm run DCA                      // Run DCA
   npm run sim --host --port        // Run board simulator
```

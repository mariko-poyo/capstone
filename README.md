## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Memory operations are now generally working. Functionalities are fully implemented for backend.
* Set suggestedMax/Min from 40 to 75 for y-axis in board chart.
* Fixed some of the terminal output format. Reduced log.

**Current Commit:**
* Finished protocol for setThreshold.
* Improved logic for multiple clients.
* Implemented more error checking and simplified current terminal output.


**TODO:**
* ~Memory operation interface on frontend.~ Improve for long read/write memory operations.
* Complete command log logic.
* History page design.
* Time chart and dashboard should handle offline events.
* Find a way better than using alert for warning messages.
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

**Setup Checklist**
* Uncomment reconnect logic
* Enable reset command
* Check DCA routine interval to be 1s
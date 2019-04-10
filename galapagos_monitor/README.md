## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Last Commit:**
* Improved alert event logic. Now email event will be trigger once per overheated event, 
page pop up event will happen every 30 sec.
* Separated button functions from ./public/javascript/socket.js to a new file: ./public/javascript/Button.js 
* Fixed bug on sorting database timestamp. Now timestamp format is YYYY MM DD, hh:mm:ss.
* Implemented protocol and function for setting email alert cap value.
* Removed useless files and comments.
* Implemented offline check for board table and overview/board chart.

**Current Commit:**
* Improved offline check related logic.
* Now a raw history page will show after clicking the navi bar
* Cleaned up some code. Not all.
* Implemented a very ugly favico.
* Revised timeout to 5s.
* Set a more reasonable range for y-axis in temperature chart.


**TODO:**
* **Improve CSS**
* ~Memory operation interface on frontend.~ Improve for long read/write memory operations.
* Find a way better than using alert for warning messages.
* Implement more error checking.
* Remove tracking board button in control panel
* Cookies for current setting saving
* Output error log to log file
* Simplify current terminal output


#### Opened Issues:
* Cannot edit properties of x-axies ticks. Need to reformat time, limit range for first 10 values, and larger font size.
* ~CSS looks really bad for less resolution web page.~
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
* Uncomment reconnect logic in DCA 
* Enable reset command in DCA
* Check DCA run.js - temperature routine interval to be 1s
* Check socket.js - socket.io server address to external IP
* Check DCA run.js - Mail alert receiver(s)
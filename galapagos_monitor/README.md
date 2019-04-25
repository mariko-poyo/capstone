## Galapagos Monitor

Monitor application for tracing client board status under Galapagos. 
Updating...

**Setup**
* MongoDB setup: Follow the steps on [MongoDB Download](https://docs.mongodb.com/manual/administration/install-community/). Install packages.

   ***For Linux***
   ``` bash
   sudo service mongod status | restart | stop
   ```
   ***For Window***
   - run services.msc and check status of MongoDB

* Node.js setup: [Node.js Download](https://nodejs.org/en/) Add node to sys env.

``` bash
   npm install                      // Install all modules in package.json
   npm start                        // Run server
   npm run DCA                      // Run DCA
   npm run sim --host --port        // Run board simulator
```

**Setup Checklist**
* Check DCA run.js - temperature routine interval to be 1s
* Check socket.js - socket.io server address to external IP
* Check DCA run.js - Mail alert receiver(s)

**Last Commit:**
* Improved offline check related logic.
* Now a raw history page will show after clicking the navi bar
* Cleaned up some code. Not all.
* Implemented a very ugly favico.
* Revised timeout to 5s.
* Set a more reasonable range for y-axis in temperature chart.

**Current Commit:**
* Further cleaning
* Implemented remove tracking button and revised chart color logic.
* Implemented simple cookies. Need to be improved for reopening tracking list
* Implemented config file for backend. Will work on frontend javascript soon. 


**TODO:**
* **Improve CSS**
* ~Memory operation interface on frontend.~ Improve for long read/write memory operations.
* Find a way better than using alert for warning messages.
* Implement more error checking.
* ~Remove tracking board button in control panel~
* ~Cookies for current setting saving~
* Output error log to log file
* Simplify current terminal output


#### Opened Issues:
* Cannot edit properties of x-axies ticks. Need to reformat time, limit range for first 10 values, and larger font size.
* Tab does not have limit and replacement logic at this moment. If there are too many tracked boards, the table tab may have something wrong.
* Time zone issue for offline logic.



#### Note:
* If ELIFECYCLE error appears on "npm start", it means someone else is using those ports. So modify APP_PORT in
app.js and default 3000 port in ./bin/www to some other ports and the problem should be resolved.
* Now sim_board receives 2 params in commandline. [host, port] **No default value**. 
* Port polling in DCA is turned off at current stage for debugging. So make sure sim_board or real board is online before DCA running.
* Admin mailbox: 
   ```
   ac: GalapagosMonitor@gmail.com
   pw: Galapagos496
   ```


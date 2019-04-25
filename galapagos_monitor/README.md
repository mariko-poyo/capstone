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
* Check ./config/default.json - some environment variables you need to know and set for new environment. For further use of config function, check [npm config](https://www.npmjs.com/package/config).
* Check socket.js:1 - make sure socket.io server address to correct server address. May need external IP.

**Important files**
* DCA/run.js - Database and Communication Agent. Modify this file if you want to change the protocol between the server and the FPGA, or anything backend related
* config/default.json - Various configurations. E.g. connection time out intervals, database address, website address, etc.
* public/* - Front end Javascripts and CSS. The Javascripts contain the logic that happens when users interact with the website, and the CSS defines parameters of the HTML elements
* views/* - Describes the layout of the website using the [Pug template engine](https://pugjs.org/api/getting-started.html). Modify files here to change the layout/UI of the website
* app.js - Core logic of the frontend web server, connects the frontend with the backend(DCA)
* sim_board/run.js - Script that runs simulation boards. Run this to simulate an FPGA on the cloud. It only replies to temperature queries for now
* board_data.json - List of FPGA boards, including real ones and simulated ones. Add new boards here by assigning it a name and ID, and providing its IP address and port. **Name and ID for each board should be unique.**

**Example to add a new command to FPGA**

Use code from existing commands as references when writing to database, socket, etc.

1. Add your button (Or other HTML element that triggers the command) in the website layout (e.g. views/index.pug)
   ```
   button#submitNewCmd(type="button",onclick='newCmd()') New Command
   ```

2. Add the logic that executes when the button is clicked (e.g. javascripts/button.js)
   ```
   function newCmd() {
      myparam1 = ...
      myparam2 = ...
      ...
      socket.emit('my new command', name, id, myparam1, ...);
   }
   ```

3. Add your logic in app.js, define new Opcode
   ```
   const BRD_NEW_CMD = 6
   ...
   io.on('connection', function(socket){
      ...
      socket.on('my new command', (name, ID, myparam1, myparam2, myparam3) => {
         // Send BRD_NEW_CMD to DCA
      });
      ...
   }
   ```
4. Define a new protocol code to your new command in DCA, also define Opcode
   ```
      const NEW_CMD = 15         // Last command had ID 14
      const NEW_CMD_ACK = 16
      const NEW_CMD_UACK = 17
      const BRD_NEW_CMD = 6      // Last Opcode was 5
   ```
5. Add your logic in DCA
   ```
   //Logic for receiving packets from FPGA
   BoardNames.forEach(function(board){
      ...
      proxy[board].on('data', (data) => {
         ...
         if (buffer[0] == NEW_CMD_ACK){
            // Do stuff, e.g. write to Database
         }
         if (buffer[0] == NEW_CMD_UACK){
            // Log the error
         }
         ...
      }
      ...
   }
   
   ...
   //Logic for receiving commands from frontend(app.js)
   const commandServer = net.createServer(function(socket){
         ...
         socket.on('data', function(data) {
         ...
         if(packet.opcode === BRD_NEW_CMD) {
            // Construct NEW_CMD packet with format interpretable by the FPGA
            // Send NEW_CMD packet to FPGA
         }
         ...
         }
         ...
      }
   ```

6. Add the logic in the FPGA SDK C code that parses the NEW_CMD packet and sends NEW_CMD_ACK/UACK packets back to DCA.

**Last Commit:**
* Further cleaning
* Implemented remove tracking button and revised chart color logic.
* Implemented simple cookies. Need to be improved for reopening tracking list
* Implemented config file for backend. Will work on frontend javascript soon. 

**Current Commit:**
* Added comments and a rough update_history.md
* Readme.md update.
* Haven't fully tested. But should be ok. Will test again recently.


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
* If ELIFECYCLE error appears on "npm start", it means someone else is using those ports. So modify APP_PORT in app.js and default 3172 port in ./bin/www to some other ports and the problem should be resolved.
* Now sim_board receives 2 params in commandline. [host, port] **No default value**. 
* Admin mailbox: 
   ```
   ac: GalapagosMonitor@gmail.com
   pw: Galapagos496
   ```


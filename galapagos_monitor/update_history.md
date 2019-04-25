**0.0.1** *a662bf3 on Dec 24, 2018*
* Add temporary server

**0.0.2** *296f7db on Dec 26, 2018*
* Modified UI a lottle bit and make the server to be able to communicate with FPGA boards

**0.1.0** *abec7d7 on Dec 27, 2018*
* Chart can be updated by start a random update interval in ``updateInterval`` ms. 
* Due to unsolved file accessing bug, socket.io queries are currently all 404.
* Values over ``warningCap``  will trigger an alert on page during interval.
* Max points showed on chart is user defined by ``maxItem``.

**0.1.2** *388e11c on Dec 29, 2018*
* Fixed 404 bug, removed unused file
* Chart is updated with random number in real time.

**0.1.3** *bcdca35 on Dec 30, 2018*
* Multiple charts are updated with random number in real time.
* Allow user to switch graphs for multiple boards as a tag.

**0.1.4** *4bc9583 on Jan 6, 2019*
* Fixed number of points that appear in each graph.

**0.1.5** *d8e00ea on Jan 9, 2019*
* Let server loads board data from json file
* implement a very simple http request between server and html client

**0.1.6** *94a87b8 on Jan 15, 2019*
* Prepare to change inter_client to use a fsm to intepret message from server(app.js)

**0.1.8** *cf1e011 on Jan 19, 2019*
* Interval logic changed. Email and system notification now work. Other serval minor update.

**0.2.0** *e5a9ef8 on Mar 5, 2019 & 0bfa829 on Mar 17, 2019*
* Updated Overview tab, fixed several bugs, removed useless code.
* Fixed Notifier in app.js
* Rewrote p_process logic
* Improved chart performance
* Designed part of protocol logic. Prepare for future integration.

**0.3.0** *e32ebc7 on Mar 21, 2019*
* Completed most part of protocal handling
* Revised sim_board interface to fit in new protocol
* Updated setInterval logic in frontend and socket.io logic. Now client will do less polling while server is offline.
* P_process is renamed to DCA. Add reconnect routine for offline boards, and implement interface for multi-board proxy dict.
* Implement reset and memory reading interface to frontend. Need to improve further.
* Board_data.json updated.
* Navigation bar is working now.

**0.4.0** *4e0ab67 on Mar 28, 2019*
* Memory operations are now generally working. Functionalities are fully implemented for backend.
* Set suggestedMax/Min from 40 to 75 for y-axis in board chart.
* Fixed some of the terminal output format. Reduced log.

**0.4.1** *dc77a0f on Mar 31, 2019*
* Finished protocol for setThreshold.
* Improved logic for multiple clients.
* Implemented more error checking and simplified current terminal output.

**0.4.3** *c377ebd on Mar 31, 2019*
* Improved alert event logic. Now email event will be trigger once per overheated event, 
page pop up event will happen every 30 sec.
* Separated button functions from ./public/javascript/socket.js to a new file: ./public/javascript/Button.js 
* Fixed bug on sorting database timestamp. Now timestamp format is YYYY MM DD, hh:mm:ss.
* Implemented protocol and function for setting email alert cap value.
* Removed useless files and comments.

**0.5.0** *1daca21 on Apr 10, 2019* 
* Improved offline check related logic.
* Now a raw history page will show after clicking the navi bar
* Cleaned up some code. Not all.
* Implemented a very ugly favico.
* Revised timeout to 5s.
* Set a more reasonable range for y-axis in temperature chart.

**1.0.0** *ffbd68b on Apr 25, 2019* 
* Further cleaning
* Implemented remove tracking button and revised chart color logic.
* Implemented simple cookies. Need to be improved for reopening tracking list
* Implemented config file for backend. Will work on frontend javascript soon. 

**1.0.1** *Current Version* 
* Added comments and a rough update_history.md
* Readme.md update.
* Haven't fully tested. But should be ok. Will test again recently.
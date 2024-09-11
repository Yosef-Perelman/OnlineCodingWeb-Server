# Online Coding Web
## Introduction
This project is the server part of a Fullstack website I created for learning JS for beginners.<br/>
The link to the client is https://github.com/Yosef-Perelman/OnlineCodingWeb-Client.<br/><br/>
The site has basic programming exercises in JS language.<br/>
Feel free to try it here - https://onlinecodingweb.netlify.app.<br/><br/>
The client deployed with Netlify and the server deployed with Heroku.<br/>
The database is in MongoDB, where the data for the exercises is found.<br/>

## Tech Stack
- React.js
- Node.js
- Express.js
- MongoDB
- Socket.io
- Monaco-Editor

## Site Flow
The home page has several links to exercises.<br/>
When a user clicks on one of them - if he is the first to enter the exercise then he is considered the teacher (mentor).<br/>
It has two meanings:<br/>
A. He can't edit the code.<br/>
B. When he leaves the room all the students are immediately taken to the home page.<br/>


When a user enters the room and is not the first then he is considered a student and can edit the code.<br/>


The exercises are sections of code from which keywords have been deleted and the student has to complete them for the code to work.<br/>
When the student succeeds in the task, a notification appears and the code can no longer be changed.

# Online Coding Web
## Introduction
This project is the server part of a Fullstack website I created for learning JS for beginners.<br/>
The link to the client is https://github.com/Yosef-Perelman/OnlineCodingWeb-Client.<br/><br/>
The site has basic programming exercises in JS language.<br/>
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
When the student succeeds in the task, a notification appears and the code can no longer be changed.<br/>


## Pictures:
### Home Page:
![Screenshot 2024-09-11 225825](https://github.com/user-attachments/assets/1182bbac-ae1e-4625-9619-4d37eec6e287)

### Connected as a mentor:
![Screenshot 2024-09-11 225850](https://github.com/user-attachments/assets/2a3f263a-9744-47e2-9223-b84a792b4b38)

### The solution been found:
![Screenshot 2024-09-11 225907](https://github.com/user-attachments/assets/5ba1aa1c-6b79-4eb3-a64e-f4039992ef8d)


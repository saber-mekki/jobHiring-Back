CREATE DATABASE hiring;


CREATE TABLE userTable(
  id SERIAL PRIMARY KEY ,
  login VARCHAR(255),
  phone VARCHAR(255),
  gender VARCHAR(255),
  password VARCHAR(255),
  name VARCHAR(255),
  registerType VARCHAR(255),
  image TEXT
  
);


CREATE TABLE jobTable

(
   jobId SERIAL PRIMARY KEY, 

    email VARCHAR(255),
    companyName VARCHAR(255),
    jobTitle VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(255),
    salary VARCHAR(255),
    jobType VARCHAR(255),
    deadline  DATE,
    description TEXT,
    requirement TEXT,
    resposibilities TEXT,
    field VARCHAR(255)
    logo TEXT

);
CREATE TABLE interviewTable
(
    "jobId" integer, 
    "interviewId" SERIAL PRIMARY KEY, 
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "email" VARCHAR(255),
    "nationality" VARCHAR(255),
    "seekedSalary" VARCHAR(255),
    "phone" VARCHAR(255),
    "jobType" VARCHAR(255),
    "description" TEXT
    
);
CREATE TABLE blogTable
(
    "blogId" SERIAL PRIMARY KEY, 
    "blogAuthor" VARCHAR(255),
    "blogTitle" VARCHAR(255),
    "blogDate" DATE,
    "blogImage" TEXT,
    "blogContent" TEXT
);
CREATE TABLE commentTable
(
    "commentId" SERIAL PRIMARY KEY, 
    "commentAuthor" VARCHAR(255),
    "commentBlogId" integer,
    "commentDate" DATE,
    "commentContent" TEXT,
    "commentAuthorImage" TEXT

);



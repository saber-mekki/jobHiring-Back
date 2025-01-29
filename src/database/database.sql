CREATE DATABASE hiring;


CREATE TABLE userTable(
  id SERIAL PRIMARY KEY ,
  login VARCHAR(255),
  phone VARCHAR(255),
  gender VARCHAR(255),
  password VARCHAR(255),
  name VARCHAR(255),
  registerType VARCHAR(255)
  
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
);

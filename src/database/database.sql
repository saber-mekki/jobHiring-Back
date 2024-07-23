CREATE DATABASE hiring;


CREATE TABLE userTable(
  id SERIAL PRIMARY KEY ,
  login VARCHAR(255),
  phone INTEGER,
  gender VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE jobTable

(
    email VARCHAR(255),
    companyName VARCHAR(255),
    jobTitle VARCHAR(255),
    location: SERIAL PRIMARY KEY,
    phone INTEGER,
    salary INTEGER,
    jobType VARCHAR(255),
    deadline  DATE,
    description VARCHAR(255),
    recuirement VARCHAR(255),
    resposibilities VARCHAR(255),
    field VARCHAR(255)
);

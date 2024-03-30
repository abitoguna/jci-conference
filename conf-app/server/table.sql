create table User(
    id int primary key AUTO_INCREMENT,
    username varchar(255),
    email varchar(50),
    password varchar(255),
    UNIQUE (email)
);

create table Delegate (
    id int primary key AUTO_INCREMENT,
    firstName varchar(255),
    lastName varchar(255),
    email varchar(50),
    phoneNumber varchar(14),
    gender varchar(6),
    membershipType varchar(255),
    localOrganisation varchar(250),
    isRegistered boolean,
    registrationDate datetime,
    UNIQUE (email)
)

insert into User(username, email, password) values('abitoguna', 'abitoguna@gmail.com', 'admin');

{
    "firstName": "Akinbode",
    "lastName": "Abitogun",
    "email": "abitoguna@gmail.com",
    "phoneNumber": "08138354602",
    "membershipType": "JCIN Amb.",
    "gender": "male",
    "localOrganisation": "JCI Oluyole"
}
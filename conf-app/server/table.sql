create table User(
    id int primary key AUTO_INCREMENT,
    username varchar(255),
    email varchar(50),
    password varchar(255),
    UNIQUE (email)
);

create table Delegate (
    id int primary key AUTO_INCREMENT,
    first_name varchar(255),
    last_name varchar(255),
    email varchar(50),
    phone_number varchar(14),
    gender varchar(6),
    membership_type varchar(255),
    local_organisation varchar(250),
    is_registered boolean,
    kit_collected boolean,
    registration_date datetime,
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
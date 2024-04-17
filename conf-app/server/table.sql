create table User(
    id SERIAL primary key,
    username varchar(255),
    email varchar(50),
    team varchar(50),
    password varchar(255),
    UNIQUE (email)
);

create table Delegate (
    id SERIAL primary key,
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
    registeredBy varchar(50),
    isLateRegistration boolean
    isOnlineRegistration boolean
    UNIQUE (email)
);

CREATE TABLE meals (
  meal_id SERIAL PRIMARY KEY,
  delegate_id INT NOT NULL,
  meal_date DATE NOT NULL,
  breakfast BOOLEAN,
  lunch BOOLEAN,
  dinner BOOLEAN,
  FOREIGN KEY (delegate_id) REFERENCES delegates(id)
);

CREATE TABLE config (
    id SERIAL PRIMARY KEY,
    is_serving_meal BOOLEAN,
    meal_type varchar(255),
    banquet_mode BOOLEAN
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

{
    "username": "abitoguna",
    "email": "abitoguna@gmail.com",
    "team": "registration",
    "password": "Admin123"
}
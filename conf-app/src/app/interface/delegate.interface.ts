import { Meal } from "./meal.interface";

export interface Delegate {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    localOrganisation: string;
    membershipType: string;
    isRegistered: boolean;
    kitCollected: boolean;
    registrationDate: string;
    isLateRegistration: boolean;
    registeredBy: string;
    meals: Meal[]
}
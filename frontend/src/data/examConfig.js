/**
 * EASA ATPL(A) Exam Configuration
 * 
 * This file contains the configuration for exam mode with the 
 * standard structure of EASA ATPL(A) exams including the
 * number of questions and time allocated for each subject.
 */

const examConfig = {
  // Air Law
  "010": {
    questions: 44,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Aircraft General Knowledge (Airframe and Systems)
  "021": {
    questions: 80,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Instrumentation
  "022": {
    questions: 60,
    timeInMinutes: 90,
    passingPercentage: 75
  },
  // Mass and Balance
  "031": {
    questions: 25,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Performance
  "032": {
    questions: 35,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Flight Planning
  "033": {
    questions: 43,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Human Performance
  "040": {
    questions: 48,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Meteorology
  "050": {
    questions: 84,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // General Navigation
  "061": {
    questions: 60,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Radio Navigation
  "062": {
    questions: 66,
    timeInMinutes: 90,
    passingPercentage: 75
  },
  // Operational Procedures
  "070": {
    questions: 45,
    timeInMinutes: 75,
    passingPercentage: 75
  },
  // Principles of Flight
  "081": {
    questions: 44,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Communications
  "090": {
    questions: 34,
    timeInMinutes: 60,
    passingPercentage: 75
  }
};

export default examConfig;

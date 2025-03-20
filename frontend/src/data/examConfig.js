/**
 * EASA ATPL(A) Exam Configuration
 * 
 * This file contains the configuration for exam mode with the 
 * standard structure of EASA ATPL(A) exams including the
 * number of questions and time allocated for each subject.
 */

const examConfig = {
  // Air Law
  "AL": {
    questions: 44,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Aircraft General Knowledge
  "AGK": {
    questions: 80,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Instrumentation
  "INST": {
    questions: 60,
    timeInMinutes: 90,
    passingPercentage: 75
  },
  // Mass and Balance
  "MB": {
    questions: 25,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Performance
  "PERF": {
    questions: 35,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Flight Planning and Monitoring
  "FPM": {
    questions: 43,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Human Performance
  "HP": {
    questions: 48,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Meteorology
  "MET": {
    questions: 84,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // General Navigation
  "GNAV": {
    questions: 60,
    timeInMinutes: 120,
    passingPercentage: 75
  },
  // Radio Navigation
  "RNAV": {
    questions: 66,
    timeInMinutes: 90,
    passingPercentage: 75
  },
  // Operational Procedures
  "PROC": {
    questions: 45,
    timeInMinutes: 75,
    passingPercentage: 75
  },
  // Principles of Flight
  "POF": {
    questions: 44,
    timeInMinutes: 60,
    passingPercentage: 75
  },
  // Communications
  "COMM": {
    questions: 34,
    timeInMinutes: 60,
    passingPercentage: 75
  }
};

export default examConfig;

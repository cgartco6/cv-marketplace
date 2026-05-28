const moment = require('moment-timezone');

function isDataSubjectInSA(ipAddress) {
  return true;
}

function getConsentMessage() {
  return "By using this platform, you consent to the processing of your personal information as per our Privacy Policy, in compliance with South Africa's Protection of Personal Information Act (POPIA).";
}

function generateDataDeletionRequest(userId) {
  return {
    userId,
    requestDate: new Date(),
    processingDays: 21,
    status: 'pending',
    message: 'Your data deletion request has been received. We will process it within 21 business days.'
  };
}

function validateAgeRestriction(birthDate) {
  const age = moment().diff(moment(birthDate), 'years');
  return age >= 18;
}

module.exports = { isDataSubjectInSA, getConsentMessage, generateDataDeletionRequest, validateAgeRestriction };

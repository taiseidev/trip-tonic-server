/* eslint-disable */
import { onRegist, onHttps, onCall } from './firebase';

// File Name
const SET_CUSTOM_CLAIMS = 'setCustomClaims';
const REQUEST_CHAT_GPT = 'createStory';
const UPDATE_NOTIFICATION_READ_STATE = 'updateNotificationReadState';
const UPDATE_ANNOUNCEMENT_READ_STATE = 'updateAnnouncementReadState';
// const CREATE_MAKERS = 'createMakers';

export const setInitCustomClaims = onRegist(SET_CUSTOM_CLAIMS);
export const createStory = onHttps(REQUEST_CHAT_GPT);
// export const createMakers = onRun(CREATE_MAKERS);
export const updateNotificationReadState = onCall(UPDATE_NOTIFICATION_READ_STATE);
export const updateAnnouncementReadState = onCall(UPDATE_ANNOUNCEMENT_READ_STATE);

/* eslint-disable */
import { onRegist, onHttps } from './firebase';

// File Name
const SET_CUSTOM_CLAIMS = 'setCustomClaims';
const REQUEST_CHAT_GPT = 'requestChatGpt';

export const setInitCustomClaims = onRegist(SET_CUSTOM_CLAIMS);
export const requestChatGPT = onHttps(REQUEST_CHAT_GPT);

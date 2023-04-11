/* eslint-disable */
import { onRegist, onHttps } from './firebase';

// File Name
const SET_CUSTOM_CLAIMS = 'setCustomClaims';
const REQUEST_CHAT_GPT = 'createStory';
// const CREATE_MAKERS = 'createMakers';

export const setInitCustomClaims = onRegist(SET_CUSTOM_CLAIMS);
export const createStory = onHttps(REQUEST_CHAT_GPT);
// export const createMakers = onRun(CREATE_MAKERS);

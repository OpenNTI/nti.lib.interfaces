import getVideoId from 'get-video-id'; //Has way more URL coverage than our old RegEx patterns.

const PROTOCOL_LESS = /^\/\//i;

export const ensureProtocol = x => (PROTOCOL_LESS.test(x) ? `http:${x}` : x);

export const getVideo = x => getVideoId(ensureProtocol(x));

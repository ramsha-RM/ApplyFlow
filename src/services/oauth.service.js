import {
  discovery,
  buildAuthorizationUrl,
  authorizationCodeGrant,
  randomState,
  randomNonce,
} from "openid-client";

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_CALLBACK_URL,
};      

const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_CALLBACK_URL,
};

let googleConfiguration = null;
let linkedinConfiguration = null;

export const getGoogleConfiguration = async (callbackUrl, expectedStates) => {
  if (googleConfiguration) {
    return googleConfiguration;
  }

  googleConfiguration = await discovery(
    new URL("https://accounts.google.com"),
    googleConfig.clientId,
    googleConfig.clientSecret
  );

  return googleConfiguration;
};

export const getLinkedInConfiguration = async (callbackUrl, expectedStates) => {
  if (linkedinConfiguration) {
    return linkedinConfiguration;
  }

  linkedinConfiguration = await discovery(
    new URL("https://www.linkedin.com"),
    linkedinConfig.clientId,
    linkedinConfig.clientSecret
  );

  return linkedinConfiguration;
};

export const createGoogleAuthorizationUrl = async () => {
  const config = await getGoogleConfiguration();

  const state = randomState();
  const nonce = randomNonce();

  const authorizationUrl = buildAuthorizationUrl(config, {
    redirect_uri: googleConfig.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
  });

  return {
    url: authorizationUrl.toString(),
    state,
    nonce,
  };
};

export const createLinkedInAuthorizationUrl = async () => {
  const config = await getLinkedInConfiguration();

  const state = randomState();
  const nonce = randomNonce();

  const authorizationUrl = buildAuthorizationUrl(config, {
    redirect_uri: linkedinConfig.redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
    nonce,
  });

  return {
    url: authorizationUrl.toString(),
    state,
    nonce,
  };
};

export const exchangeGoogleCode = async (code, expectedState) => {
  if (!code) {
    throw new Error("Google authorization code is required");
  }

  if (!expectedState) {
    throw new Error("Google OAuth state is required");
  }

  const config = await getGoogleConfiguration();

  const tokens = await authorizationCodeGrant(
    config,
    new URLSearchParams({
      code,
    }),
    {
      expectedState,
    }
  );

  return tokens;
};

export const exchangeLinkedInCode = async (code, expectedState) => {
  if (!code) {
    throw new Error("LinkedIn authorization code is required");
  }

  if (!expectedState) {
    throw new Error("LinkedIn OAuth state is required");
  }

  const config = await getLinkedInConfiguration();

  const tokens = await authorizationCodeGrant(
    config,
    new URLSearchParams({
      code,
    }),
    {
      expectedState,
    }
  );

  return tokens;
};
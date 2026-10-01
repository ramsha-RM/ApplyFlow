import * as oidc from "openid-client";
import jwt from "jsonwebtoken";

import User from "../models/auth.model.js";
import { getGoogleConfig } from "../config/google.js";

export const googleLogin = async (req, res) => {
  try {
    const config = await getGoogleConfig();

    const codeVerifier = oidc.randomPKCECodeVerifier();

    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const state = oidc.randomState();

    const authorizationUrl = oidc.buildAuthorizationUrl(config, {
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      scope: "openid profile email",
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    res.cookie("google_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    return res.redirect(authorizationUrl.href);
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start Google login",
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const config = await getGoogleConfig();

    const codeVerifier = req.cookies.google_code_verifier;
    const savedState = req.cookies.google_oauth_state;

    if (!codeVerifier || !savedState) {
      return res.status(400).json({
        success: false,
        message: "OAuth session expired",
      });
    }

    const currentUrl = new URL(
      `${process.env.GOOGLE_REDIRECT_URI}?${new URLSearchParams(req.query)}`,
    );

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });

    res.clearCookie("google_code_verifier");
    res.clearCookie("google_oauth_state");

    const claims = tokens.claims();

    if (!claims?.sub || !claims?.email) {
      return res.status(400).json({
        success: false,
        message: "Google account information is incomplete",
      });
    }

    const googleId = claims.sub;
    const email = claims.email;
    const name = claims.name || "Google User";
    const picture = claims.picture || "";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        provider: "google",
        role: "candidate",
      });
    } else {
      if (user.provider === "local") {
        return res.status(400).json({
          success: false,
          message: "Email is already registered with a different provider",
        });
      }

      user.googleId = googleId;
      user.profilePicture = picture;

      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${encodeURIComponent(
        token,
      )}`,
    );
  } catch (error) {
    console.error("Google callback error:", error);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
export const register = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const normalizedRole = ["candidate", "employer"].includes(role)
      ? role
      : "candidate";

    const newUser = new User({
      name,
      email,
      password,
      role: normalizedRole,
      company,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide credentials!",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    console.error("Get me error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userSchema } from "../database/models/usersSchema.ts";
import { getDb } from "../database/mongodb.ts";
import { loginSchema, signupSchema } from "./validationSchema.ts";
import type { AuthenticatedRequest } from "../routes/routes.ts";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const COOKIE_NAME = "auth_token";

/* -------------------------- SIGNUP CONTROLLER -------------------------- */
const signupController = async (req: Request, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Users = db.models.users || db.model("users", userSchema);

    const parsed = signupSchema.safeParse(req.body.userData);
    if (!parsed.success) {
      const invalid = parsed.error.issues.map((issue) => issue.path.join("."));
      return res.status(400).json({
        success: false,
        message: `Invalid input: missing or invalid fields ${invalid.join(
          ", "
        )}`,
      });
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: "",
    });

    const savedUser = await newUser.save();
    if (!savedUser?._id) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to save user." });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: savedUser,
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

/* -------------------------- LOGIN CONTROLLER -------------------------- */
const loginController = async (req: Request, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Users = db.models.users || db.model("users", userSchema);

    const parsed = loginSchema.safeParse(req.body.loginData);
    if (!parsed.success) {
      const invalidFields = parsed.error.issues.map((issue) =>
        issue.path.join(".")
      );
      return res.status(400).json({
        success: false,
        message: `Invalid input: ${invalidFields.join(", ")}`,
      });
    }

    const { email, password } = parsed.data;

    const user = await Users.findOne({ email });
  
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: user.toJSON(),
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

/* -------------------------- AUTH MIDDLEWARE -------------------------- */
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction
) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided." });
    }

    const decodedData = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.user = decodedData;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/* -------------------------- GET USER CONTROLLER -------------------------- */
const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Users = db.models.users || db.model("users", userSchema);

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found in token.",
      });
    }

    const user = await Users.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully.",
      data: user,
    });
  } catch (error: unknown) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

/* -------------------------- GET ALL-USERS CONTROLLER -------------------------- */
const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // ✅ Initialize DB and Model
    const db = await getDb("quick-chat");
    const Users = db.models.users || db.model("users", userSchema);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found in token.",
      });
    }
    const users = await Users.find({
      _id: { $ne: req.user.userId },
    }).select("-password");
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully.",
      total: users.length,
      data: users,
    });
  } catch (error: unknown) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

export {
  signupController,
  loginController,
  authMiddleware,
  getUser,
  getAllUsers,
};

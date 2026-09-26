import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import generateToken from "../utils/generateToken.js";

const colors = ["#7C3AED", "#8B5CF6", "#A78BFA", "#6D28D9", "#5B21B6"];
const generateInviteCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export const registerOrganization = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = req.body;
  if (!name || !email || !password || !organizationName) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  let inviteCode = generateInviteCode();
  while (await Organization.findOne({ inviteCode })) {
    inviteCode = generateInviteCode();
  }
  const organization = await Organization.create({ name: organizationName, inviteCode });
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  const user = await User.create({ name, email, password, role: "admin", avatarColor, organization: organization._id });
  res.status(201).json({ ...user.toSafeObject(), organizationName: organization.name, inviteCode: organization.inviteCode, token: generateToken(user._id) });
});

export const registerAgent = asyncHandler(async (req, res) => {
  const { name, email, password, inviteCode } = req.body;
  if (!name || !email || !password || !inviteCode) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }
  const organization = await Organization.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
  if (!organization) {
    res.status(400);
    throw new Error("Invalid invite code");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  const user = await User.create({ name, email, password, role: "agent", avatarColor, organization: organization._id });
  res.status(201).json({ ...user.toSafeObject(), organizationName: organization.name, token: generateToken(user._id) });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("organization", "name inviteCode");
  if (user && (await user.matchPassword(password))) {
    res.json({
      ...user.toSafeObject(),
      organizationName: user.organization?.name,
      inviteCode: user.role === "admin" ? user.organization?.inviteCode : undefined,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("organization", "name inviteCode");
  res.json({
    ...user.toSafeObject(),
    organizationName: user.organization?.name,
    inviteCode: user.role === "admin" ? user.organization?.inviteCode : undefined
  });
});

export const getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: "agent", organization: req.user.organization }).select("-password");
  res.json(agents.map((a) => a.toSafeObject()));
});
